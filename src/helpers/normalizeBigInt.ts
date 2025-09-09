// Helper function to normalize BigInt values in an object
export default function normalizeBigInt(obj: any): any {
  if (typeof obj === "bigint") {
    return obj.toString(); // or Number(obj) if safe
  }
  if (Array.isArray(obj)) {
    return obj.map(normalizeBigInt);
  }
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, normalizeBigInt(v)])
    );
  }
  return obj;
}
