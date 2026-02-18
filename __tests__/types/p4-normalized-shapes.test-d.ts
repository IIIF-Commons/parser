import {
  emptyAnnotation,
  emptyAnnotationCollection,
  emptyCanvas,
  emptyContentResource,
  emptyManifest,
  emptyRange,
  emptySpecificResource,
} from "../../src/presentation-4/empty-types";
import type {
  AnnotationCollectionNormalized,
  AnnotationNormalized,
  CanvasNormalized,
  ContentResourceNormalized,
  ManifestNormalized,
  RangeNormalized,
  SpecificResourceNormalized,
} from "../../src/presentation-4-normalized/types";

const manifestWithContext = {
  ...emptyManifest,
  "@context": "http://iiif.io/api/presentation/4/context.json",
} satisfies ManifestNormalized;

void manifestWithContext;

const canvasWithDuration = {
  ...emptyCanvas,
  duration: 12.5,
} satisfies CanvasNormalized;

void canvasWithDuration;

const contentResourceWithTechnicalFields = {
  ...emptyContentResource,
  type: "Image",
  format: "image/jpeg",
  profile: "level1",
  height: 1200,
  width: 800,
  duration: 9,
} satisfies ContentResourceNormalized;

void contentResourceWithTechnicalFields;

const specificResourceWithSelector = {
  ...emptySpecificResource,
  selector: [
    {
      type: "FragmentSelector",
      value: "xywh=10,20,30,40",
    },
  ],
} satisfies SpecificResourceNormalized;

void specificResourceWithSelector;

const specificResourceWithoutId = {
  ...emptySpecificResource,
  // @ts-expect-error normalized SpecificResource must include an id
  id: undefined,
} satisfies SpecificResourceNormalized;

void specificResourceWithoutId;

const annotationWithEmptyBody = {
  ...emptyAnnotation,
  target: { id: "https://example.org/canvas/1", type: "Canvas" },
  body: null,
} satisfies AnnotationNormalized;

void annotationWithEmptyBody;

const rangeWithSupplementary = {
  ...emptyRange,
  supplementary: [{ id: "https://example.org/annotation-collection/1", type: "AnnotationCollection" }],
} satisfies RangeNormalized;

void rangeWithSupplementary;

const annotationCollectionWithPagingFields = {
  ...emptyAnnotationCollection,
  first: { id: "https://example.org/annotation-collection/1/page/1", type: "AnnotationPage" },
  last: { id: "https://example.org/annotation-collection/1/page/2", type: "AnnotationPage" },
  total: 2,
} satisfies AnnotationCollectionNormalized;

void annotationCollectionWithPagingFields;
