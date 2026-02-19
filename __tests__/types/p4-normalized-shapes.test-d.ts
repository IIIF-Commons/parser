import {
  emptyAgent,
  emptyAnnotation,
  emptyAnnotationCollection,
  emptyCanvas,
  emptyCollection,
  emptyContentResource,
  emptyManifest,
  emptyRange,
  emptySpecificResource,
  emptyTimeline,
} from "../../src/presentation-4/empty-types";
import type {
  AgentNormalized,
  AnnotationCollectionNormalized,
  AnnotationNormalized,
  CanvasNormalized,
  CollectionNormalized,
  ContentResourceNormalized,
  ManifestNormalized,
  RangeNormalized,
  SpecificResourceNormalized,
  TimelineNormalized,
} from "../../src/presentation-4-normalized/types";

const manifestWithContext = {
  ...emptyManifest,
  "@context": "http://iiif.io/api/presentation/4/context.json",
} satisfies ManifestNormalized;

void manifestWithContext;

const manifestWithExtendedLinking = {
  ...emptyManifest,
  behavior: ["paged"],
  rights: "https://creativecommons.org/licenses/by/4.0/",
  navDate: "2025-01-01T00:00:00Z",
  navPlace: { lat: 51.5, lng: -0.12 },
  requiredStatement: {
    label: { en: ["Attribution"] },
    value: { en: ["Provided by Example"] },
  },
  profile: ["example-profile", { level: 2 }],
  placeholderContainer: { id: "https://example.org/canvas/placeholder", type: "Canvas" },
  accompanyingContainer: { id: "https://example.org/canvas/accompanying", type: "Canvas" },
  "iiif-parser:hasPart": [
    {
      id: "https://example.org/manifest/part/1",
      type: "Manifest",
      "@explicit": true,
      "iiif-parser:partOf": "https://example.org/manifest/1",
    },
  ],
} satisfies ManifestNormalized;

void manifestWithExtendedLinking;

const canvasWithDuration = {
  ...emptyCanvas,
  duration: 12.5,
  viewingDirection: "left-to-right",
  backgroundColor: "#f6f6f6",
  temporalScale: 1,
  spatialScale: 2,
} satisfies CanvasNormalized;

void canvasWithDuration;

const canvasWithInvalidItems = {
  ...emptyCanvas,
  // @ts-expect-error canvas items must be an array of references
  items: { id: "https://example.org/page/1", type: "AnnotationPage" },
} satisfies CanvasNormalized;

void canvasWithInvalidItems;

const contentResourceWithTechnicalFields = {
  ...emptyContentResource,
  type: "Image",
  format: "image/jpeg",
  profile: "level1",
  height: 1200,
  width: 800,
  duration: 9,
  language: ["en", "fr"],
  behavior: ["no-nav"],
  service: [{ id: "https://example.org/service/image", type: "ImageService3", profile: "level1" }],
  services: [{ id: "https://example.org/service/auth", type: "AuthCookieService1" }],
  lookAt: { x: 10, y: 20, z: 30 },
  provides: ["subtitles", "translation"],
  selector: [{ type: "PointSelector", x: 10, y: 20, z: 3 }],
  transform: [{ type: "RotateTransform", z: 90 }],
  action: [{ type: "Highlight", target: "region-1" }],
} satisfies ContentResourceNormalized;

void contentResourceWithTechnicalFields;

const contentResourceWithInvalidLanguage = {
  ...emptyContentResource,
  type: "Text",
  // @ts-expect-error normalized language must be an array of strings
  language: "en",
} satisfies ContentResourceNormalized;

void contentResourceWithInvalidLanguage;

const specificResourceWithSelector = {
  ...emptySpecificResource,
  selector: [
    {
      type: "FragmentSelector",
      value: "xywh=10,20,30,40",
    },
  ],
  styleClass: "detail-region",
  action: [{ type: "Flash", duration: 1200 }],
} satisfies SpecificResourceNormalized;

void specificResourceWithSelector;

const specificResourceWithoutId = {
  ...emptySpecificResource,
  // @ts-expect-error normalized SpecificResource must include an id
  id: undefined,
} satisfies SpecificResourceNormalized;

void specificResourceWithoutId;

const specificResourceWithInvalidSource = {
  ...emptySpecificResource,
  // @ts-expect-error source must be a normalized reference object
  source: "https://example.org/canvas/1",
} satisfies SpecificResourceNormalized;

void specificResourceWithInvalidSource;

const annotationWithEmptyBody = {
  ...emptyAnnotation,
  target: { id: "https://example.org/canvas/1", type: "Canvas" },
  body: null,
} satisfies AnnotationNormalized;

void annotationWithEmptyBody;

const annotationWithSpecificResourceBody = {
  ...emptyAnnotation,
  motivation: ["painting", "commenting"],
  body: {
    id: "https://example.org/annotation/1/body/1",
    type: "SpecificResource",
    source: { id: "https://example.org/image/1", type: "Image" },
    selector: [{ type: "FragmentSelector", value: "xywh=0,0,100,100" }],
    transform: [],
    action: [],
  },
  target: {
    id: "https://example.org/canvas/2#t=10,20",
    type: "Canvas",
  },
} satisfies AnnotationNormalized;

void annotationWithSpecificResourceBody;

const annotationWithInvalidBody = {
  ...emptyAnnotation,
  target: { id: "https://example.org/canvas/1", type: "Canvas" },
  // @ts-expect-error body must be a normalized reference or null
  body: "https://example.org/image/1",
} satisfies AnnotationNormalized;

void annotationWithInvalidBody;

const rangeWithSupplementary = {
  ...emptyRange,
  start: { id: "https://example.org/canvas/5", type: "Canvas" },
  supplementary: [{ id: "https://example.org/annotation-collection/1", type: "AnnotationCollection" }],
} satisfies RangeNormalized;

void rangeWithSupplementary;

const rangeWithInvalidStart = {
  ...emptyRange,
  // @ts-expect-error start must be a normalized reference object
  start: "https://example.org/canvas/6",
} satisfies RangeNormalized;

void rangeWithInvalidStart;

const annotationCollectionWithPagingFields = {
  ...emptyAnnotationCollection,
  first: { id: "https://example.org/annotation-collection/1/page/1", type: "AnnotationPage" },
  last: { id: "https://example.org/annotation-collection/1/page/2", type: "AnnotationPage" },
  total: 2,
} satisfies AnnotationCollectionNormalized;

void annotationCollectionWithPagingFields;

const annotationCollectionWithNullPaging = {
  ...emptyAnnotationCollection,
  first: null,
  last: null,
  total: 0,
} satisfies AnnotationCollectionNormalized;

void annotationCollectionWithNullPaging;

const collectionWithFraming = {
  ...emptyCollection,
  items: [{ id: "https://example.org/manifest/1", type: "Manifest" }],
  "@context": ["http://iiif.io/api/presentation/4/context.json", { custom: true }],
} satisfies CollectionNormalized;

void collectionWithFraming;

const timelineWithTechnicalFields = {
  ...emptyTimeline,
  duration: 33.2,
  timeMode: "trimmed",
  items: [{ id: "https://example.org/canvas/1", type: "Canvas" }],
} satisfies TimelineNormalized;

void timelineWithTechnicalFields;

const agentWithLogoAndHomepage = {
  ...emptyAgent,
  logo: [{ id: "https://example.org/logo.png", type: "Image" }],
  homepage: [{ id: "https://example.org", type: "Text" }],
} satisfies AgentNormalized;

void agentWithLogoAndHomepage;
