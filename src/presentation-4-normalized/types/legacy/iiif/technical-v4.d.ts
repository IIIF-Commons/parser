import type { InternationalString } from "../../../../presentation-3/types";
import type { Selector, Service, Transform } from "../../../../presentation-4/types";
import type { MetadataItem } from "../../../../presentation-4/types/legacy/src/resources/contentResource";

export type NormalizedPrimitive = string | number | boolean | null;
export type NormalizedJsonValue = NormalizedPrimitive | NormalizedJsonValue[] | { [key: string]: NormalizedJsonValue };

export interface NormalizedReferenceObject {
  id: string;
  type: string;
}

export interface NormalizedSpecificResourceReference extends NormalizedReferenceObject {
  type: "SpecificResource";
  source: NormalizedReference;
  selector: readonly Selector[];
  transform: readonly Transform[];
  action: readonly NormalizedJsonValue[];
  purpose?: readonly string[];
  scope?: NormalizedReference | string | readonly (NormalizedReference | string)[];
  styleClass?: string;
}

export type NormalizedReference = NormalizedReferenceObject | NormalizedSpecificResourceReference;

export interface NormalizedFramingPart extends NormalizedReferenceObject {
  "@explicit"?: boolean;
  "iiif-parser:partOf"?: string;
  [key: string]:
    | NormalizedJsonValue
    | NormalizedReference
    | readonly NormalizedReference[]
    | readonly NormalizedFramingPart[]
    | undefined;
}

export interface NormalizedEntityBase extends NormalizedReferenceObject {
  "@context"?: NormalizedJsonValue | readonly NormalizedJsonValue[];
  "iiif-parser:hasPart"?: readonly NormalizedFramingPart[];
}

export interface NormalizedLinkedEntity extends NormalizedEntityBase {
  label: InternationalString | null;
  summary: InternationalString | null;
  metadata: readonly MetadataItem[];
  provider: readonly NormalizedReference[];
  thumbnail: readonly NormalizedReference[];
  behavior: readonly string[];
  seeAlso: readonly NormalizedReference[];
  service: readonly Service[];
  services: readonly Service[];
  homepage: readonly NormalizedReference[];
  rendering: readonly NormalizedReference[];
  partOf: readonly NormalizedReference[];
  annotations: readonly NormalizedReference[];
  rights?: string | null;
  navDate?: string;
  navPlace?: NormalizedJsonValue;
  requiredStatement?: MetadataItem | null;
  profile?: NormalizedJsonValue;
  format?: string;
  height?: number;
  width?: number;
  duration?: number;
  spatialScale?: number;
  temporalScale?: number;
  backgroundColor?: string;
  viewingDirection?: string;
  timeMode?: string;
  placeholderContainer?: NormalizedReference;
  accompanyingContainer?: NormalizedReference;
}
