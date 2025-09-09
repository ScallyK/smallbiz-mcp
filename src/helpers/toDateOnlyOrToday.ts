// Converts a date string to a date-only string (YYYY-MM-DD) or returns today's date
export default function toDateOnlyOrToday(dateStr?: string) {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date string: ${dateStr}`);
  }
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}