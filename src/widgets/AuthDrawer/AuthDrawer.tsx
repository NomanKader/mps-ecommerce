import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
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
import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import PhoneInputModule from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import { storefrontColors } from '@app/providers/theme/tokens';
import { useLogin } from '@features/auth/hooks/useLogin';
import { useRegister } from '@features/auth/hooks/useRegister';

// This package exposes a nested default export when Vite pre-bundles its CommonJS build.
const PhoneInput =
  (PhoneInputModule as typeof PhoneInputModule & { default?: typeof PhoneInputModule }).default ??
  PhoneInputModule;

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

const drawerButtonSx = {
  borderRadius: 999,
  fontSize: '1rem',
  fontWeight: 800,
  minHeight: 60,
  textTransform: 'uppercase',
};

const phoneInputSx = {
  flex: 1,
  minWidth: 0,
  '& .react-tel-input': {
    fontFamily: 'inherit',
  },
  '& .react-tel-input .form-control': {
    border: '1px solid #dde3ee',
    borderRadius: 1.1,
    color: '#30343c',
    fontFamily: 'inherit',
    fontSize: '1rem',
    height: 60,
    pl: '66px',
    width: '100%',
    '&:focus': {
      borderColor: storefrontColors.navy,
      boxShadow: `0 0 0 1px ${storefrontColors.navy}`,
    },
  },
  '& .react-tel-input .flag-dropdown': {
    backgroundColor: '#f8fafe',
    border: '1px solid #dde3ee',
    borderRadius: '4px 0 0 4px',
    width: 54,
  },
  '& .react-tel-input .selected-flag': {
    borderRadius: '4px 0 0 4px',
    pl: '14px',
    width: 54,
    '&:hover, &:focus': {
      backgroundColor: '#eef3fb',
    },
  },
};

const LoginActions = ({
  isSubmitting,
  onRegister,
}: {
  isSubmitting: boolean;
  onRegister: () => void;
}) => (
  <Stack spacing={2.6}>
    <Button disabled={isSubmitting} sx={drawerButtonSx} type="submit" variant="contained">
      Sign In
    </Button>

    <Stack direction="row" spacing={2.2} sx={{ alignItems: 'center', py: 1.2 }}>
      <Divider sx={{ borderColor: alpha(storefrontColors.navy, 0.9), flex: 1 }} />
      <Typography sx={{ color: storefrontColors.navy, fontSize: '0.98rem', whiteSpace: 'nowrap' }}>
        OR
      </Typography>
      <Divider sx={{ borderColor: alpha(storefrontColors.navy, 0.9), flex: 1 }} />
    </Stack>

    <Button
      onClick={onRegister}
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
  </Stack>
);

