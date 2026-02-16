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

export type NormalizedReferenceV4 = NormalizedReference;
export type NormalizedFramingPartV4 = NormalizedFramingPart;
export type NormalizedEntityV4Base = NormalizedEntityBase;
export type NormalizedLinkedEntityV4 = NormalizedLinkedEntity;

export type CollectionNormalizedV4 = CollectionNormalized;
export type ManifestNormalizedV4 = ManifestNormalized;
export type TimelineNormalizedV4 = TimelineNormalized;
export type CanvasNormalizedV4 = CanvasNormalized;
export type SceneNormalizedV4 = SceneNormalized;
export type AnnotationPageNormalizedV4 = AnnotationPageNormalized;
export type AnnotationCollectionNormalizedV4 = AnnotationCollectionNormalized;
export type AnnotationNormalizedV4 = AnnotationNormalized;
export type RangeNormalizedV4 = RangeNormalized;
export type ServiceNormalizedV4 = ServiceNormalized;
export type AgentNormalizedV4 = AgentNormalized;
export type SpecificResourceNormalizedV4 = SpecificResourceNormalized;
export type ContentResourceNormalizedV4 = ContentResourceNormalized;

export interface SelectorNormalizedV4 extends NormalizedEntityV4Base {
  type?: string;
  selectors: readonly NormalizedReferenceV4[];
}

export interface QuantityNormalizedV4 extends NormalizedEntityV4Base {
  type?: "Quantity";
}

export interface TransformNormalizedV4 extends NormalizedEntityV4Base {
  type?: string;
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
