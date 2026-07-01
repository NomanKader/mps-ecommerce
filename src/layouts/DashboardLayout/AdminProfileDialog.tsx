import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

import logoImage from '@assets/images/logo.png';
import { merchandisingApi } from '@features/home/api/merchandisingApi';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { validateImageFileSelection } from '@shared/utils/imageFileValidation';
import { useAppDispatch } from '@store/hooks';
import type { RootState } from '@store/index';
import { setSession } from '@store/slices/auth.slice';

type AdminProfileDialogProps = {
  onClose: () => void;
  open: boolean;
};

type AdminUserForm = {
  deliveryHeadline: string;
  email: string;
  firstName: string;
  isActive: boolean;
  lastName: string;
  logoUrl: string;
  password: string;
  passwordConfirmation: string;
  phoneCountryCode: string;
  phoneLocalNumber: string;
  supportPhoneLabel: string;
  topBarTagline: string;
};

const roleLabel = 'Tenant admin';

const countryCodeOptions = [
  { code: '+971', country: 'United Arab Emirates' },
  { code: '+95', country: 'Myanmar' },
  { code: '+1', country: 'United States' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+65', country: 'Singapore' },
  { code: '+66', country: 'Thailand' },
  { code: '+60', country: 'Malaysia' },
  { code: '+91', country: 'India' },
];

const splitPhoneNumber = (phone: string | undefined) => {
  const fallback = { phoneCountryCode: '+971', phoneLocalNumber: '800 287' };

  if (!phone) {
    return fallback;
  }

  const option = countryCodeOptions.find((countryCode) => phone.startsWith(countryCode.code));

  if (!option) {
    return fallback;
  }

  return {
    phoneCountryCode: option.code,
    phoneLocalNumber: phone.slice(option.code.length).trim(),
  };
};

export const AdminProfileDialog = ({ onClose, open }: AdminProfileDialogProps) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const user = useSelector((state: RootState) => state.auth.user);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const initialPhone = splitPhoneNumber(user?.supportPhoneLabel);
  const [form, setForm] = useState<AdminUserForm>({
    deliveryHeadline: user?.deliveryHeadline ?? 'Delivery all over UAE',
    email: user?.email ?? '',
    firstName: user?.firstName ?? '',
    isActive: user?.isActive ?? true,
    lastName: user?.lastName ?? '',
    logoUrl: user?.logoUrl ?? '',
    password: '',
    passwordConfirmation: '',
    phoneCountryCode: initialPhone.phoneCountryCode,
    phoneLocalNumber: initialPhone.phoneLocalNumber,
    supportPhoneLabel: `${initialPhone.phoneCountryCode} ${initialPhone.phoneLocalNumber}`.trim(),
    topBarTagline: user?.topBarTagline ?? 'Sustainable Grocery Shopping',
  });
  const profileQuery = useQuery({
    enabled: open,
    queryFn: ({ signal }) => merchandisingApi.getAdminProfile({ signal }),
    queryKey: ['admin', 'profile'],
  });
  const initials = useMemo(
    () => `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase() || 'A',
    [form.firstName, form.lastName],
  );

  useEffect(() => {
    if (!profileQuery.data || !open) {
      return;
    }

    const { admin, headerSettings } = profileQuery.data;

    queueMicrotask(() => {
      setForm({
        deliveryHeadline: headerSettings.deliveryHeadline,
        email: admin.email,
        firstName: admin.firstName,
        isActive: admin.isActive ?? true,
        lastName: admin.lastName,
        logoUrl: headerSettings.logoUrl ?? admin.logoUrl ?? '',
        password: '',
        passwordConfirmation: '',
        phoneCountryCode: headerSettings.supportPhoneCountryCode,
        phoneLocalNumber: headerSettings.supportPhoneNumber,
        supportPhoneLabel:
          `${headerSettings.supportPhoneCountryCode} ${headerSettings.supportPhoneNumber}`.trim(),
        topBarTagline: headerSettings.topBarTagline,
      });
    });
  }, [open, profileQuery.data]);

  const updateProfileMutation = useMutation({
    mutationFn: merchandisingApi.updateAdminProfile,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      if (!accessToken) {
        return;
      }

      const nextUser = {
        ...result.data.admin,
        deliveryHeadline: result.data.headerSettings.deliveryHeadline,
        logoUrl: result.data.headerSettings.logoUrl ?? result.data.admin.logoUrl,
        supportPhoneLabel:
          `${result.data.headerSettings.supportPhoneCountryCode} ${result.data.headerSettings.supportPhoneNumber}`.trim(),
        topBarTagline: result.data.headerSettings.topBarTagline,
        tenantId: user?.tenantId,
      };

      dispatch(setSession({ accessToken, user: nextUser }));
      await queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] });
      await queryClient.invalidateQueries({ queryKey: ['storefront', 'header-settings'] });
      setForm((current) => ({ ...current, password: '', passwordConfirmation: '' }));
      setSavedAt(new Date().toLocaleTimeString());
      toast.success(result.message);
    },
  });

  const handleSave = () => {
    if (!user || !accessToken) {
      toast.error('No admin session is available.');
      return;
    }

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const logoUrl = form.logoUrl.trim();
    const email = form.email.trim().toLowerCase();
    const deliveryHeadline = form.deliveryHeadline.trim();
    const phoneLocalNumber = form.phoneLocalNumber.trim();
    const supportPhoneLabel = `${form.phoneCountryCode} ${phoneLocalNumber}`.trim();
    const topBarTagline = form.topBarTagline.trim() || 'Sustainable Grocery Shopping';
    const password = form.password.trim();
    const passwordConfirmation = form.passwordConfirmation.trim();

    if (!firstName || !lastName || !email || !deliveryHeadline || !phoneLocalNumber) {
      toast.error(
        'Complete first name, last name, email, delivery text, and contact mobile phone.',
      );
      return;
    }

    if (!/^\+?[0-9\s()-]{7,20}$/.test(supportPhoneLabel)) {
      toast.error('Enter a valid contact mobile phone number.');
      return;
    }

    if ((password || passwordConfirmation) && password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error('Password confirmation does not match.');
      return;
    }

    const passwordPayload =
      password && passwordConfirmation ? { password, passwordConfirmation } : {};

    updateProfileMutation.mutate({
      deliveryHeadline,
      email,
      firstName,
      isActive: form.isActive,
      lastName,
      logoUrl,
      ...passwordPayload,
      supportPhoneCountryCode: form.phoneCountryCode,
      supportPhoneNumber: phoneLocalNumber,
      topBarTagline,
    });
  };

  const handleLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!validateImageFileSelection(file, 'app logo')) {
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((current) => ({ ...current, logoUrl: reader.result as string }));
      }
    };

    reader.onerror = () => toast.error('Could not read the selected logo image.');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const logoPreviewUrl = form.logoUrl.trim() || logoImage;

  return (
    <Dialog fullWidth maxWidth="lg" onClose={onClose} open={open}>
      <DialogTitle>
        <Stack
          direction={{ sm: 'row', xs: 'column' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center', xs: 'stretch' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h6">Admin Profile</Typography>
            <Typography color="text.secondary" variant="body2">
              Manage the current dashboard admin profile shown in the admin header and local
              session.
            </Typography>
          </Box>
          <AppButton
            disabled={updateProfileMutation.isPending || profileQuery.isLoading}
            onClick={handleSave}
            startIcon={<SaveRoundedIcon />}
          >
            Save admin info
          </AppButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: 'background.default' }}>
        <Grid container spacing={3}>
          <Grid size={{ lg: 4, xs: 12 }}>
            <Card sx={{ borderRadius: 1, height: '100%' }}>
              <CardContent>
                <Stack spacing={2.25} sx={{ alignItems: 'center', textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', fontSize: '2rem', height: 96, width: 96 }}>
                    {initials}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 900 }} variant="h5">
                      {form.firstName || form.lastName
                        ? `${form.firstName} ${form.lastName}`
                        : 'Admin User'}
                    </Typography>
                    <Typography color="text.secondary">
                      {form.email || 'admin@example.com'}
                    </Typography>
                  </Box>
                  <Alert severity={form.isActive ? 'success' : 'warning'} sx={{ width: '100%' }}>
                    {form.isActive
                      ? 'This admin account is active.'
                      : 'This admin account is marked inactive.'}
                  </Alert>
                  <Divider flexItem />
                  <Stack spacing={1.5} sx={{ alignItems: 'stretch', width: '100%' }}>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography sx={{ fontWeight: 900 }} variant="subtitle1">
                        App Logo
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Update the logo used in the admin and storefront header.
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        alignItems: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        minHeight: 112,
                        p: 2,
                      }}
                    >
                      <Box
                        alt="Current app logo"
                        component="img"
                        src={logoPreviewUrl}
                        sx={{
                          display: 'block',
                          maxHeight: 82,
                          maxWidth: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="Logo image URL"
                      onChange={(event) =>
                        setForm((current) => ({ ...current, logoUrl: event.target.value }))
                      }
                      placeholder="https://example.com/logo.png"
                      value={form.logoUrl}
                    />
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <AppButton
                        component="label"
                        color="inherit"
                        startIcon={<UploadRoundedIcon />}
                        sx={{ flex: 1 }}
                      >
                        Choose logo
                        <Box
                          accept="image/*"
                          component="input"
                          hidden
                          onChange={handleLogoFileChange}
                          type="file"
                        />
                      </AppButton>
                      <AppButton
                        color="inherit"
                        onClick={() => setForm((current) => ({ ...current, logoUrl: '' }))}
                      >
                        Reset
                      </AppButton>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ lg: 8, xs: 12 }}>
            <Card sx={{ borderRadius: 1 }}>
              <CardContent>
                <Typography variant="h6">Profile Information</Typography>
                <Grid container spacing={2.25} sx={{ mt: 0.5 }}>
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
                    <TextField fullWidth label="Role" value={roleLabel} disabled />
                  </Grid>
                  <Grid size={{ sm: 6, xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Tenant ID"
                      value={user?.tenantId ?? 'AV'}
                      disabled
                    />
                  </Grid>
                  <Grid size={{ sm: 6, xs: 12 }}>
                    <TextField
                      fullWidth
                      label="User ID"
                      value={user?.id ?? 'current-admin'}
                      disabled
                    />
                  </Grid>
                  <Grid size={{ sm: 6, xs: 12 }}>
                    <TextField
                      autoComplete="new-password"
                      fullWidth
                      helperText="Leave blank to keep the current password."
                      label="New password"
                      onChange={(event) =>
                        setForm((current) => ({ ...current, password: event.target.value }))
                      }
                      type="password"
                      value={form.password}
                    />
                  </Grid>
                  <Grid size={{ sm: 6, xs: 12 }}>
                    <TextField
                      autoComplete="new-password"
                      fullWidth
                      label="Confirm password"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          passwordConfirmation: event.target.value,
                        }))
                      }
                      type="password"
                      value={form.passwordConfirmation}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.isActive}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, isActive: event.target.checked }))
                          }
                        />
                      }
                      label="Admin account active"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Alert severity="info" sx={{ mt: 2 }}>
              Admin profile changes are saved through the backend and applied to the storefront
              header.
            </Alert>
            {profileQuery.isError ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {toApiError(profileQuery.error).message}
              </Alert>
            ) : null}
            <Card sx={{ borderRadius: 1, mt: 2 }}>
              <CardContent sx={{ p: { sm: 3, xs: 2 } }}>
                <Typography variant="h6">Storefront Header Info</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }} variant="body2">
                  These fields control the red storefront top bar delivery and phone messages.
                </Typography>
                <Grid container spacing={2.5} sx={{ mt: 2 }}>
                  <Grid size={{ sm: 6, xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Delivery headline"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          deliveryHeadline: event.target.value,
                        }))
                      }
                      value={form.deliveryHeadline}
                    />
                  </Grid>
                  <Grid size={{ sm: 6, xs: 12 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ sm: 3.5, xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Country code"
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              phoneCountryCode: event.target.value,
                              supportPhoneLabel:
                                `${event.target.value} ${current.phoneLocalNumber}`.trim(),
                            }))
                          }
                          select
                          slotProps={{
                            select: {
                              renderValue: (value) => value as string,
                            },
                          }}
                          value={form.phoneCountryCode}
                        >
                          {countryCodeOptions.map((option) => (
                            <MenuItem key={option.code} value={option.code}>
                              {option.code} {option.country}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ sm: 8.5, xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Contact mobile phone"
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              phoneLocalNumber: event.target.value,
                              supportPhoneLabel:
                                `${current.phoneCountryCode} ${event.target.value}`.trim(),
                            }))
                          }
                          placeholder="800 287"
                          type="tel"
                          value={form.phoneLocalNumber}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            {savedAt ? (
              <Alert severity="success" sx={{ mt: 2 }}>
                Admin information saved at {savedAt}.
              </Alert>
            ) : null}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <AppButton color="inherit" onClick={onClose}>
          Close
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};
