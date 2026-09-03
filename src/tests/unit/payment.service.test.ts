import { PaymentService } from '@modules/payments/payment.service';

const mockedOrderModel = {
  findOne: jest.fn(),
  updateOne: jest.fn()
};

jest.mock('@core/database/tenant-database', () => ({
  getTenantModels: jest.fn(() => ({
    OrderModel: mockedOrderModel
  }))
}));

describe('PaymentService MoPayments callbacks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid callback signatures before checking gateway status', async () => {
    const moPaymentsService = {
      checkPaymentStatus: jest.fn(),
      verifyCallbackSignature: jest.fn().mockReturnValue(false)
    };
    const service = new PaymentService(moPaymentsService as never);

    await expect(
      service.handleMoPaymentsCallback('av', {
        gateway_type: 'KBZPAY',
        merchant_ref_id: 'ORD-TEST-001',
        payment_id: 'payment-id',
        signature: 'bad-signature',
        status: 'FAIL'
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'MoPayments callback signature is invalid'
    });

    expect(mockedOrderModel.findOne).not.toHaveBeenCalled();
    expect(moPaymentsService.checkPaymentStatus).not.toHaveBeenCalled();
  });

  it('updates an order after a valid SUCCESS callback is confirmed by MoPayments status API', async () => {
    const moPaymentsService = {
      checkPaymentStatus: jest.fn().mockResolvedValue({
        gatewayType: 'KBZPAY',
        merchantReferenceId: 'ORD-TEST-001',
        paymentStatus: 'SUCCESS',
        token: 'payment-token',
        transactionAmount: 4000
      }),
      verifyCallbackSignature: jest.fn().mockReturnValue(true)
    };
    const service = new PaymentService(moPaymentsService as never);

    mockedOrderModel.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        orderNumber: 'ORD-TEST-001',
        paymentToken: 'payment-token',
        status: 'pending',
        tenantId: 'av'
      })
    });
    mockedOrderModel.updateOne.mockResolvedValue({});

    const result = await service.handleMoPaymentsCallback('av', {
      gateway_service_fee: '400.0000',
      gateway_type: 'KBZPAY',
      merchant_ref_id: 'ORD-TEST-001',
      payment_date: '1788336630852',
      payment_id: 'payment-id',
      platform_service_fee: '0.0000',
      settlement_amount: '3600.0000',
      signature: 'valid-signature',
      status: 'SUCCESS',
      transaction_amount: '4000.0000'
    });

    expect(moPaymentsService.verifyCallbackSignature).toHaveBeenCalled();
    expect(moPaymentsService.checkPaymentStatus).toHaveBeenCalledWith(
      'payment-token',
      'ORD-TEST-001'
    );
    expect(mockedOrderModel.updateOne).toHaveBeenCalledWith(
      { tenantId: 'av', orderNumber: 'ORD-TEST-001' },
      expect.objectContaining({
        paymentGatewayReferenceId: 'payment-id',
        paymentGatewayStatus: 'SUCCESS',
        paymentSettlementAmount: 3600,
        paymentStatus: 'paid',
        paymentTransactionAmount: 4000,
        status: 'processing'
      })
    );
    expect(result).toMatchObject({
      orderNumber: 'ORD-TEST-001',
      paymentStatus: 'paid',
      status: 'SUCCESS'
    });
  });
});
