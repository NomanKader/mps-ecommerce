import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { useDebounce } from '@hooks/useDebounce';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

type AdminUserStatus = 'active' | 'inactive';

type EcommerceRole =
  | 'store_owner'
  | 'operations_manager'
  | 'catalog_manager'
  | 'order_fulfillment'
  | 'customer_support'
  | 'marketing_manager'
  | 'delivery_manager'
  | 'finance_viewer';

type ManagedAdminUser = {
  createdAt: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string;
  role: EcommerceRole;
  status: AdminUserStatus;
};

type UserForm = Omit<ManagedAdminUser, 'createdAt' | 'id'>;

type RoleDefinition = {
  description: string;
  label: string;
  responsibilities: string[];
  value: EcommerceRole;
};

const storageKey = 'avs-admin-users';

const roleDefinitions: RoleDefinition[] = [
  {
    description: 'Full control of ecommerce setup, users, catalog, orders, and reporting.',
    label: 'Store Owner',
    responsibilities: ['All permissions', 'User and role management', 'Business settings'],
    value: 'store_owner',
  },
  {
    description: 'Runs daily operations across orders, customers, catalog health, and delivery.',
    label: 'Operations Manager',
    responsibilities: ['Order monitoring', 'Customer escalation', 'Operational reports'],
    value: 'operations_manager',
  },
  {
    description: 'Maintains products, categories, sections, icons, and storefront merchandising.',
    label: 'Catalog Manager',
    responsibilities: ['Products', 'Categories', 'Product sections', 'Storefront icons'],
    value: 'catalog_manager',
  },
  {
    description: 'Processes orders from paid status through packing, shipment, and completion.',
    label: 'Order Fulfillment',
    responsibilities: ['Order status updates', 'Packing queue', 'Fulfillment notes'],
    value: 'order_fulfillment',
  },
  {
    description: 'Handles customer records, support follow-up, and customer issue resolution.',
    label: 'Customer Support',
    responsibilities: ['Customers', 'Order lookup', 'Support follow-up'],
    value: 'customer_support',
  },
  {
    description: 'Creates promotions and controls storefront campaign content.',
    label: 'Marketing Manager',
    responsibilities: ['Promotions', 'Carousel', 'Campaign visibility'],
    value: 'marketing_manager',
  },
  {
    description: 'Maintains regional delivery coverage, townships, and delivery fee rules.',
    label: 'Delivery Manager',
    responsibilities: ['Regions', 'Townships', 'Delivery fees'],
    value: 'delivery_manager',
  },
  {
    description: 'Views order revenue and customer spend data without changing operations.',
    label: 'Finance Viewer',
    responsibilities: ['Revenue view', 'Order totals', 'Customer spend'],
    value: 'finance_viewer',
  },
];

const emptyForm: UserForm = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  role: 'catalog_manager',
  status: 'active',
};

const defaultUsers: ManagedAdminUser[] = [
  {
    createdAt: '2026-06-01T08:30:00.000Z',
    email: 'tenant.admin@av.com',
    firstName: 'Tenant',
    id: 'admin-owner',
    lastName: 'Admin',
    phone: '+95 800 28789',
    role: 'store_owner',
    status: 'active',
  },
  {
    createdAt: '2026-06-04T10:15:00.000Z',
    email: 'orders@av.com',
    firstName: 'Order',
    id: 'admin-orders',
    lastName: 'Lead',
    phone: '+95 800 28790',
    role: 'order_fulfillment',
    status: 'active',
  },
  {
    createdAt: '2026-06-05T11:20:00.000Z',
    email: 'catalog@av.com',
    firstName: 'Catalog',
    id: 'admin-catalog',
    lastName: 'Manager',
    phone: '+95 800 28791',
    role: 'catalog_manager',
    status: 'active',
  },
];

const getRoleDefinition = (role: EcommerceRole): RoleDefinition =>
  roleDefinitions.find((definition) => definition.value === role) ?? roleDefinitions[0]!;

const createUserId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `admin-user-${Date.now()}`;

const loadUsers = () => {
  if (typeof window === 'undefined') {
    return defaultUsers;
  }

  const savedUsers = window.localStorage.getItem(storageKey);

  if (!savedUsers) {
    return defaultUsers;
  }

  try {
    return JSON.parse(savedUsers) as ManagedAdminUser[];
  } catch {
    return defaultUsers;
  }
};

const persistUsers = (users: ManagedAdminUser[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(users));
  }
};

