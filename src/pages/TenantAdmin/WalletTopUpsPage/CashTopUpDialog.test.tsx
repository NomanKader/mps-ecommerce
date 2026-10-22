import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import { adminApi } from '@features/admin/api/adminApi';
import { CashTopUpDialog } from './CashTopUpDialog';

vi.mock('@features/admin/api/adminApi', () => ({
  adminApi: { listCustomers: vi.fn(), loadCustomerWallet: vi.fn() },
}));

const setup = () => {
  vi.mocked(adminApi.listCustomers).mockResolvedValue([]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onClose = vi.fn();
  const view = render(
    <QueryClientProvider client={client}>
      <CashTopUpDialog onClose={onClose} />
    </QueryClientProvider>,
  );
  const enter = (amount: string) => {
    fireEvent.change(screen.getByRole('combobox', { name: 'Customer email' }), {
      target: { value: 'customer@example.com' },
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Cash amount' }), {
      target: { value: amount },
    });
  };
  return {
    onClose,
    enter,
    cleanup: () => {
      view.unmount();
      client.clear();
    },
  };
};

it('requires a valid email and a whole amount of at least 100 MMK', () => {
  const test = setup();
  try {
    expect(screen.getByRole('button', { name: 'Load wallet' })).toBeDisabled();
    test.enter('99');
    expect(screen.getByRole('button', { name: 'Load wallet' })).toBeDisabled();
    test.enter('150.5');
    expect(screen.getByRole('button', { name: 'Load wallet' })).toBeDisabled();
    test.enter('150');
    expect(screen.getByRole('button', { name: 'Load wallet' })).toBeEnabled();
  } finally {
    test.cleanup();
  }
});

it('credits the exact cash amount and prevents repeat submission while pending', async () => {
  let finish!: (value: Awaited<ReturnType<typeof adminApi.loadCustomerWallet>>) => void;
  vi.mocked(adminApi.loadCustomerWallet).mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const test = setup();
  try {
    test.enter('150');
    fireEvent.change(screen.getByLabelText('Admin note (optional)'), {
      target: { value: 'Shop receipt 123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Load wallet' }));
    await waitFor(() =>
      expect(adminApi.loadCustomerWallet).toHaveBeenCalledWith({
        amount: 150,
        customerEmail: 'customer@example.com',
        adminNote: 'Shop receipt 123',
      }),
    );
    expect(await screen.findByRole('button', { name: 'Loading wallet…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    finish({
      success: true,
      message: 'Loaded',
      data: {
        amount: 150,
        balance: 250,
        customerEmail: 'customer@example.com',
        customerName: 'Customer',
        referenceId: 'cash-123',
        walletId: 'wallet-1',
      },
    });
    await waitFor(() => expect(test.onClose).toHaveBeenCalledOnce());
  } finally {
    test.cleanup();
  }
});

it('keeps the form open and displays a rejected load', async () => {
  vi.mocked(adminApi.loadCustomerWallet).mockRejectedValue(
    new Error('Customer account not found for this email'),
  );
  const test = setup();
  try {
    test.enter('500');
    fireEvent.click(screen.getByRole('button', { name: 'Load wallet' }));
    expect(
      await screen.findByText('Customer account not found for this email'),
    ).toBeInTheDocument();
    expect(test.onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('spinbutton', { name: 'Cash amount' })).toHaveValue(500);
  } finally {
    test.cleanup();
  }
});
