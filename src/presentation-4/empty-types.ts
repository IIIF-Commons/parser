import type {
  AgentNormalized,
  AnnotationCollectionNormalized,
  AnnotationNormalized,
  AnnotationPageNormalized,
  CanvasNormalized,
  CollectionNormalized,
  ContentResourceNormalized,
  ManifestNormalized,
  RangeNormalized,
  SceneNormalized,
  SpecificResourceNormalized,
  TimelineNormalized,
} from "../presentation-4-normalized/types";
import { EMPTY_ARRAY } from "./utilities";

const baseLinkedArrays = {
  label: null,
  summary: null,
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

export const emptyCollection: CollectionNormalized = {
  id: "https://iiif-parser/empty-collection",
  type: "Collection",
  items: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyManifest: ManifestNormalized = {
  id: "https://iiif-parser/empty-manifest",
  type: "Manifest",
  items: EMPTY_ARRAY,
  structures: EMPTY_ARRAY,
  start: null,
  rights: null,
  requiredStatement: null,
  ...baseLinkedArrays,
};

export const emptyTimeline: TimelineNormalized = {
  id: "https://iiif-parser/empty-timeline",
  type: "Timeline",
  duration: 0,
  items: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyCanvas: CanvasNormalized = {
  id: "https://iiif-parser/empty-canvas",
  type: "Canvas",
  height: 0,
  width: 0,
  items: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyScene: SceneNormalized = {
  id: "https://iiif-parser/empty-scene",
  type: "Scene",
  items: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyAnnotationPage: AnnotationPageNormalized = {
  id: "https://iiif-parser/empty-annotation-page",
  type: "AnnotationPage",
  items: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyAnnotationCollection: AnnotationCollectionNormalized = {
  id: "https://iiif-parser/empty-annotation-collection",
  type: "AnnotationCollection",
  items: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyAnnotation: AnnotationNormalized = {
  id: "https://iiif-parser/empty-annotation",
  type: "Annotation",
  motivation: EMPTY_ARRAY,
  body: EMPTY_ARRAY,
  target: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyRange: RangeNormalized = {
  id: "https://iiif-parser/empty-range",
  type: "Range",
  items: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptyAgent: AgentNormalized = {
  id: "https://iiif-parser/empty-agent",
  type: "Agent",
  logo: EMPTY_ARRAY,
  ...baseLinkedArrays,
};

export const emptySpecificResource: SpecificResourceNormalized = {
  id: "https://iiif-parser/empty-specific-resource",
  type: "SpecificResource",
  source: {
    id: "https://iiif-parser/empty-specific-resource/source",
    type: "Canvas",
  },
  selector: EMPTY_ARRAY,
  transform: EMPTY_ARRAY,
  action: EMPTY_ARRAY,
};

export const emptyContentResource: ContentResourceNormalized = {
  id: "https://iiif-parser/empty-content-resource",
  type: "ContentResource",
  value: null,
  language: EMPTY_ARRAY,
  items: EMPTY_ARRAY,
  selector: EMPTY_ARRAY,
  transform: EMPTY_ARRAY,
  action: EMPTY_ARRAY,
  provides: EMPTY_ARRAY,
  ...baseLinkedArrays,
};
