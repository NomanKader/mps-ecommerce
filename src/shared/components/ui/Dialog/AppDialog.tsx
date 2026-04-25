import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  type DialogProps,
} from '@mui/material';
import type { ReactNode } from 'react';

type AppDialogProps = DialogProps & {
  actions?: ReactNode;
  description?: ReactNode;
  title: string;
};

export const AppDialog = ({ actions, description, title, ...props }: AppDialogProps) => (
  <Dialog fullWidth maxWidth="sm" {...props}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>{description}</DialogContent>
    {actions ? <DialogActions>{actions}</DialogActions> : null}
  </Dialog>
);
