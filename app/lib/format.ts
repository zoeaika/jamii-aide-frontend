const DISPLAY_LOCALE = 'en-KE';
const DISPLAY_TIME_ZONE = 'Africa/Nairobi';

const isValidDate = (value: Date) => !Number.isNaN(value.getTime());

export const formatKES = (value: number | string | null | undefined): string => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) {
    return '0';
  }
  return amount.toLocaleString(DISPLAY_LOCALE);
};

export const formatDate = (
  input: string | number | Date,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
): string => {
  const date = input instanceof Date ? input : new Date(input);
  if (!isValidDate(date)) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    timeZone: DISPLAY_TIME_ZONE,
    ...options,
  }).format(date);
};

export const formatDateTime = (
  input: string | number | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
): string => {
  const date = input instanceof Date ? input : new Date(input);
  if (!isValidDate(date)) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    timeZone: DISPLAY_TIME_ZONE,
    ...options,
  }).format(date);
};

export const formatMonthShort = (input: string | number | Date): string =>
  formatDate(input, { month: 'short' });

export const formatRelativeTime = (input: string | number | Date): string => {
  const date = input instanceof Date ? input : new Date(input);
  if (!isValidDate(date)) {
    return 'N/A';
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(date);
};
