import type { Selector, Transform } from "../../../../presentation-4/types";
import type {
  NormalizedEntityBase,
  NormalizedJsonValue,
  NormalizedLinkedEntity,
  NormalizedReference,
} from "../iiif/technical-v4";

export type SpecificResourceNormalized = NormalizedEntityBase & {
  id: string;
  type: "SpecificResource";
  source: NormalizedReference;
  selector: readonly Selector[];
  transform: readonly Transform[];
  action: readonly NormalizedJsonValue[];
  scope?: readonly NormalizedReference[];
  canonical?: string;
  via?: readonly string[];
  styleClass?: string;
};

export type ContentResourceNormalized = NormalizedLinkedEntity & {
  [extension: string]: unknown;
  type: string;
  language: readonly string[];
  items: readonly NormalizedReference[];
  selector: readonly Selector[];
  transform: readonly Transform[];
  action: readonly NormalizedJsonValue[];
  purpose?: readonly string[];
  provides: readonly string[];
  fileSize?: number;
  lookAt?: NormalizedJsonValue;
  properties?: NormalizedJsonValue;
  geometry?: NormalizedJsonValue;
  // @todo normalize to string | null
  value: string | null;
};
