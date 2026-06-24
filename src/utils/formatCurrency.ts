export const formatCurrency = (amount: number, _currency = 'MMK') =>
  `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount)} MMK`;
