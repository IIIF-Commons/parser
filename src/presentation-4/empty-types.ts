import type {
  AgentNormalizedV4,
  AnnotationCollectionNormalizedV4,
  AnnotationNormalizedV4,
  AnnotationPageNormalizedV4,
  CanvasNormalizedV4,
  CollectionNormalizedV4,
  ContentResourceNormalizedV4,
  ManifestNormalizedV4,
  QuantityNormalizedV4,
  RangeNormalizedV4,
  SceneNormalizedV4,
  SelectorNormalizedV4,
  ServiceNormalizedV4,
  SpecificResourceNormalizedV4,
  TimelineNormalizedV4,
  TransformNormalizedV4,
} from "../presentation-4-normalized/types";
import { EMPTY_ARRAY } from "./utilities";

const baseLinkedArrays = {
  metadata: EMPTY_ARRAY,
  provider: EMPTY_ARRAY,
  thumbnail: EMPTY_ARRAY,
  behavior: EMPTY_ARRAY,
  seeAlso: EMPTY_ARRAY,
  service: EMPTY_ARRAY,
  services: EMPTY_ARRAY,
  homepage: EMPTY_ARRAY,
  rendering: EMPTY_ARRAY,
  partOf: EMPTY_ARRAY,
  annotations: EMPTY_ARRAY,
};

export const emptyCollection: CollectionNormalizedV4 = {
  id: "https://iiif-parser/empty-collection",
  type: "Collection",
  items: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyManifest: ManifestNormalizedV4 = {
  id: "https://iiif-parser/empty-manifest",
  type: "Manifest",
  items: EMPTY_ARRAY,
  structures: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyTimeline: TimelineNormalizedV4 = {
  id: "https://iiif-parser/empty-timeline",
  type: "Timeline",
  items: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyCanvas: CanvasNormalizedV4 = {
  id: "https://iiif-parser/empty-canvas",
  type: "Canvas",
  items: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyScene: SceneNormalizedV4 = {
  id: "https://iiif-parser/empty-scene",
  type: "Scene",
  items: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyAnnotationPage: AnnotationPageNormalizedV4 = {
  id: "https://iiif-parser/empty-annotation-page",
  type: "AnnotationPage",
  items: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyAnnotationCollection: AnnotationCollectionNormalizedV4 = {
  id: "https://iiif-parser/empty-annotation-collection",
  type: "AnnotationCollection",
  items: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyAnnotation: AnnotationNormalizedV4 = {
  id: "https://iiif-parser/empty-annotation",
  type: "Annotation",
  motivation: EMPTY_ARRAY,
  body: EMPTY_ARRAY,
  target: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyRange: RangeNormalizedV4 = {
  id: "https://iiif-parser/empty-range",
  type: "Range",
  items: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyAgent: AgentNormalizedV4 = {
  id: "https://iiif-parser/empty-agent",
  type: "Agent",
  logo: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyService: ServiceNormalizedV4 = {
  id: "https://iiif-parser/empty-service",
  type: "Service",
  service: EMPTY_ARRAY,
};

export const emptySelector: SelectorNormalizedV4 = {
  id: "https://iiif-parser/empty-selector",
  type: "Selector",
  selectors: EMPTY_ARRAY,
};

export const emptyQuantity: QuantityNormalizedV4 = {
  id: "https://iiif-parser/empty-quantity",
  type: "Quantity",
};

export const emptyTransform: TransformNormalizedV4 = {
  id: "https://iiif-parser/empty-transform",
  type: "Transform",
};

export const emptySpecificResource: SpecificResourceNormalizedV4 = {
  type: "SpecificResource",
  selector: EMPTY_ARRAY,
  transform: EMPTY_ARRAY,
  action: EMPTY_ARRAY,
};

export const emptyContentResource: ContentResourceNormalizedV4 = {
  id: "https://iiif-parser/empty-content-resource",
  type: "ContentResource",
  language: EMPTY_ARRAY,
  items: EMPTY_ARRAY,
  selector: EMPTY_ARRAY,
  transform: EMPTY_ARRAY,
  action: EMPTY_ARRAY,
  provides: EMPTY_ARRAY,
  ...baseLinkedArrays,
};
