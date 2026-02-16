export type NormalizedReference =
  | string
  | {
      id?: string;
      type?: string;
      [key: string]: unknown;
    };

export type NormalizedFramingPart = {
  id?: string;
  type?: string;
  "@explicit"?: boolean;
  "iiif-parser:partOf"?: string;
  [key: string]: unknown;
};

export interface NormalizedEntityBase {
  id?: string;
  type?: string;
  "@id"?: string;
  "@type"?: string;
  "iiif-parser:hasPart"?: NormalizedFramingPart[];
  [key: string]: unknown;
}

export interface NormalizedLinkedEntity extends NormalizedEntityBase {
  metadata: readonly unknown[];
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
