import type { ExcludeType } from "../../../../presentation-4/types";
import type { NormalizedJsonValue, NormalizedLinkedEntity, NormalizedReference } from "../iiif/technical-v4";

export type AnnotationTargetNormalized =
  | NormalizedReference
  | ({
      id: string;
      type: string;
    } & Record<string, NormalizedJsonValue>);

export type AnnotationNormalized = NormalizedLinkedEntity & {
  type: "Annotation";
  motivation: readonly string[];
  body: NormalizedReference | null;
  target: AnnotationTargetNormalized;
  provides: readonly string[];
  exclude?: readonly ExcludeType[];
  scope?: readonly NormalizedReference[];
  position?: NormalizedReference;
};
