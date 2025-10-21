/**
 * Get today's date in YYYY-MM-DD format using local timezone
 * This ensures "today" is correct regardless of user's timezone
 */
export function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get a date X days ago in YYYY-MM-DD format using local timezone
 */
export function getLocalDateDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date string for display
 */
export function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00'); // Noon to avoid timezone issues
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a timestamp for display (time only)
 */
export function formatTimeForDisplay(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}
