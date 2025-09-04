import { z } from "zod";

const rfc3339Regex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?)(Z|[+-]\d{2}:\d{2})$/;

export const zRFC3339 = z.string().refine((date) => rfc3339Regex.test(date), {
  message:
    "Invalid date format. Must be RFC3339 (e.g. 2025-09-03T14:30:00Z or 2025-09-03T14:30:00-05:00)",
});
