import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
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
  Tooltip,
  Typography,
} from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { adminApi } from '@features/admin/api/adminApi';
import type { AdminDashboardRole, AdminDashboardUser } from '@features/admin/types/admin.types';
import { useDebounce } from '@hooks/useDebounce';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

type AdminUserStatus = 'active' | 'inactive';

type EcommerceRole = AdminDashboardRole;

type UserForm = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  role: EcommerceRole;
  status: AdminUserStatus;
};

type RoleDefinition = {
  description: string;
  label: string;
  responsibilities: string[];
  value: EcommerceRole;
};

const roleDefinitions: RoleDefinition[] = [
  {
    description: 'Runs daily operations across orders, customers, catalog health, and delivery.',
    label: 'Ecommerce Website Admin',
    responsibilities: ['Order monitoring', 'Customer escalation', 'Operational reports'],
    value: 'operations_manager',
  },
];

const emptyForm: UserForm = {
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  phone: '',
  role: 'operations_manager',
  status: 'active',
};

const emptyUsers: AdminDashboardUser[] = [];

const getRoleDefinition = (role: EcommerceRole): RoleDefinition =>
  roleDefinitions.find((definition) => definition.value === role) ?? roleDefinitions[0]!;

const createPassword = () => {
  const groups = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@#$%'];
  const alphabet = groups.join('');
  const passwordLength = 14;
  const randomValues =
    typeof crypto !== 'undefined' && 'getRandomValues' in crypto
      ? crypto.getRandomValues(new Uint32Array(passwordLength * 2))
      : null;
  let randomPosition = 0;
  const getIndex = (max: number) => {
    if (randomValues) {
      const value = randomValues[randomPosition % randomValues.length]!;
      randomPosition += 1;
      return value % max;
    }

    return Math.floor(Math.random() * max);
  };
  const seed = groups.map((group) => group[getIndex(group.length)]!);

  for (let index = seed.length; index < passwordLength; index += 1) {
    seed.push(alphabet[getIndex(alphabet.length)]!);
  }

  for (let index = seed.length - 1; index > 0; index -= 1) {
    const swapIndex = getIndex(index + 1);
    [seed[index], seed[swapIndex]] = [seed[swapIndex]!, seed[index]!];
  }

  return seed.join('');
};

