import type { NormalizedLinkedEntity, NormalizedReference } from "../iiif/technical-v4";

export type SceneNormalized = NormalizedLinkedEntity & {
  type?: "Scene";
  items: readonly NormalizedReference[];
};
