import {
  AnnotationNormalized,
  AnnotationPageNormalized,
  CanvasNormalized,
  CollectionNormalized,
  ManifestNormalized,
  RangeNormalized,
} from "@iiif/presentation-3";

export const emptyAnnotation: AnnotationNormalized = {
  id: "https://iiif-parser/annotation",
  type: "Annotation",
  behavior: [],
  label: null,
  thumbnail: [],
  summary: null,
  requiredStatement: null,
  metadata: [],
  seeAlso: [],
  homepage: null,
  logo: [],
  rendering: [],
  service: [],
  accessibility: [],
  audience: [],
  body: [],
  bodyValue: null,
  canonical: null,
  created: null,
  creator: [],
  generated: null,
  generator: [],
  modified: null,
  motivation: [],
  rights: [],
  stylesheet: null,
  target: [],
  timeMode: undefined, // @todo bug? should be null.
  via: [],
  partOf: [],
};

export const emptyAnnotationPage: AnnotationPageNormalized = {
  id: "https://iiif-parser/annotation-page",
  type: "AnnotationPage",
  behavior: [],
  motivation: null,
  label: null,
  thumbnail: [],
  summary: null,
  requiredStatement: null,
  metadata: [],
  rights: null,
  provider: [],
  items: [],
  seeAlso: [],
  homepage: null,
  logo: [],
  rendering: [],
  service: [],
};

export const emptyCanvas: CanvasNormalized = {
  id: "https://iiif-parser/empty-canvas",
  type: "Canvas",
  label: null,
  behavior: [],
  motivation: null,
  thumbnail: [],
  posterCanvas: null,
  accompanyingCanvas: null,
  placeholderCanvas: null,
  summary: null,
  requiredStatement: null,
  metadata: [],
  rights: null,
  navDate: null,
  provider: [],
  items: [],
  annotations: [],
  seeAlso: [],
  homepage: null,
  logo: [],
  partOf: [],
  rendering: [],
  service: [],
  duration: 0,
  height: 0,
  width: 0,
};

export const emptyCollection: CollectionNormalized = {
  id: "https://iiif-parser/empty-collection",
  type: "Collection",
  label: null,
  viewingDirection: "left-to-right",
  behavior: [],
  motivation: null,
  thumbnail: [],
  posterCanvas: null,
  accompanyingCanvas: null,
  placeholderCanvas: null,
  summary: null,
  requiredStatement: null,
  metadata: [],
  rights: null,
  navDate: null,
  provider: [],
  items: [],
  annotations: [],
  seeAlso: [],
  homepage: null,
  logo: [],
  partOf: [],
  rendering: [],
  service: [],
  services: [],
};

export const emptyManifest: ManifestNormalized = {
  id: "https://iiif-parser/empty-manifest",
  type: "Manifest",
  annotations: [],
  behavior: [],
  homepage: null,
  items: [],
  label: null,
  logo: [],
  metadata: [],
  motivation: null,
  navDate: null,
  provider: [],
  partOf: [],
  posterCanvas: null,
  accompanyingCanvas: null,
  placeholderCanvas: null,
  rendering: [],
  requiredStatement: null,
  rights: null,
  seeAlso: [],
  service: [],
  services: [],
  start: null,
  structures: [],
  summary: null,
  thumbnail: [],
  viewingDirection: "left-to-right",
};

export const emptyRange: RangeNormalized = {
  id: "https://iiif-parser/empty-canvas",
  type: "Range",
  label: null,
  behavior: [],
  motivation: null,
  thumbnail: [],
  posterCanvas: null,
  accompanyingCanvas: null,
  placeholderCanvas: null,
  summary: null,
  requiredStatement: null,
  metadata: [],
  rights: null,
  navDate: null,
  provider: [],
  items: [],
  annotations: [],
  seeAlso: [],
  homepage: null,
  logo: [],
  partOf: [],
  rendering: [],
  service: [],
  start: null,
  supplementary: null,
  viewingDirection: "left-to-right",
};
