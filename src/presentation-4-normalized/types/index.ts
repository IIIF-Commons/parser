export type NormalizedReferenceV4 =
  | string
  | {
      id?: string;
      type?: string;
      [key: string]: unknown;
    };

export type NormalizedFramingPartV4 = {
  id?: string;
  type?: string;
  "@explicit"?: boolean;
  "iiif-parser:partOf"?: string;
  [key: string]: unknown;
};

export interface NormalizedEntityV4Base {
  id?: string;
  type?: string;
  "@id"?: string;
  "@type"?: string;
  "iiif-parser:hasPart"?: NormalizedFramingPartV4[];
  [key: string]: unknown;
}

export interface NormalizedLinkedEntityV4 extends NormalizedEntityV4Base {
  metadata: readonly unknown[];
  provider: readonly NormalizedReferenceV4[];
  thumbnail: readonly NormalizedReferenceV4[];
  behavior: readonly string[];
  seeAlso: readonly NormalizedReferenceV4[];
  service: readonly NormalizedReferenceV4[];
  services: readonly NormalizedReferenceV4[];
  homepage: readonly NormalizedReferenceV4[];
  rendering: readonly NormalizedReferenceV4[];
  partOf: readonly NormalizedReferenceV4[];
  annotations: readonly NormalizedReferenceV4[];
}

export interface CollectionNormalizedV4 extends NormalizedLinkedEntityV4 {
  type?: "Collection";
  items: readonly NormalizedReferenceV4[];
}

export interface ManifestNormalizedV4 extends NormalizedLinkedEntityV4 {
  type?: "Manifest";
  items: readonly NormalizedReferenceV4[];
  structures: readonly NormalizedReferenceV4[];
}

export interface TimelineNormalizedV4 extends NormalizedLinkedEntityV4 {
  type?: "Timeline";
  items: readonly NormalizedReferenceV4[];
}

export interface CanvasNormalizedV4 extends NormalizedLinkedEntityV4 {
  type?: "Canvas";
  items: readonly NormalizedReferenceV4[];
}

export interface SceneNormalizedV4 extends NormalizedLinkedEntityV4 {
  type?: "Scene";
  items: readonly NormalizedReferenceV4[];
}

export interface AnnotationPageNormalizedV4 extends NormalizedLinkedEntityV4 {
  type?: "AnnotationPage";
  items: readonly NormalizedReferenceV4[];
}

export interface AnnotationCollectionNormalizedV4 extends NormalizedLinkedEntityV4 {
  type?: "AnnotationCollection";
  items: readonly NormalizedReferenceV4[];
}

export interface AnnotationNormalizedV4 extends NormalizedLinkedEntityV4 {
  type?: "Annotation";
  motivation: readonly string[];
  body: readonly NormalizedReferenceV4[];
  target: readonly NormalizedReferenceV4[];
}

export interface RangeNormalizedV4 extends NormalizedLinkedEntityV4 {
  type?: "Range";
  items: readonly NormalizedReferenceV4[];
}

export interface ServiceNormalizedV4 extends NormalizedEntityV4Base {
  type?: string;
  service: readonly NormalizedReferenceV4[];
}

export interface SelectorNormalizedV4 extends NormalizedEntityV4Base {
  type?: string;
  selectors: readonly NormalizedReferenceV4[];
}

export interface AgentNormalizedV4 extends NormalizedLinkedEntityV4 {
  type?: "Agent";
  logo: readonly NormalizedReferenceV4[];
}

export interface QuantityNormalizedV4 extends NormalizedEntityV4Base {
  type?: "Quantity";
}

export interface TransformNormalizedV4 extends NormalizedEntityV4Base {
  type?: string;
}

export interface SpecificResourceNormalizedV4 extends NormalizedEntityV4Base {
  type?: "SpecificResource";
  source?: NormalizedReferenceV4 | NormalizedReferenceV4[];
  selector: readonly NormalizedReferenceV4[];
  transform: readonly NormalizedReferenceV4[];
  action: readonly NormalizedReferenceV4[];
}

export interface ContentResourceNormalizedV4 extends NormalizedLinkedEntityV4 {
  type?: string;
  language: readonly string[];
  items: readonly NormalizedReferenceV4[];
  selector: readonly NormalizedReferenceV4[];
  transform: readonly NormalizedReferenceV4[];
  action: readonly NormalizedReferenceV4[];
  provides: readonly string[];
}

export type NormalizedEntityV4 =
  | CollectionNormalizedV4
  | ManifestNormalizedV4
  | TimelineNormalizedV4
  | CanvasNormalizedV4
  | SceneNormalizedV4
  | AnnotationPageNormalizedV4
  | AnnotationCollectionNormalizedV4
  | AnnotationNormalizedV4
  | ContentResourceNormalizedV4
  | SpecificResourceNormalizedV4
  | RangeNormalizedV4
  | ServiceNormalizedV4
  | SelectorNormalizedV4
  | AgentNormalizedV4
  | QuantityNormalizedV4
  | TransformNormalizedV4;

export type Presentation4Entities = {
  Collection: Record<string, CollectionNormalizedV4>;
  Manifest: Record<string, ManifestNormalizedV4>;
  Timeline: Record<string, TimelineNormalizedV4>;
  Canvas: Record<string, CanvasNormalizedV4>;
  Scene: Record<string, SceneNormalizedV4>;
  AnnotationPage: Record<string, AnnotationPageNormalizedV4>;
  AnnotationCollection: Record<string, AnnotationCollectionNormalizedV4>;
  Annotation: Record<string, AnnotationNormalizedV4>;
  ContentResource: Record<string, ContentResourceNormalizedV4 | SpecificResourceNormalizedV4>;
  Range: Record<string, RangeNormalizedV4>;
  Service: Record<string, ServiceNormalizedV4>;
  Selector: Record<string, SelectorNormalizedV4>;
  Agent: Record<string, AgentNormalizedV4>;
  Quantity: Record<string, QuantityNormalizedV4>;
  Transform: Record<string, TransformNormalizedV4>;
};

export type Presentation4MappingType = keyof Presentation4Entities | string;

export type Presentation4NormalizeResult = {
  entities: Presentation4Entities;
  resource: { id: string; type: string };
  mapping: Record<string, Presentation4MappingType>;
  diagnostics: Array<{
    code: string;
    severity: "error" | "warning" | "info";
    message: string;
    path: string;
    resourceType?: string;
    resourceId?: string;
    specRef?: string;
  }>;
  sourceVersion: 2 | 3 | 4 | "unknown";
};
