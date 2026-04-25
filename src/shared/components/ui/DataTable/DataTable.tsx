import { DataGrid, type DataGridProps } from '@mui/x-data-grid';
import { Box } from '@mui/material';

export const AppDataTable = (props: DataGridProps) => (
  <Box sx={{ minHeight: 420, width: '100%' }}>
    <DataGrid
      disableRowSelectionOnClick
      pageSizeOptions={[5, 10, 20]}
      sx={{
        borderRadius: 4,
      }}
      {...props}
    />
  </Box>
);
