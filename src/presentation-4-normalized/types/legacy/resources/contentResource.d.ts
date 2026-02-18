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
  source: NormalizedReference | readonly NormalizedReference[];
  selector: Selector | readonly Selector[];
  transform: Transform | readonly Transform[];
  action: readonly NormalizedJsonValue[];
  styleClass?: string;
};

export type ContentResourceNormalized = NormalizedLinkedEntity & {
  type: string;
  language: readonly string[];
  items: readonly NormalizedReference[];
  selector: readonly Selector[];
  transform: readonly Transform[];
  action: readonly NormalizedJsonValue[];
  provides: readonly string[];
  lookAt?: NormalizedJsonValue;
  // @todo normalize to string | null
  value: string | null;
};
