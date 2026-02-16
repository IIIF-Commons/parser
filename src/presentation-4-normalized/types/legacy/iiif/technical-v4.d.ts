import type { MetadataItem } from "../../../../presentation-4/types/legacy/src/resources/contentResource";

export type NormalizedPrimitive = string | number | boolean | null;
export type NormalizedJsonValue = NormalizedPrimitive | NormalizedJsonValue[] | { [key: string]: NormalizedJsonValue };

export interface NormalizedReferenceObject {
  id?: string;
  type?: string;
  "@id"?: string;
  "@type"?: string;
  [key: string]: NormalizedJsonValue | NormalizedReference | readonly NormalizedReference[] | undefined;
}

export interface NormalizedSpecificResourceReference extends NormalizedReferenceObject {
  type?: "SpecificResource";
  source?: NormalizedReference | readonly NormalizedReference[];
  selector?: readonly NormalizedReference[];
  transform?: readonly NormalizedReference[];
  action?: readonly NormalizedReference[];
  purpose?: readonly string[];
  scope?: NormalizedReference | string | readonly (NormalizedReference | string)[];
  styleClass?: string;
}

export type NormalizedReference = string | NormalizedReferenceObject | NormalizedSpecificResourceReference;

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
  "iiif-parser:hasPart"?: readonly NormalizedFramingPart[];
  [key: string]:
    | NormalizedJsonValue
    | NormalizedReference
    | readonly NormalizedReference[]
    | readonly NormalizedFramingPart[]
    | undefined;
}

export interface NormalizedLinkedEntity extends NormalizedEntityBase {
  metadata: readonly MetadataItem[];
  provider: readonly NormalizedReference[];
  thumbnail: readonly NormalizedReference[];
  behavior: readonly string[];
  seeAlso: readonly NormalizedReference[];
  service: readonly NormalizedReference[];
  services: readonly NormalizedReference[];
  homepage: readonly NormalizedReference[];
  rendering: readonly NormalizedReference[];
  partOf: readonly NormalizedReference[];
  annotations: readonly NormalizedReference[];
}
