export const formatIDR = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const parseIDR = (value: string): number => {
  const numeric = value.replace(/[^0-9]/g, '');
  return parseInt(numeric, 10) || 0;
};
