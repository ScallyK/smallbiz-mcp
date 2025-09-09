import { z } from "zod";

export const zPhoneNumber = z
    .string()
    .min(9, "Phone number must contain at least 9 digits")
    .max(16, "Phone number must contain at most 16 digits")
    .regex(
        /^(\+)?[\d\s().-]{9,20}$/,
        "Phone number can only contain digits, spaces, +, (, ), -, and ."
    )
    .refine(
        (val) => (val.match(/\d/g) || []).length >= 9 && (val.match(/\d/g) || []).length <= 16,
        "Phone number must contain between 9 and 16 digits"
    )