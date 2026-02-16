import type { NormalizedLinkedEntity, NormalizedReference } from "../iiif/technical-v4";

export type AnnotationCollectionNormalized = NormalizedLinkedEntity & {
  type?: "AnnotationCollection";
  items: readonly NormalizedReference[];
};
