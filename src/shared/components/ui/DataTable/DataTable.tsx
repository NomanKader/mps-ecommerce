import { DataGrid, type DataGridProps } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const AppDataTable = ({ autoHeight = true, sx, ...props }: DataGridProps) => (
  <Box sx={{ minWidth: 0, overflowX: 'auto', width: '100%' }}>
    <DataGrid
      autoHeight={autoHeight}
      disableRowSelectionOnClick
      pageSizeOptions={[5, 10, 20]}
      sx={[
        {
          '& .MuiDataGrid-cell': {
            alignItems: 'center',
            borderColor: 'divider',
            display: 'flex',
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 800,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.035),
          },
          '& .MuiDataGrid-virtualScroller': {
            '&::-webkit-scrollbar': {
              height: 10,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.28),
              borderRadius: 999,
            },
          },
          borderColor: 'divider',
          borderRadius: 1,
          minWidth: { sm: 0, xs: 720 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  </Box>
);