export const AuthDrawer = ({ initialMode = 'login', onClose, open }: AuthDrawerProps) => {
  const [mode, setMode] = useState<AuthDrawerMode>(initialMode);
  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
  const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
  const login = useLogin({ onSuccess: onClose });
  const registerUser = useRegister({ onSuccess: onClose });

  const {
    formState: { errors: loginErrors },
    isSubmitting,
    onSubmit,
    register: registerLoginField,
    reset: resetLogin,
    setValue: setLoginValue,
    watch: watchLogin,
  } = login;

  const {
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
    canRequestOtp,
    control,
    isOtpRequested,
    isOtpRequesting,
    isRegistering,
    onSubmit: onRegisterSubmit,
    register: registerRegisterField,
    requestOtp,
    reset: resetRegister,
    setPhone,
  } = registerUser;
  const rememberMe = watchLogin('rememberMe');

  useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [initialMode, open]);

  const handleClose = () => {
    onClose();
    setMode(initialMode);
    setLoginPasswordVisible(false);
    setRegisterPasswordVisible(false);
    resetLogin();
    resetRegister();
  };

  const handleSwitchMode = (nextMode: AuthDrawerMode) => {
    resetLogin();
    resetRegister();
    setMode(nextMode);
  };

  const heading = mode === 'login' ? 'SIGN IN' : "Create your AV's Store account";

  return (
    <Drawer
      anchor="right"
      onClose={handleClose}
      open={open}
      sx={{
        zIndex: { md: 1300, xs: 1100 },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: alpha('#1d2330', 0.56),
            bottom: { md: 0, xs: 'calc(72px + env(safe-area-inset-bottom, 0px))' },
          },
        },
        paper: {
          sx: {
            backgroundColor: storefrontColors.surface,
            bottom: { md: 0, xs: 'calc(72px + env(safe-area-inset-bottom, 0px))' },
            height: {
              md: '100%',
              xs: 'calc(100% - 72px - env(safe-area-inset-bottom, 0px))',
            },
            maxWidth: '100vw',
            top: 0,
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
              <Stack
                autoComplete="off"
                component="form"
                onSubmit={(event) => void onSubmit(event)}
                spacing={2.6}
              >
                <TextField
                  autoComplete="off"
                  error={Boolean(loginErrors.email)}
                  fullWidth
                  helperText={loginErrors.email?.message}
                  label="Email"
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={drawerTextFieldSx}
                  {...registerLoginField('email')}
                />
                <TextField
                  autoComplete="new-password"
                  error={Boolean(loginErrors.password)}
                  fullWidth
                  helperText={loginErrors.password?.message}
                  label="Password"
                  sx={drawerTextFieldSx}
                  type={loginPasswordVisible ? 'text' : 'password'}
                  {...registerLoginField('password')}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => setLoginPasswordVisible((current) => !current)}
                          >
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

                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between', mt: -0.5 }}
                >
                  <Stack direction="row" spacing={0.7} sx={{ alignItems: 'center' }}>
                    <Checkbox
                      checked={rememberMe}
                      onChange={(event) => setLoginValue('rememberMe', event.target.checked)}
                      sx={{ p: 0 }}
                    />
                    <Typography
                      sx={{ color: storefrontColors.navy, fontSize: '0.98rem', fontWeight: 500 }}
                    >
                      Remember me
                    </Typography>
                  </Stack>
                  <Box
                    component="button"
                    onClick={() => toast('Forgot password is coming soon.')}
                    sx={{
                      background: 'transparent',
                      border: 0,
                      color: storefrontColors.navy,
                      cursor: 'pointer',
                      fontSize: '0.98rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                    type="button"
                  >
                    Forgot Password?
                  </Box>
                </Stack>

                <LoginActions
                  isSubmitting={isSubmitting}
                  onRegister={() => handleSwitchMode('register')}
                />
              </Stack>
            ) : (
              <Stack
                component="form"
                onSubmit={(event) => void onRegisterSubmit(event)}
                spacing={2.2}
              >
                <Box sx={{ mt: -1 }}>
                  <Typography sx={{ color: '#69717e', fontSize: '1rem', lineHeight: 1.65 }}>
                    Register once for faster checkout, order updates, and a more personal shopping
                    experience.
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    color: storefrontColors.navy,
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    pt: 0.8,
                    textTransform: 'uppercase',
                  }}
                >
                  Your details
                </Typography>

                <TextField
                  autoComplete="name"
                  error={Boolean(registerErrors.name)}
                  fullWidth
                  helperText={registerErrors.name?.message}
                  label="Name"
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={drawerTextFieldSx}
                  {...registerRegisterField('name')}
                />
                <TextField
                  autoComplete="email"
                  error={Boolean(registerErrors.email)}
                  fullWidth
                  helperText={registerErrors.email?.message}
                  label="Email ID"
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={drawerTextFieldSx}
                  {...registerRegisterField('email')}
                />

                <Box>
                  <Typography
                    sx={{ color: '#69717e', fontSize: '0.78rem', fontWeight: 700, mb: 0.75 }}
                  >
                    PHONE NUMBER
                  </Typography>
                  <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.2}>
                    <Box sx={phoneInputSx}>
                      <Controller
                        control={control}
                        name="phone"
                        render={({ field }) => (
                          <PhoneInput
                            country="mm"
                            countryCodeEditable={false}
                            disableDropdown
                            inputProps={{
                              autoComplete: 'tel',
                              name: field.name,
                            }}
                            onBlur={() => field.onBlur()}
                            onChange={setPhone}
                            placeholder="Enter phone number"
                            onlyCountries={['mm']}
                            value={field.value}
                          />
                        )}
                      />
                    </Box>
                    <Button
                      disabled={!canRequestOtp || isOtpRequesting}
                      onClick={requestOtp}
                      sx={{
                        borderRadius: 1.1,
                        flexShrink: 0,
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        minHeight: 60,
                        px: 2.4,
                        textTransform: 'none',
                      }}
                      type="button"
                      variant="contained"
                    >
                      {isOtpRequesting
                        ? 'Sending...'
                        : isOtpRequested
                          ? 'OTP Sent'
                          : 'Send OTP'}
                    </Button>
                  </Stack>
                  {registerErrors.phone ? (
                    <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', ml: 1.75, mt: 0.5 }}>
                      {registerErrors.phone.message}
                    </Typography>
                  ) : null}
                </Box>

                <TextField
                  autoComplete="one-time-code"
                  disabled={!isOtpRequested}
                  error={Boolean(registerErrors.otp)}
                  fullWidth
                  helperText={registerErrors.otp?.message}
                  label="Verification OTP"
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={drawerTextFieldSx}
                  {...registerRegisterField('otp')}
                />
                <TextField
                  autoComplete="new-password"
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
                          <IconButton
                            edge="end"
                            onClick={() => setRegisterPasswordVisible((current) => !current)}
                          >
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

                <Typography sx={{ color: '#69717e', fontSize: '0.92rem', lineHeight: 1.65 }}>
                  By continuing, I agree to{' '}
                  <Box
                    component="span"
                    sx={{ color: storefrontColors.navy, textDecoration: 'underline' }}
                  >
                    Terms of Use
                  </Box>{' '}
                  and{' '}
                  <Box
                    component="span"
                    sx={{ color: storefrontColors.navy, textDecoration: 'underline' }}
                  >
                    Privacy Policy
                  </Box>
                </Typography>

                <Button
                  disabled={isRegisterSubmitting || isRegistering || !isOtpRequested}
                  sx={{
                    ...drawerButtonSx,
                    color: '#ffffff',
                    '&.Mui-disabled': {
                      color: '#ffffff',
                    },
                  }}
                  type="submit"
                  variant="contained"
                >
                  {isRegistering ? 'Registering...' : 'Register User'}
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
