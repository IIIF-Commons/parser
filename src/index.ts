// Exports the latest
export * from "./presentation-3";
// Keep the reserved-word export explicit so declaration bundlers preserve its
// imported alias for TypeScript versions prior to 5.9.
export { infer } from "./presentation-3/types";
export { infer as infer2, cast as cast2, narrow as narrow2 } from "./presentation-2/types";
export { infer as infer3, cast as cast3, narrow as narrow3 } from "./presentation-3/types";
export { infer as infer4, cast as cast4, narrow as narrow4 } from "./presentation-4/types";
