import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { GridActionsColDef, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { vi } from 'vitest';

import { adminApi } from '@features/admin/api/adminApi';
import type { AdminOrder } from '@features/admin/types/admin.types';
import { OrdersManagementPage } from './OrdersManagementPage';

vi.mock('@features/admin/api/adminApi', () => ({
  adminApi: { listOrders: vi.fn(), listCategories: vi.fn(), orderStats: vi.fn() },
}));
vi.mock('@mui/x-data-grid', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@mui/x-data-grid')>()),
  GridActionsCellItem: ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick}>{label}</button>
  ),
}));
vi.mock('@shared/components/ui/DataTable/DataTable', () => ({
  AppDataTable: ({ rows, columns }: { rows: AdminOrder[]; columns: GridColDef<AdminOrder>[] }) => (
    <div data-testid="orders-table">
      {rows.map((row) => (
        <div key={row.id}>
          {columns
            .find((column) => column.field === 'paymentStatus')
            ?.renderCell?.({ row } as GridRenderCellParams<AdminOrder>)}
          {columns
            .find((column): column is GridActionsColDef<AdminOrder> => column.type === 'actions')
            ?.getActions?.({
              row,
              id: row.id,
              columns,
            })}
        </div>
      ))}
    </div>
  ),
}));

const order: AdminOrder = {
  id: 'order-1',
  orderNumber: 'UAT-001',
  customerName: 'UAT Customer',
  createdAt: '2026-09-08T00:00:00Z',
  placedAt: '2026-09-08T00:00:00Z',
  currency: 'MMK',
  itemCount: 1,
  totalAmount: 1000,
  status: 'pending',
  paymentMethod: 'mopayments',
  paymentGateway: 'mopayments',
  paymentStatus: 'pending',
};

it('refreshes payment status in both the table and an already-open order dialog', async () => {
  vi.mocked(adminApi.listOrders).mockResolvedValue([order]);
  vi.mocked(adminApi.listCategories).mockResolvedValue([]);
  vi.mocked(adminApi.orderStats).mockResolvedValue({ openOrders: 1, fulfilled: 0, netRevenue: 0 });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <QueryClientProvider client={client}>
      <OrdersManagementPage />
    </QueryClientProvider>,
  );
  try {
    await screen.findByRole('button', { name: 'View details' });
    expect(within(screen.getByTestId('orders-table')).getByText('Pending')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View details' }));
    await screen.findByRole('dialog');

    vi.mocked(adminApi.listOrders).mockResolvedValue([
      {
        ...order,
        paymentStatus: 'paid',
        paymentGatewayStatus: 'SUCCESS',
        paymentGatewayReferenceId: 'payment-123',
      },
    ]);
    await act(async () => {
      await client.refetchQueries({ queryKey: ['admin', 'orders'] });
    });

    expect(await within(screen.getByTestId('orders-table')).findByText('Paid')).toBeInTheDocument();
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByText('Paid')).toBeInTheDocument();
    expect(dialog.getByText('Gateway status: SUCCESS')).toBeInTheDocument();
    expect(dialog.getByText('Payment ID: payment-123')).toBeInTheDocument();
  } finally {
    view.unmount();
    client.clear();
  }
});
