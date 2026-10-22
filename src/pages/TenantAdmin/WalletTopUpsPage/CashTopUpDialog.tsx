import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Autocomplete,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import toast from 'react-hot-toast';

import { adminApi } from '@features/admin/api/adminApi';
import { toApiError } from '@shared/api/apiError';
import { PersistentDialog as Dialog } from '@shared/components/ui/Dialog/AppDialog';
import { formatCurrency } from '@utils/formatCurrency';

type CashTopUpDialogProps = {
  onClose: () => void;
};

export const CashTopUpDialog = ({ onClose }: CashTopUpDialogProps) => {
  const queryClient = useQueryClient();
  const [customerEmail, setCustomerEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const customersQuery = useQuery({
    queryFn: ({ signal }) => adminApi.listCustomers({}, { signal }),
    queryKey: ['admin', 'customers', 'cash-topup'],
  });
  const customers = customersQuery.data ?? [];
  const amountValue = Number(amount);
  const validAmount = Number.isSafeInteger(amountValue) && amountValue >= 100;
  const validEmail = /\S+@\S+\.\S+/.test(customerEmail.trim());
  const mutation = useMutation({
    mutationFn: () =>
      adminApi.loadCustomerWallet({
        adminNote: note.trim() || undefined,
        amount: amountValue,
        customerEmail: customerEmail.trim().toLowerCase(),
      }),
    onSuccess: (result) => {
      toast.success(
        `${formatCurrency(result.data.amount)} loaded for ${result.data.customerName}. New balance: ${formatCurrency(result.data.balance)}`,
      );
      void queryClient.invalidateQueries({ queryKey: ['wallet'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
      onClose();
    },
  });

  return (
    <Dialog fullWidth maxWidth="sm" open onClose={() => !mutation.isPending && onClose()}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (validEmail && validAmount && !mutation.isPending) mutation.mutate();
        }}
      >
        <DialogTitle>Cash wallet top-up</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info">
              Confirm cash has been received at the shop before loading the wallet. The amount is
              credited immediately and recorded in the customer’s wallet history.
            </Alert>
            <Autocomplete
              disabled={mutation.isPending}
              freeSolo
              inputValue={customerEmail}
              loading={customersQuery.isLoading}
              onInputChange={(_event, value) => setCustomerEmail(value)}
              options={customers.map((customer) => customer.email)}
              filterOptions={(options, { inputValue }) => {
                const search = inputValue.trim().toLowerCase();
                return options.filter((email) => {
                  const customer = customers.find((item) => item.email === email);
                  return `${customer?.name ?? ''} ${email}`.toLowerCase().includes(search);
                });
              }}
              renderOption={(props, email) => {
                const customer = customers.find((item) => item.email === email);
                return (
                  <li {...props} key={email}>
                    {customer?.name} — {email}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  autoFocus
                  helperText="Search by name or email, or enter a registered customer’s email."
                  label="Customer email"
                  required
                />
              )}
            />
            {customersQuery.isError ? (
              <Alert severity="warning">
                Customer suggestions could not load. You can still enter an email.
              </Alert>
            ) : null}
            <TextField
              disabled={mutation.isPending}
              error={amount !== '' && !validAmount}
              helperText="Minimum 100 MMK. Enter the exact cash amount in whole MMK."
              label="Cash amount"
              onChange={(event) => setAmount(event.target.value)}
              required
              slotProps={{
                htmlInput: { min: 100, step: 1 },
                input: { endAdornment: <InputAdornment position="end">MMK</InputAdornment> },
              }}
              type="number"
              value={amount}
            />
            <TextField
              disabled={mutation.isPending}
              label="Admin note (optional)"
              multiline
              onChange={(event) => setNote(event.target.value)}
              placeholder="Cash paid at shop / receipt number"
              rows={3}
              slotProps={{ htmlInput: { maxLength: 300 } }}
              value={note}
            />
            {mutation.isError ? (
              <Alert severity="error">{toApiError(mutation.error).message}</Alert>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button disabled={mutation.isPending} onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!validEmail || !validAmount || mutation.isPending}
            type="submit"
            variant="contained"
          >
            {mutation.isPending ? 'Loading wallet…' : 'Load wallet'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
