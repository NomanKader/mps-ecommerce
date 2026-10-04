import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import { MenuItem, TextField } from '@mui/material';

import { useI18n } from './I18nProvider';
import type { AppLanguage } from './i18n.types';

export const LanguageSelector = () => {
  const { language, setLanguage, t } = useI18n();

  return (
    <TextField
      aria-label={t('Language')}
      data-no-translate
      key={language}
      onChange={(event) => setLanguage(event.target.value as AppLanguage)}
      select
      size="small"
      slotProps={{
        input: {
          startAdornment: <LanguageRoundedIcon sx={{ fontSize: 18, mr: 0.75 }} />,
        },
        select: {
          MenuProps: { disableScrollLock: true },
          renderValue: (value) => t(value === 'my' ? 'Myanmar' : 'English'),
        },
      }}
      sx={{
        minWidth: 132,
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#ffffff',
          borderRadius: 2,
          boxShadow: '0 8px 22px rgba(120, 20, 16, 0.18)',
          color: '#c9231f',
          fontWeight: 800,
          height: 36,
          '& fieldset': { borderColor: 'rgba(255,255,255,0.88)', borderWidth: 2 },
          '&:hover': { backgroundColor: '#fff7f4' },
          '&:hover fieldset': { borderColor: '#ffffff' },
          '&.Mui-focused fieldset': { borderColor: '#ffffff' },
        },
        '& .MuiSelect-icon': { color: '#c9231f' },
      }}
      value={language}
    >
      <MenuItem value="en">{t('English')}</MenuItem>
      <MenuItem value="my">{t('Myanmar')}</MenuItem>
    </TextField>
  );
};
