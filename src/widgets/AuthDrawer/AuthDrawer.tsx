import AppleIcon from '@mui/icons-material/Apple';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import GoogleIcon from '@mui/icons-material/Google';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { storefrontColors } from '@app/providers/theme/tokens';
import { useLogin } from '@features/auth/hooks/useLogin';
import { routePaths } from '@routes/routePaths';
import { registerSchema, type RegisterFormValues } from '@shared/validators/auth.schema';

type AuthDrawerMode = 'login' | 'register';

type AuthDrawerProps = {
  initialMode?: AuthDrawerMode;
  onClose: () => void;
  open: boolean;
};

const drawerTextFieldSx = {
  '& .MuiInputBase-input': {
    fontSize: '1rem',
    py: 1.95,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#dde3ee',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.1,
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: storefrontColors.navy,
      borderWidth: 1,
    },
  },
};

const socialAuthButtons = [
  { icon: <AppleIcon sx={{ color: '#111111' }} />, id: 'apple', label: 'Sign in with Apple' },
  { icon: <GoogleIcon sx={{ color: '#4285f4' }} />, id: 'google', label: 'Sign in with Google' },
  { icon: <FacebookRoundedIcon sx={{ color: '#1877f2' }} />, id: 'facebook', label: 'Sign in with Facebook' },
];

const drawerButtonSx = {
  borderRadius: 999,
  fontSize: '1rem',
  fontWeight: 800,
  minHeight: 60,
  textTransform: 'uppercase',
};

const SocialAuthButton = ({ icon, label }: { icon: ReactElement; label: string }) => (
  <Button
    fullWidth
    startIcon={icon}
    sx={{
      ...drawerButtonSx,
      backgroundColor: storefrontColors.surface,
      border: `1px solid ${alpha(storefrontColors.navy, 0.14)}`,
      color: '#30343c',
      justifyContent: 'center',
      '&:hover': {
        backgroundColor: '#f8fafe',
      },
      '& .MuiButton-startIcon': {
        left: 28,
        position: 'absolute',
      },
    }}
    variant="outlined"
  >
    {label}
  </Button>
);

