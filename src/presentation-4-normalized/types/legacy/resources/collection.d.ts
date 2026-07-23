import type { NormalizedLinkedEntity, NormalizedReference } from "../iiif/technical-v4";

export type CollectionNormalized = NormalizedLinkedEntity & {
  type: "Collection";
  items: readonly NormalizedReference[];
};
