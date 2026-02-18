import type { NormalizedLinkedEntity, NormalizedReference } from "../iiif/technical-v4";

export type RangeNormalized = NormalizedLinkedEntity & {
  type: "Range";
  items: readonly NormalizedReference[];
  start?: NormalizedReference;
  supplementary?: NormalizedReference | readonly NormalizedReference[];
};
