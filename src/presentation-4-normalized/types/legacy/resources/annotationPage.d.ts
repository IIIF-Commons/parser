import type { NormalizedLinkedEntity, NormalizedReference } from "../iiif/technical-v4";

export type AnnotationPageNormalized = NormalizedLinkedEntity & {
  type: "AnnotationPage";
  items: readonly NormalizedReference[];
};
