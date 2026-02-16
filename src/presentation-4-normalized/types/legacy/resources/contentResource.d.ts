import type { NormalizedEntityBase, NormalizedLinkedEntity, NormalizedReference } from "../iiif/technical-v4";

export type SpecificResourceNormalized = NormalizedEntityBase & {
  type?: "SpecificResource";
  source?: NormalizedReference | NormalizedReference[];
  selector: readonly NormalizedReference[];
  transform: readonly NormalizedReference[];
  action: readonly NormalizedReference[];
};

export type ContentResourceNormalized = NormalizedLinkedEntity & {
  type?: string;
  language: readonly string[];
  items: readonly NormalizedReference[];
  selector: readonly NormalizedReference[];
  transform: readonly NormalizedReference[];
  action: readonly NormalizedReference[];
  provides: readonly string[];
};
