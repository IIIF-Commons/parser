export type * from "./legacy/index";

import type {
  AgentNormalized,
  AnnotationCollectionNormalized,
  AnnotationNormalized,
  AnnotationPageNormalized,
  CanvasNormalized,
  CollectionNormalized,
  ContentResourceNormalized,
  ManifestNormalized,
  NormalizedEntityBase,
  NormalizedFramingPart,
  NormalizedLinkedEntity,
  NormalizedReference,
  RangeNormalized,
  SceneNormalized,
  ServiceNormalized,
  SpecificResourceNormalized,
  TimelineNormalized,
} from "./legacy/index";

export interface SelectorNormalized extends NormalizedEntityBase {
  type: string;
  selectors: readonly NormalizedReference[];
}

export interface QuantityNormalized extends NormalizedEntityBase {
  type: "Quantity";
}

export interface TransformNormalized extends NormalizedEntityBase {
  type: string;
}

export type NormalizedEntity =
  | CollectionNormalized
  | ManifestNormalized
  | TimelineNormalized
  | CanvasNormalized
  | SceneNormalized
  | AnnotationPageNormalized
  | AnnotationCollectionNormalized
  | AnnotationNormalized
  | ContentResourceNormalized
  | SpecificResourceNormalized
  | RangeNormalized
  | ServiceNormalized
  | SelectorNormalized
  | AgentNormalized
  | QuantityNormalized
  | TransformNormalized;

export type Presentation4Entities = {
  Collection: Record<string, CollectionNormalized>;
  Manifest: Record<string, ManifestNormalized>;
  Timeline: Record<string, TimelineNormalized>;
  Canvas: Record<string, CanvasNormalized>;
  Scene: Record<string, SceneNormalized>;
  AnnotationPage: Record<string, AnnotationPageNormalized>;
  AnnotationCollection: Record<string, AnnotationCollectionNormalized>;
  Annotation: Record<string, AnnotationNormalized>;
  ContentResource: Record<string, ContentResourceNormalized | SpecificResourceNormalized>;
  Range: Record<string, RangeNormalized>;
  Service: Record<string, ServiceNormalized>;
  Selector: Record<string, SelectorNormalized>;
  Agent: Record<string, AgentNormalized>;
  Quantity: Record<string, QuantityNormalized>;
  Transform: Record<string, TransformNormalized>;
};

export type Presentation4MappingType = keyof Presentation4Entities;

export type Presentation4NormalizeResult = {
  entities: Presentation4Entities;
  resource: { id: string; type: Presentation4MappingType };
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
