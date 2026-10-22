import { WalletService } from '@modules/wallets/wallet.service';

const mockedUserModel = { findOne: jest.fn() };
const mockedWalletModel = { findOne: jest.fn(), findOneAndUpdate: jest.fn() };

jest.mock('@core/database/tenant-database', () => ({
  getTenantModels: jest.fn(() => ({ UserModel: mockedUserModel, CustomerWalletModel: mockedWalletModel }))
}));

describe('Admin cash wallet loads', () => {
  const service = new WalletService({} as never, {} as never);
  beforeEach(() => jest.clearAllMocks());

  it.each([0, 99, -100, 150.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid cash amount %s before accessing customer data', async (amount) => {
      await expect(service.adminLoadWallet('tenant-1', 'admin-1', { amount })).rejects.toThrow('whole number of at least 100 MMK');
      expect(mockedUserModel.findOne).not.toHaveBeenCalled();
    }
  );

  it('requires an authenticated tenant admin context', async () => {
    await expect(service.adminLoadWallet('tenant-1', undefined, { amount: 100 })).rejects.toThrow('Tenant admin context is required');
    expect(mockedUserModel.findOne).not.toHaveBeenCalled();
  });

  it('does not change a wallet for a missing customer', async () => {
    mockedUserModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    await expect(service.adminLoadWallet('tenant-1', 'admin-1', { amount: 100, customerEmail: 'missing@example.com' })).rejects.toThrow('Customer account not found');
    expect(mockedWalletModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('credits exact cash and records the admin and note atomically with the balance', async () => {
    mockedUserModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: 'customer-1', firstName: 'Cash', lastName: 'Customer', email: 'customer@example.com' }) });
    mockedWalletModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: 'wallet-1', balance: 100 }) });
    mockedWalletModel.findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: 'wallet-1', balance: 250 }) });

    const result = await service.adminLoadWallet('tenant-1', 'admin-1', { amount: 150, customerEmail: 'customer@example.com', adminNote: 'Receipt 123' });

    expect(mockedUserModel.findOne).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tenant-1', isActive: true, isDeleted: { $ne: true } }));
    const emailFilter = mockedUserModel.findOne.mock.calls[0][0].email as RegExp;
    expect(emailFilter.test('customer@example.com')).toBe(true);
    expect(emailFilter.test('customer@exampleXcom')).toBe(false);
    expect(mockedWalletModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'wallet-1', tenantId: 'tenant-1' },
      {
        $inc: { balance: 150 },
        $push: { transactions: expect.objectContaining({ amount: 150, performedBy: 'admin-1', direction: 'credit', kind: 'admin-adjustment', description: 'Cash wallet load: Receipt 123' }) }
      },
      { new: true }
    );
    expect(result).toEqual(expect.objectContaining({ amount: 150, balance: 250, customerName: 'Cash Customer' }));
  });
});
