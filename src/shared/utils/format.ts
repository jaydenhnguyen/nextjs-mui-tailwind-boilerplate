import { format as formatDateFns, formatDistanceToNow, isValid } from 'date-fns';
import { siteConfig } from 'src/configs/site.config';

type DateInput = Date | string | number | null | undefined;

const EMPTY = '—';

const toDate = (value: DateInput) => {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return isValid(date) ? date : null;
};

// Patterns use date-fns tokens: https://date-fns.org/docs/format
export function formatDate(value: DateInput, pattern = 'dd MMM yyyy') {
  const date = toDate(value);
  return date ? formatDateFns(date, pattern) : EMPTY;
}

export function formatDateTime(value: DateInput, pattern = 'dd MMM yyyy, HH:mm') {
  return formatDate(value, pattern);
}

export function formatRelativeTime(value: DateInput) {
  const date = toDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : EMPTY;
}

export function formatNumber(value: number | null | undefined, options?: Intl.NumberFormatOptions) {
  if (value === null || value === undefined || Number.isNaN(value)) return EMPTY;
  return new Intl.NumberFormat(siteConfig.locale, options).format(value);
}

export function formatCurrency(value: number | null | undefined, currency = 'USD', options?: Intl.NumberFormatOptions) {
  return formatNumber(value, { style: 'currency', currency, ...options });
}

// Takes a ratio: 0.25 becomes "25%".
export function formatPercent(value: number | null | undefined, fractionDigits = 0) {
  return formatNumber(value, { style: 'percent', maximumFractionDigits: fractionDigits });
}

export function formatCompactNumber(value: number | null | undefined) {
  return formatNumber(value, { notation: 'compact', maximumFractionDigits: 1 });
}

export function formatFileSize(bytes: number | null | undefined) {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return EMPTY;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)), units.length - 1);
  return `${formatNumber(bytes / 1024 ** exponent, { maximumFractionDigits: exponent === 0 ? 0 : 1 })} ${units[exponent]}`;
}
