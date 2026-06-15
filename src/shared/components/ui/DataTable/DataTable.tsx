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
            borderColor: 'rgba(255, 255, 255, 0.58)',
            display: 'flex',
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.065),
            backdropFilter: 'blur(18px)',
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
          background: 'linear-gradient(145deg, rgba(255,255,255,0.68), rgba(255,248,240,0.46))',
          backdropFilter: 'blur(24px) saturate(140%)',
          boxShadow: '0 22px 60px rgba(83, 36, 23, 0.08)',
          minWidth: { sm: 0, xs: 720 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  </Box>
);
