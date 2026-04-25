export const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    currency,
    style: 'currency',
  }).format(amount);