export const AdminUserPage = () => {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<AdminDashboardUser | null>(null);
  const [detailUser, setDetailUser] = useState<AdminDashboardUser | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<EcommerceRole | 'all'>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const usersQuery = useQuery({
    queryFn: ({ signal }) => adminApi.listUsers({ signal }),
    queryKey: ['admin', 'users'],
  });
  const users = usersQuery.data ?? emptyUsers;

  const filteredUsers = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    return users.filter((user) => {
      const role = getRoleDefinition(user.dashboardRole ?? 'operations_manager');
      const matchesRole =
        roleFilter === 'all' || (user.dashboardRole ?? 'operations_manager') === roleFilter;
      const matchesSearch =
        !normalizedSearch ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        role.label.toLowerCase().includes(normalizedSearch);

      return matchesRole && matchesSearch;
    });
  }, [debouncedSearch, roleFilter, users]);

  const activeUsers = users.filter((user) => user.isActive).length;
  const selectedRole = getRoleDefinition(form.role);
  const tableResponsibilityLimit = 2;

  const saveMutation = useMutation({
    mutationFn: () => {
      const firstName = form.firstName.trim();
      const lastName = form.lastName.trim();
      const email = form.email.trim().toLowerCase();
      const password = form.password.trim();
      const phone = form.phone.trim();

      if (!firstName || !lastName || !email) {
        throw new Error('Complete first name, last name, and email.');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Enter a valid email address.');
      }

      if (!editingId && !password) {
        throw new Error('Generate a password for the new user.');
      }

      if (password && password.length < 8) {
        throw new Error('Password must be at least 8 characters.');
      }

      const payload = {
        dashboardRole: form.role,
        email,
        firstName,
        isActive: form.status === 'active',
        lastName,
        ...(password ? { password } : {}),
        ...(phone ? { phone } : {}),
      };

      return editingId ? adminApi.updateUser(editingId, payload) : adminApi.createUser(payload);
    },
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setEditingId(null);
      setForm(emptyForm);
      setIsUserDialogOpen(false);
      toast.success(result.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeleteTarget(null);
      toast.success(result.message);
    },
  });

  const columns: GridColDef<AdminDashboardUser>[] = [
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
        const role = getRoleDefinition(params.row.dashboardRole ?? 'operations_manager');

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
      valueGetter: (_value, row) => getRoleDefinition(row.dashboardRole ?? 'operations_manager').label,
    },
    {
      field: 'responsibilities',
      flex: 1.2,
      headerName: 'Responsibilities',
      minWidth: 260,
      renderCell: (params) => {
        const responsibilities = getRoleDefinition(
          params.row.dashboardRole ?? 'operations_manager',
        ).responsibilities.slice(0, tableResponsibilityLimit);

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
    {
      field: 'phone',
      flex: 0.65,
      headerName: 'Phone',
      minWidth: 140,
      valueGetter: (value) => value || '-',
    },
    {
      field: 'isActive',
      headerName: 'Status',
      renderCell: (params) => (
        <Chip
          color={params.value ? 'success' : 'default'}
          label={params.value ? 'Active' : 'Inactive'}
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

  const openEditDialog = (user: AdminDashboardUser) => {
    setEditingId(user.id);
    setForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: '',
      phone: user.phone ?? '',
      role: user.dashboardRole ?? 'operations_manager',
      status: user.isActive ? 'active' : 'inactive',
    });
    setIsUserDialogOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) {
      return;
    }

    deleteMutation.mutate(deleteTarget.id);
  };

  return (
    <PageSection
      action={
        <AppButton onClick={openCreateDialog} startIcon={<AddRoundedIcon />}>
          Create user
        </AppButton>
      }
      description="Create ecommerce website admins for dashboard operations. Tenant admin access is not created here."
      title="Ecommerce Website Admin Users"
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
        loading={usersQuery.isLoading}
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
                autoComplete="new-password"
                fullWidth
                helperText={
                  editingId
                    ? 'Generate a new password only when resetting access.'
                    : 'Generate this password and share it with the new dashboard user.'
                }
                label={editingId ? 'New password' : 'Password'}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end" sx={{ mr: -0.5 }}>
                        <Tooltip title="Create a secure password">
                          <AppButton
                            aria-label="Generate password"
                            color="inherit"
                            onClick={() => {
                              setForm((current) => ({ ...current, password: createPassword() }));
                              toast.success('Password generated.');
                            }}
                            startIcon={<AutoAwesomeRoundedIcon />}
                            sx={{
                              bgcolor: 'background.paper',
                              border: 1,
                              borderColor: 'divider',
                              boxShadow: 'none',
                              color: 'text.primary',
                              fontWeight: 800,
                              height: 40,
                              minHeight: 40,
                              px: 1.75,
                              '& .MuiButton-startIcon': {
                                color: 'primary.main',
                                mr: 0.75,
                              },
                              '&:hover': {
                                bgcolor: 'action.hover',
                                borderColor: 'primary.main',
                                boxShadow: 'none',
                              },
                            }}
                            type="button"
                            variant="outlined"
                          >
                            Generate
                          </AppButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  },
                }}
                value={form.password}
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
          <AppButton disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {editingId ? 'Save user' : 'Create user'}
          </AppButton>
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
                  {getRoleDefinition(detailUser.dashboardRole ?? 'operations_manager').label}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body2">
                  {getRoleDefinition(detailUser.dashboardRole ?? 'operations_manager').description}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, mb: 1 }} variant="subtitle2">
                  Responsibilities
                </Typography>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {getRoleDefinition(
                    detailUser.dashboardRole ?? 'operations_manager',
                  ).responsibilities.map((responsibility) => (
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
          <AppButton color="error" disabled={deleteMutation.isPending} onClick={handleDelete}>
            Delete user
          </AppButton>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
