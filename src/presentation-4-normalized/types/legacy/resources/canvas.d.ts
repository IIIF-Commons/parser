import type { NormalizedLinkedEntity, NormalizedReference } from "../iiif/technical-v4";

export type CanvasNormalized = NormalizedLinkedEntity & {
  type: "Canvas";
  height: number;
  width: number;
  items: readonly NormalizedReference[];
};
