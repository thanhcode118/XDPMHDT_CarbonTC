/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Format tiền tệ với locale Việt Nam (VND)
 */
export const formatCurrency = (
  value: number | string | null | undefined,
): string => {
  if (value == null || value === '') return '-';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '-';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(numValue);
};

/**
 * Format tiền tệ USD
 */
export const formatCurrencyUSD = (
  value: number | string | null | undefined,
): string => {
  if (value == null || value === '') return '-';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '-';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numValue);
};

/**
 * Format tiền tệ với ký hiệu viết tắt (K, M, B)
 */
export const formatCurrencyCompact = (
  value: number | string | null | undefined,
): string => {
  if (value == null || value === '') return '-';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '-';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    notation: 'compact',
    compactDisplay: 'short',
  }).format(numValue);
};

/**
 * Format tiền tệ không có ký hiệu đơn vị (chỉ số)
 */
export const formatCurrencyPlain = (
  value: number | string | null | undefined,
  decimals: number = 0,
): string => {
  if (value == null || value === '') return '-';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '-';

  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
};

/**
 * Format tiền tệ với đơn vị tùy chỉnh
 */
export const formatCurrencyWithUnit = (
  value: number | string | null | undefined,
  currency: 'VND' | 'USD' | string = 'VND',
): string => {
  if (value == null || value === '') return '-';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '-';

  const locale = currency === 'VND' ? 'vi-VN' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(numValue);
};

// DataGrid wrappers
export const formatCurrencyGrid = (params: { value: any }): string =>
  formatCurrency(params.value);

export const formatCurrencyUSDGrid = (params: { value: any }): string =>
  formatCurrencyUSD(params.value);

export const formatCurrencyCompactGrid = (params: { value: any }): string =>
  formatCurrencyCompact(params.value);

export const formatCurrencyPlainGrid =
  (decimals: number = 0) =>
  (params: { value: any }): string =>
    formatCurrencyPlain(params.value, decimals);

// Currency formatters object
export const currencyFormatters = {
  vnd: formatCurrency,
  usd: formatCurrencyUSD,
  compact: formatCurrencyCompact,
  plain: formatCurrencyPlain,
  custom: formatCurrencyWithUnit,
};

export default {
  formatCurrency,
  formatCurrencyUSD,
  formatCurrencyCompact,
  formatCurrencyPlain,
  formatCurrencyWithUnit,
  currencyFormatters,
};