export const AuthDrawer = ({ initialMode = 'login', onClose, open }: AuthDrawerProps) => {
  const [mode, setMode] = useState<AuthDrawerMode>(initialMode);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
  const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
  const login = useLogin({ onSuccess: onClose });
  const registerForm = useForm<RegisterFormValues>({
    defaultValues: {
      email: '',
      name: '',
      otp: '',
      password: '',
      phone: '',
    },
    resolver: zodResolver(registerSchema),
  });

  const {
    formState: { errors: loginErrors },
    isSubmitting,
    onSubmit,
    register,
  } = login;

  const {
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
    handleSubmit,
    register: registerRegisterField,
    reset,
  } = registerForm;

  const handleClose = () => {
    onClose();
    setMode(initialMode);
    setLoginPasswordVisible(false);
    setRegisterPasswordVisible(false);
  };

  const handleSwitchMode = (nextMode: AuthDrawerMode) => {
    setMode(nextMode);
  };

  const handleRegisterSubmit = handleSubmit(async (values) => {
    void values;
    toast.success('Registration flow is mocked. Switching to sign in.');
    reset();
    setMode('login');
  });

  const heading = mode === 'login' ? 'SIGN IN' : 'Create your Kibsons account';

  return (
    <Drawer
      anchor="right"
      onClose={handleClose}
      open={open}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: alpha('#1d2330', 0.56),
          },
        },
        paper: {
          sx: {
            backgroundColor: storefrontColors.surface,
            maxWidth: '100vw',
            width: { md: 660, xs: '100%' },
          },
        },
      }}
    >
      <Stack sx={{ height: '100%' }}>
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: '#f7f8fc',
            display: 'flex',
            minHeight: 78,
            px: 2.2,
          }}
        >
          <IconButton onClick={handleClose} sx={{ color: storefrontColors.navy }}>
            <CloseRoundedIcon sx={{ fontSize: 42 }} />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: { md: 5.5, xs: 2.5 },
            py: { md: 5.5, xs: 3.5 },
          }}
        >
          <Stack spacing={3.25}>
            <Typography
              sx={{
                color: storefrontColors.navy,
                fontSize: mode === 'login' ? '2rem' : '1.9rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                mt: 1,
              }}
            >
              {heading}
            </Typography>

            {mode === 'login' ? (
              <Stack component="form" onSubmit={(event) => void onSubmit(event)} spacing={2.6}>
                <TextField
                  error={Boolean(loginErrors.email)}
                  fullWidth
                  helperText={loginErrors.email?.message}
                  label="Email"
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={drawerTextFieldSx}
                  {...register('email')}
                />
                <TextField
                  error={Boolean(loginErrors.password)}
                  fullWidth
                  helperText={loginErrors.password?.message}
                  label="Password"
                  sx={drawerTextFieldSx}
                  type={loginPasswordVisible ? 'text' : 'password'}
                  {...register('password')}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" onClick={() => setLoginPasswordVisible((current) => !current)}>
                            {loginPasswordVisible ? (
                              <VisibilityOutlinedIcon sx={{ color: storefrontColors.navy }} />
                            ) : (
                              <VisibilityOffOutlinedIcon sx={{ color: storefrontColors.navy }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                    inputLabel: { shrink: true },
                  }}
                />

                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: -0.5 }}>
                  <Stack direction="row" spacing={0.7} sx={{ alignItems: 'center' }}>
                    <Checkbox checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} sx={{ p: 0 }} />
                    <Typography sx={{ color: storefrontColors.navy, fontSize: '0.98rem', fontWeight: 500 }}>
                      Remember me
                    </Typography>
                  </Stack>
                  <Typography
                    component={Link}
                    sx={{ color: storefrontColors.navy, fontSize: '0.98rem', fontWeight: 500, textDecoration: 'none' }}
                    to={routePaths.auth.forgotPassword}
                  >
                    Forgot Password?
                  </Typography>
                </Stack>

                <Button disabled={isSubmitting} sx={drawerButtonSx} type="submit" variant="contained">
                  Sign In
                </Button>

                <Button
                  onClick={() => handleSwitchMode('register')}
                  sx={{
                    ...drawerButtonSx,
                    backgroundColor: storefrontColors.surface,
                    border: `1px solid ${alpha(storefrontColors.navy, 0.14)}`,
                    color: storefrontColors.navy,
                    '&:hover': {
                      backgroundColor: '#f8fafe',
                    },
                  }}
                  variant="outlined"
                >
                  Register
                </Button>

                <Stack direction="row" spacing={2.2} sx={{ alignItems: 'center', py: 1.2 }}>
                  <Divider sx={{ borderColor: alpha(storefrontColors.navy, 0.9), flex: 1 }} />
                  <Typography sx={{ color: storefrontColors.navy, fontSize: '0.98rem', whiteSpace: 'nowrap' }}>
                    OR SIGN IN
                  </Typography>
                  <Divider sx={{ borderColor: alpha(storefrontColors.navy, 0.9), flex: 1 }} />
                </Stack>

                <Stack spacing={2}>
                  {socialAuthButtons.map((button) => (
                    <SocialAuthButton icon={button.icon} key={button.id} label={button.label} />
                  ))}
                </Stack>
              </Stack>
            ) : (
              <Stack component="form" onSubmit={(event) => void handleRegisterSubmit(event)} spacing={2.4}>
                <TextField
                  error={Boolean(registerErrors.name)}
                  fullWidth
                  helperText={registerErrors.name?.message}
                  label="Name"
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={drawerTextFieldSx}
                  {...registerRegisterField('name')}
                />
                <TextField
                  error={Boolean(registerErrors.email)}
                  fullWidth
                  helperText={registerErrors.email?.message}
                  label="Email ID"
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={drawerTextFieldSx}
                  {...registerRegisterField('email')}
                />

                <TextField
                  error={Boolean(registerErrors.phone)}
                  fullWidth
                  helperText={registerErrors.phone?.message}
                  label="Phone Number"
                  sx={drawerTextFieldSx}
                  {...registerRegisterField('phone')}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', color: '#434955' }}>
                            <Typography sx={{ fontSize: '1.5rem', lineHeight: 1 }}>🇦🇪</Typography>
                            <Divider flexItem orientation="vertical" sx={{ borderColor: '#dde3ee' }} />
                            <Typography sx={{ fontSize: '0.98rem', fontWeight: 500 }}>+971</Typography>
                          </Stack>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            sx={{
                              alignSelf: 'stretch',
                              backgroundColor: storefrontColors.navy,
                              borderRadius: 0,
                              color: storefrontColors.surface,
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              height: 60,
                              px: 3,
                              textTransform: 'none',
                              '&:hover': {
                                backgroundColor: storefrontColors.navyDark,
                              },
                            }}
                          >
                            Send OTP
                          </Button>
                        </InputAdornment>
                      ),
                    },
                    inputLabel: { shrink: true },
                  }}
                />

                <TextField
                  error={Boolean(registerErrors.otp)}
                  fullWidth
                  helperText={registerErrors.otp?.message}
                  label="Verification OTP"
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={drawerTextFieldSx}
                  {...registerRegisterField('otp')}
                />
                <TextField
                  error={Boolean(registerErrors.password)}
                  fullWidth
                  helperText={registerErrors.password?.message}
                  label="Password"
                  sx={drawerTextFieldSx}
                  type={registerPasswordVisible ? 'text' : 'password'}
                  {...registerRegisterField('password')}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" onClick={() => setRegisterPasswordVisible((current) => !current)}>
                            {registerPasswordVisible ? (
                              <VisibilityOutlinedIcon sx={{ color: storefrontColors.navy }} />
                            ) : (
                              <VisibilityOffOutlinedIcon sx={{ color: storefrontColors.navy }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                    inputLabel: { shrink: true },
                  }}
                />

                <Typography sx={{ color: '#2f3540', fontSize: '0.98rem', lineHeight: 1.65 }}>
                  By continuing, I agree to{' '}
                  <Box component="span" sx={{ color: storefrontColors.navy, textDecoration: 'underline' }}>
                    Terms of Use
                  </Box>{' '}
                  and{' '}
                  <Box component="span" sx={{ color: storefrontColors.navy, textDecoration: 'underline' }}>
                    Privacy Policy
                  </Box>
                </Typography>

                <Button disabled={isRegisterSubmitting} sx={drawerButtonSx} type="submit" variant="contained">
                  Register User
                </Button>

                <Typography sx={{ color: '#4d525c', fontSize: '1rem', textAlign: 'center' }}>
                  Already have an account?{' '}
                  <Box
                    component="button"
                    onClick={() => handleSwitchMode('login')}
                    sx={{
                      background: 'transparent',
                      border: 0,
                      color: storefrontColors.navy,
                      cursor: 'pointer',
                      font: 'inherit',
                      fontWeight: 700,
                      p: 0,
                    }}
                    type="button"
                  >
                    Sign in
                  </Box>
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      </Stack>
    </Drawer>
  );
};
