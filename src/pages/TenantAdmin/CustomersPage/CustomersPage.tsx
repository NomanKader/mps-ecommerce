import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import { Chip, Grid, Stack } from '@mui/material';
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';

import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { type DemoCustomer, mockCustomers } from '@shared/lib/mockData';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState<DemoCustomer[]>(mockCustomers);

  const columns: GridColDef<DemoCustomer>[] = [
    { field: 'name', flex: 1, headerName: 'Customer', minWidth: 180 },
    { field: 'email', flex: 1, headerName: 'Email', minWidth: 220 },
    {
      field: 'segment',
      headerName: 'Segment',
      renderCell: (params) => <Chip label={params.value} size="small" />,
      width: 120,
    },
    { field: 'orders', headerName: 'Orders', type: 'number', width: 100 },
    {
      field: 'totalSpend',
      headerName: 'Total spend',
      valueFormatter: (value: number) => formatCurrency(value),
      width: 140,
    },
    {
      field: 'lastOrderAt',
      headerName: 'Last order',
      valueFormatter: (value: string) => formatDate(value),
      width: 140,
    },
    {
      field: 'actions',
      getActions: ({ row }) => [
        <GridActionsCellItem
          disabled={row.segment === 'VIP'}
          icon={<StarBorderRoundedIcon />}
          key="vip"
          label="Mark VIP"
          onClick={() =>
            setCustomers((current) =>
              current.map((customer) =>
                customer.id === row.id ? { ...customer, segment: 'VIP' } : customer,
              ),
            )
          }
        />,
        <GridActionsCellItem
          icon={<DeleteOutlineRoundedIcon />}
          key="delete"
          label="Delete"
          onClick={() => setCustomers((current) => current.filter((customer) => customer.id !== row.id))}
        />,
      ],
      type: 'actions',
      width: 110,
    },
  ];

  return (
    <PageSection
      description="Manage demo customer records, segments, spend, and loyalty status."
      title="Customers"
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Stack>
            <AppDataTable columns={columns} rows={customers} />
          </Stack>
        </Grid>
      </Grid>
    </PageSection>
  );
};
