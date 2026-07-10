import {
  Dialog as MuiDialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  type DialogProps,
} from '@mui/material';
import type { ReactNode } from 'react';

export const PersistentDialog = ({ onClose, ...props }: DialogProps) => (
  <MuiDialog
    {...props}
    onClose={(event, reason) => {
      if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
      onClose?.(event, reason);
    }}
  />
);

type AppDialogProps = DialogProps & {
  actions?: ReactNode;
  description?: ReactNode;
  title: string;
};

export const AppDialog = ({ actions, description, title, ...props }: AppDialogProps) => (
  <PersistentDialog fullWidth maxWidth="sm" {...props}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>{description}</DialogContent>
    {actions ? <DialogActions>{actions}</DialogActions> : null}
  </PersistentDialog>
);
