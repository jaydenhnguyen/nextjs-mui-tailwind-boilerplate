import { describe, expect, it } from 'vitest';
import { formatDate, formatFileSize, formatNumber, formatPercent } from './format';

describe('formatDate', () => {
  it('formats a date', () => {
    expect(formatDate('2026-03-05T12:00:00Z')).toBe('05 Mar 2026');
  });

  it('shows a dash for missing or invalid values', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('')).toBe('—');
    expect(formatDate('not a date')).toBe('—');
  });
});

describe('number formatting', () => {
  it('formats numbers, percents and file sizes', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatPercent(0.25)).toBe('25%');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });
});
