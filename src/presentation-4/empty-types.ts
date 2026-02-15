import { EMPTY_ARRAY, EMPTY_OBJECT } from "./utilities";

export const emptyCollection = {
  id: "https://iiif-parser/empty-collection",
  type: "Collection",
  label: EMPTY_OBJECT,
  items: EMPTY_ARRAY,
  metadata: EMPTY_ARRAY,
  summary: EMPTY_OBJECT,
  provider: EMPTY_ARRAY,
  thumbnail: EMPTY_ARRAY,
  behavior: EMPTY_ARRAY,
  service: EMPTY_ARRAY,
  services: EMPTY_ARRAY,
  homepage: EMPTY_ARRAY,
  rendering: EMPTY_ARRAY,
  seeAlso: EMPTY_ARRAY,
  annotations: EMPTY_ARRAY,
};

export const emptyManifest = {
  id: "https://iiif-parser/empty-manifest",
  type: "Manifest",
  label: EMPTY_OBJECT,
  items: EMPTY_ARRAY,
  structures: EMPTY_ARRAY,
  annotations: EMPTY_ARRAY,
  metadata: EMPTY_ARRAY,
  summary: EMPTY_OBJECT,
  provider: EMPTY_ARRAY,
  thumbnail: EMPTY_ARRAY,
  behavior: EMPTY_ARRAY,
  service: EMPTY_ARRAY,
  services: EMPTY_ARRAY,
  homepage: EMPTY_ARRAY,
  rendering: EMPTY_ARRAY,
  seeAlso: EMPTY_ARRAY,
};

export const emptyTimeline = {
  id: "https://iiif-parser/empty-timeline",
  type: "Timeline",
  label: EMPTY_OBJECT,
  duration: 0,
  items: EMPTY_ARRAY,
  annotations: EMPTY_ARRAY,
  behavior: EMPTY_ARRAY,
};

export const emptyCanvas = {
  id: "https://iiif-parser/empty-canvas",
  type: "Canvas",
  label: EMPTY_OBJECT,
  width: 0,
  height: 0,
  items: EMPTY_ARRAY,
  annotations: EMPTY_ARRAY,
  behavior: EMPTY_ARRAY,
};

export const emptyScene = {
  id: "https://iiif-parser/empty-scene",
  type: "Scene",
  label: EMPTY_OBJECT,
  items: EMPTY_ARRAY,
  annotations: EMPTY_ARRAY,
  behavior: EMPTY_ARRAY,
};

export const emptyAnnotationPage = {
  id: "https://iiif-parser/empty-annotation-page",
  type: "AnnotationPage",
  items: EMPTY_ARRAY,
};

export const emptyAnnotationCollection = {
  id: "https://iiif-parser/empty-annotation-collection",
  type: "AnnotationCollection",
  items: EMPTY_ARRAY,
};

export const emptyAnnotation = {
  id: "https://iiif-parser/empty-annotation",
  type: "Annotation",
  motivation: EMPTY_ARRAY,
  body: EMPTY_ARRAY,
  target: EMPTY_ARRAY,
};

export const emptyRange = {
  id: "https://iiif-parser/empty-range",
  type: "Range",
  label: EMPTY_OBJECT,
  items: EMPTY_ARRAY,
};

export const emptyAgent = {
  id: "https://iiif-parser/empty-agent",
  type: "Agent",
  label: EMPTY_OBJECT,
};

export const emptyService = {
  id: "https://iiif-parser/empty-service",
  type: "Service",
};
