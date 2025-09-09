// Converts a date string to ISO format or returns the current date
export default function toIsoOrNow(dateStr?: string) {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date string: ${dateStr}`);
  }
  return d.toISOString();
}