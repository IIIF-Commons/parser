import type { NormalizedLinkedEntity, NormalizedReference } from "../iiif/technical-v4";

export type CollectionPageNormalized = NormalizedLinkedEntity & {
  type: "CollectionPage";
  items: readonly NormalizedReference[];
  next: NormalizedReference | null;
  prev: NormalizedReference | null;
  startIndex?: number;
};
