import type { NormalizedLinkedEntity, NormalizedReference } from "../iiif/technical-v4";

export type ManifestNormalized = NormalizedLinkedEntity & {
  type?: "Manifest";
  items: readonly NormalizedReference[];
  structures: readonly NormalizedReference[];
  start?: NormalizedReference | null;
};
