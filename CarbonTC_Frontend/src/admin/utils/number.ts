/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Format số với locale Việt Nam
 */
export const formatNumber = (
  value: number | string | null | undefined,
): string => {
  if (value == null || value === '') return '-';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '-';
  return new Intl.NumberFormat('vi-VN').format(numValue);
};

/**
 * Format số nguyên (không thập phân)
 */
export const formatInteger = (
  value: number | string | null | undefined,
): string => {
  if (value == null || value === '') return '-';
  const numValue = typeof value === 'string' ? parseInt(value) : value;
  if (isNaN(numValue)) return '-';
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(
    numValue,
  );
};

/**
 * Format số thập phân với số chữ số sau dấu phẩy tùy chỉnh
 */
export const formatDecimal = (
  value: number | string | null | undefined,
  decimals: number = 2,
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
 * Format phần trăm
 */
export const formatPercentage = (
  value: number | string | null | undefined,
  decimals: number = 1,
): string => {
  if (value == null || value === '') return '-';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '-';
  return new Intl.NumberFormat('vi-VN', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue / 100);
};

/**
 * Format số với ký hiệu viết tắt (K, M, B)
 */
export const formatCompact = (
  value: number | string | null | undefined,
): string => {
  if (value == null || value === '') return '-';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '-';
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(numValue);
};

/**
 * Format với đơn vị tùy chỉnh
 */
export const formatWithUnit = (
  value: number | string | null | undefined,
  unit: string,
): string => {
  if (value == null || value === '') return '-';
  const formatted = formatNumber(value);
  return `${formatted} ${unit}`;
};

// DataGrid wrappers
export const formatNumberGrid = (params: { value: any }): string =>
  formatNumber(params.value);
export const formatIntegerGrid = (params: { value: any }): string =>
  formatInteger(params.value);
export const formatDecimalGrid =
  (decimals: number = 2) =>
  (params: { value: any }): string =>
    formatDecimal(params.value, decimals);
export const formatPercentageGrid =
  (decimals: number = 1) =>
  (params: { value: any }): string =>
    formatPercentage(params.value, decimals);
export const formatCompactGrid = (params: { value: any }): string =>
  formatCompact(params.value);

// Common formatters
export const formatters = {
  number: formatNumber,
  integer: formatInteger,
  decimal: formatDecimal,
  percentage: formatPercentage,
  compact: formatCompact,

  quantity: (value: number | string | null | undefined) =>
    formatWithUnit(value, 'cái'),
  weight: (value: number | string | null | undefined) =>
    formatWithUnit(value, 'kg'),
  distance: (value: number | string | null | undefined) =>
    formatWithUnit(value, 'km'),
};

export const formatPhoneGrid = (raw?: string) => {
  if (!raw) return '-';
  const s = String(raw).replace(/\D+/g, '');

  if (s.startsWith('+84')) {
    const digits = s.slice(3).replace(/\D/g, '');
    return digits ? `+84 ${digits}` : s;
  }

  if (/^84\d+$/.test(s)) {
    const digits = s.slice(2);
    return `+84 0${digits}`;
  }

  if (s.startsWith('0') && /^\d{9,10}$/.test(s)) {
    const digits = s.slice(1);
    return `+84 ${digits}`;
  }

  return raw;
};

export default {
  formatNumber,
  formatInteger,
  formatDecimal,
  formatPercentage,
  formatCompact,
  formatWithUnit,
  formatters,
};
