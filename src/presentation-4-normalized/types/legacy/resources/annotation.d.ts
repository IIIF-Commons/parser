import type { NormalizedLinkedEntity, NormalizedReference } from "../iiif/technical-v4";

export type AnnotationNormalized = NormalizedLinkedEntity & {
  type: "Annotation";
  motivation: readonly string[];
  body?: readonly NormalizedReference[];
  target: readonly NormalizedReference[];
};