export const AdminUserPage = () => {
  const [deleteTarget, setDeleteTarget] = useState<ManagedAdminUser | null>(null);
  const [detailUser, setDetailUser] = useState<ManagedAdminUser | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<EcommerceRole | 'all'>('all');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<ManagedAdminUser[]>(loadUsers);
  const debouncedSearch = useDebounce(search);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    return users.filter((user) => {
      const role = getRoleDefinition(user.role);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesSearch =
        !normalizedSearch ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        role.label.toLowerCase().includes(normalizedSearch);

      return matchesRole && matchesSearch;
    });
  }, [debouncedSearch, roleFilter, users]);

  const activeUsers = users.filter((user) => user.status === 'active').length;
  const selectedRole = getRoleDefinition(form.role);
  const tableResponsibilityLimit = 2;

  const columns: GridColDef<ManagedAdminUser>[] = [
    {
      field: 'name',
      flex: 1.1,
      headerName: 'User',
      minWidth: 220,
      renderCell: (params) => {
        const user = params.row;
        const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

        return (
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', height: '100%', minWidth: 0 }}
          >
            <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 800, height: 42, width: 42 }}>
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 800, lineHeight: 1.25 }} variant="body2">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography color="text.secondary" noWrap sx={{ display: 'block' }} variant="caption">
                {user.email}
              </Typography>
            </Box>
          </Stack>
        );
      },
      valueGetter: (_value, row) => `${row.firstName} ${row.lastName}`,
    },
    {
      field: 'role',
      flex: 0.7,
      headerName: 'Role',
      minWidth: 150,
      renderCell: (params) => {
        const role = getRoleDefinition(params.value);

        return (
          <Chip
            label={role.label}
            size="small"
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 800,
            }}
          />
        );
      },
      valueFormatter: (value: EcommerceRole) => getRoleDefinition(value).label,
    },
    {
      field: 'responsibilities',
      flex: 1.2,
      headerName: 'Responsibilities',
      minWidth: 260,
      renderCell: (params) => {
        const responsibilities = getRoleDefinition(params.row.role).responsibilities.slice(
          0,
          tableResponsibilityLimit,
        );

        return (
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              flexWrap: 'nowrap',
              gap: 0.75,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            {responsibilities.map((responsibility) => (
              <Chip
                key={responsibility}
                label={responsibility}
                size="small"
                sx={{ bgcolor: 'action.hover', fontWeight: 700 }}
              />
            ))}
          </Stack>
        );
      },
      sortable: false,
    },
    { field: 'phone', flex: 0.65, headerName: 'Phone', minWidth: 140 },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: (params) => (
        <Chip
          color={params.value === 'active' ? 'success' : 'default'}
          label={params.value === 'active' ? 'Active' : 'Inactive'}
          size="small"
        />
      ),
      flex: 0.45,
      minWidth: 105,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            aria-label="View user responsibilities"
            onClick={() => setDetailUser(params.row)}
            size="small"
            sx={{ bgcolor: 'info.lighter', color: 'info.main' }}
          >
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="Edit user"
            onClick={() => openEditDialog(params.row)}
            size="small"
            sx={{ bgcolor: 'action.hover' }}
          >
            <EditRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="Delete user"
            onClick={() => setDeleteTarget(params.row)}
            size="small"
            sx={{ bgcolor: 'error.lighter', color: 'error.main' }}
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
      sortable: false,
      flex: 0.6,
      minWidth: 132,
    },
  ];

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsUserDialogOpen(true);
  };

  const openEditDialog = (user: ManagedAdminUser) => {
    setEditingId(user.id);
    setForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
    setIsUserDialogOpen(true);
  };

  const handleSave = () => {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!firstName || !lastName || !email) {
      toast.error('Complete first name, last name, and email.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address.');
      return;
    }

    const emailAlreadyExists = users.some((user) => user.email === email && user.id !== editingId);

    if (emailAlreadyExists) {
      toast.error('A user with this email already exists.');
      return;
    }

    const nextUsers = editingId
      ? users.map((user) =>
          user.id === editingId
            ? { ...user, email, firstName, lastName, phone, role: form.role, status: form.status }
            : user,
        )
      : [
          ...users,
          {
            createdAt: new Date().toISOString(),
            email,
            firstName,
            id: createUserId(),
            lastName,
            phone,
            role: form.role,
            status: form.status,
          },
        ];

    setUsers(nextUsers);
    persistUsers(nextUsers);
    setIsUserDialogOpen(false);
    toast.success(editingId ? 'User updated.' : 'User created.');
  };

  const handleDelete = () => {
    if (!deleteTarget) {
      return;
    }

    const nextUsers = users.filter((user) => user.id !== deleteTarget.id);

    setUsers(nextUsers);
    persistUsers(nextUsers);
    setDeleteTarget(null);
    toast.success('User deleted.');
  };

  return (
    <PageSection
      action={
        <AppButton onClick={openCreateDialog} startIcon={<AddRoundedIcon />}>
          Create user
        </AppButton>
      }
      description="Create dashboard users and assign ecommerce responsibilities based on their roles."
      title="User"
    >
      <Stack
        direction={{ lg: 'row', xs: 'column' }}
        spacing={2}
        sx={{
          alignItems: { lg: 'center', xs: 'stretch' },
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          mb: 2,
          p: 2,
        }}
      >
        <TextField
          label="Search users"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name, email, or role"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: { lg: 320 } }}
          value={search}
        />
        <TextField
          label="Role"
          onChange={(event) => setRoleFilter(event.target.value as EcommerceRole | 'all')}
          select
          sx={{ minWidth: { lg: 220 } }}
          value={roleFilter}
        >
          <MenuItem value="all">All roles</MenuItem>
          {roleDefinitions.map((role) => (
            <MenuItem key={role.value} value={role.value}>
              {role.label}
            </MenuItem>
          ))}
        </TextField>
        <Typography color="text.secondary" sx={{ ml: { lg: 'auto' } }} variant="body2">
          {activeUsers} active / {users.length} total
        </Typography>
      </Stack>
      <AppDataTable
        columns={columns}
        rowHeight={72}
        rows={filteredUsers}
        sx={{
          '& .MuiDataGrid-cell': {
            alignItems: 'center',
            lineHeight: 1.3,
            overflow: 'hidden',
            py: 0.75,
          },
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: '1px solid',
            borderColor: 'divider',
          },
          '& .MuiDataGrid-row:nth-of-type(even)': {
            bgcolor: 'rgba(0, 0, 0, 0.015)',
          },
          '& .MuiDataGrid-row:hover': {
            bgcolor: 'rgba(196, 26, 26, 0.035)',
          },
          bgcolor: 'background.paper',
          minWidth: 0,
        }}
      />

      <Dialog fullWidth maxWidth="md" onClose={() => setIsUserDialogOpen(false)} open={isUserDialogOpen}>
        <DialogTitle>{editingId ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2.25} sx={{ pt: 1 }}>
            <Grid size={{ sm: 6, xs: 12 }}>
              <TextField
                fullWidth
                label="First name"
                onChange={(event) =>
                  setForm((current) => ({ ...current, firstName: event.target.value }))
                }
                value={form.firstName}
              />
            </Grid>
            <Grid size={{ sm: 6, xs: 12 }}>
              <TextField
                fullWidth
                label="Last name"
                onChange={(event) =>
                  setForm((current) => ({ ...current, lastName: event.target.value }))
                }
                value={form.lastName}
              />
            </Grid>
            <Grid size={{ sm: 6, xs: 12 }}>
              <TextField
                fullWidth
                label="Email"
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                type="email"
                value={form.email}
              />
            </Grid>
            <Grid size={{ sm: 6, xs: 12 }}>
              <TextField
                fullWidth
                label="Phone"
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                placeholder="+95 800 28789"
                type="tel"
                value={form.phone}
              />
            </Grid>
            <Grid size={{ sm: 6, xs: 12 }}>
              <TextField
                fullWidth
                label="Role"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value as EcommerceRole,
                  }))
                }
                select
                value={form.role}
              >
                {roleDefinitions.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ sm: 6, xs: 12 }}>
              <TextField
                fullWidth
                label="Status"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as AdminUserStatus,
                  }))
                }
                select
                value={form.status}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                {selectedRole.label}: {selectedRole.description}
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <AppButton color="inherit" onClick={() => setIsUserDialogOpen(false)}>
            Cancel
          </AppButton>
          <AppButton onClick={handleSave}>{editingId ? 'Save user' : 'Create user'}</AppButton>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="sm" onClose={() => setDetailUser(null)} open={Boolean(detailUser)}>
        <DialogTitle>User Responsibilities</DialogTitle>
        <DialogContent>
          {detailUser ? (
            <Stack spacing={2.25} sx={{ pt: 1 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 800, height: 52, width: 52 }}>
                  {`${detailUser.firstName.charAt(0)}${detailUser.lastName.charAt(0)}`.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 900 }} variant="h6">
                    {detailUser.firstName} {detailUser.lastName}
                  </Typography>
                  <Typography color="text.secondary">{detailUser.email}</Typography>
                </Box>
              </Stack>
              <Box
                sx={{
                  bgcolor: 'background.default',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Typography sx={{ fontWeight: 900 }} variant="subtitle1">
                  {getRoleDefinition(detailUser.role).label}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body2">
                  {getRoleDefinition(detailUser.role).description}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, mb: 1 }} variant="subtitle2">
                  Responsibilities
                </Typography>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {getRoleDefinition(detailUser.role).responsibilities.map((responsibility) => (
                    <Chip key={responsibility} label={responsibility} />
                  ))}
                </Stack>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <AppButton color="inherit" onClick={() => setDetailUser(null)}>
            Close
          </AppButton>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="xs" onClose={() => setDeleteTarget(null)} open={Boolean(deleteTarget)}>
        <DialogTitle>Delete User?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            {deleteTarget
              ? `Remove ${deleteTarget.firstName} ${deleteTarget.lastName} from dashboard access?`
              : 'Remove this user from dashboard access?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <AppButton color="inherit" onClick={() => setDeleteTarget(null)}>
            Cancel
          </AppButton>
          <AppButton color="error" onClick={handleDelete}>
            Delete user
          </AppButton>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
