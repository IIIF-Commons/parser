import type { NormalizedLinkedEntity, NormalizedReference } from "../iiif/technical-v4";

export type TimelineNormalized = NormalizedLinkedEntity & {
  type: "Timeline";
  items: readonly NormalizedReference[];
  duration?: number;
};
