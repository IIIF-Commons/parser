import type {
  Annotation,
  AnnotationCollection,
  Collection,
  CollectionPage,
  ImageResource,
  Manifest,
  ServiceReference,
} from "../../src/presentation-4/types";

const validManifest = {
  id: "https://example.org/manifest/1",
  type: "Manifest",
  label: { en: ["Manifest"] },
  start: { id: "https://example.org/canvas/1", type: "Canvas" },
  items: [
    {
      id: "https://example.org/canvas/1",
      type: "Canvas",
      height: 1000,
      width: 1000,
      items: [],
    },
  ],
  provider: [{ type: "Agent", label: { en: ["Provider"] } }],
} satisfies Manifest;

void validManifest;

const manifestWithSpecificStart = {
  id: "https://example.org/manifest/2",
  type: "Manifest",
  label: { en: ["Manifest"] },
  start: {
    id: "https://example.org/manifest/2/start/1",
    type: "SpecificResource",
    source: "https://example.org/canvas/2",
    selector: {
      type: "PointSelector",
      x: 10,
      y: 20,
    },
  },
  items: [],
} satisfies Manifest;

void manifestWithSpecificStart;

const manifestWithUnknownProperty = {
  id: "https://example.org/manifest/unknown",
  type: "Manifest",
  label: { en: ["Manifest"] },
  items: [],
  // @ts-expect-error unknown properties must be rejected
  unexpectedProperty: true,
} satisfies Manifest;

void manifestWithUnknownProperty;

const manifestWithStringStart = {
  id: "https://example.org/manifest/start-string",
  type: "Manifest",
  label: { en: ["Manifest"] },
  items: [],
  // @ts-expect-error start must be a JSON object, not a string
  start: "https://example.org/canvas/1",
} satisfies Manifest;

void manifestWithStringStart;

const validCollectionPage = {
  id: "https://example.org/collection/page/1",
  type: "CollectionPage",
  partOf: [{ id: "https://example.org/collection/1", type: "Collection" }],
  items: [{ id: "https://example.org/manifest/2", type: "Manifest" }],
} satisfies CollectionPage;

void validCollectionPage;

const collectionPageWithScalarItems = {
  id: "https://example.org/collection/page/2",
  type: "CollectionPage",
  partOf: [{ id: "https://example.org/collection/1", type: "Collection" }],
  // @ts-expect-error multi-valued properties must be arrays
  items: { id: "https://example.org/manifest/2", type: "Manifest" },
} satisfies CollectionPage;

void collectionPageWithScalarItems;

const annotationCollectionWithStart = {
  id: "https://example.org/annotations/1",
  type: "AnnotationCollection",
  label: { en: ["Annotations"] },
  first: { id: "https://example.org/annotations/1/page/1", type: "AnnotationPage" },
  last: { id: "https://example.org/annotations/1/page/2", type: "AnnotationPage" },
  // @ts-expect-error start is restricted to Collection | Manifest | Range
  start: { id: "https://example.org/canvas/1", type: "Canvas" },
} satisfies AnnotationCollection;

void annotationCollectionWithStart;

const validCollectionWithItems = {
  id: "https://example.org/collection/with-items",
  type: "Collection",
  label: { en: ["Collection"] },
  items: [{ id: "https://example.org/manifest/1", type: "Manifest" }],
} satisfies Collection;

void validCollectionWithItems;

const validCollectionWithPages = {
  id: "https://example.org/collection/with-pages",
  type: "Collection",
  label: { en: ["Collection"] },
  first: { id: "https://example.org/collection/with-pages/page/1", type: "CollectionPage" },
  last: { id: "https://example.org/collection/with-pages/page/2", type: "CollectionPage" },
  total: 2,
} satisfies Collection;

void validCollectionWithPages;

// @ts-expect-error Collection must use items xor first/last paging
const collectionWithItemsAndPages: Collection = {
  id: "https://example.org/collection/invalid-both",
  type: "Collection",
  label: { en: ["Collection"] },
  items: [],
  first: { id: "https://example.org/collection/invalid-both/page/1", type: "CollectionPage" },
  last: { id: "https://example.org/collection/invalid-both/page/2", type: "CollectionPage" },
  total: 2,
};

void collectionWithItemsAndPages;

// @ts-expect-error Collection must include either items or first/last
const collectionWithNeitherItemsNorPages: Collection = {
  id: "https://example.org/collection/invalid-neither",
  type: "Collection",
  label: { en: ["Collection"] },
};

void collectionWithNeitherItemsNorPages;

const annotationCollectionWithItems = {
  id: "https://example.org/annotations/invalid-items",
  type: "AnnotationCollection",
  label: { en: ["Annotations"] },
  first: { id: "https://example.org/annotations/invalid-items/page/1", type: "AnnotationPage" },
  last: { id: "https://example.org/annotations/invalid-items/page/2", type: "AnnotationPage" },
  // @ts-expect-error AnnotationCollection is paging-only and must not include items
  items: [{ id: "https://example.org/annotation/1", type: "Annotation" }],
} satisfies AnnotationCollection;

void annotationCollectionWithItems;

const validAnnotationObjectBodyTarget = {
  id: "https://example.org/annotation/1",
  type: "Annotation",
  motivation: ["painting"],
  body: { id: "https://example.org/image/1/full/full/0/default.jpg", type: "Image" },
  target: { id: "https://example.org/canvas/1", type: "Canvas" },
} satisfies Annotation;

void validAnnotationObjectBodyTarget;

const annotationWithScalarMotivation = {
  id: "https://example.org/annotation/motivation-scalar",
  type: "Annotation",
  // @ts-expect-error multi-valued properties must be arrays
  motivation: "painting",
  target: { id: "https://example.org/canvas/motivation-scalar", type: "Canvas" },
} satisfies Annotation;

void annotationWithScalarMotivation;

const validAnnotationListBodyTarget = {
  id: "https://example.org/annotation/2",
  type: "Annotation",
  motivation: ["commenting"],
  body: {
    type: "List",
    items: [{ id: "https://example.org/text/1", type: "TextualBody", value: "One body" }],
  },
  target: {
    type: "List",
    items: [{ id: "https://example.org/canvas/2", type: "Canvas" }],
  },
} satisfies Annotation;

void validAnnotationListBodyTarget;

const annotationWithArrayBodyAndTarget = {
  id: "https://example.org/annotation/3",
  type: "Annotation",
  motivation: ["painting"],
  // @ts-expect-error body must be an object (or List object), not an array
  body: [{ id: "https://example.org/image/3/full/full/0/default.jpg", type: "Image" }],
  // @ts-expect-error target must be an object (or List object), not an array
  target: [{ id: "https://example.org/canvas/3", type: "Canvas" }],
} satisfies Annotation;

void annotationWithArrayBodyAndTarget;

const imageWithUnknownProperty = {
  id: "https://example.org/image/1",
  type: "Image",
  format: "image/jpeg",
  height: 100,
  width: 100,
  // @ts-expect-error unknown properties must be rejected
  arbitrary: true,
} satisfies ImageResource;

void imageWithUnknownProperty;

const imageWithScalarService = {
  id: "https://example.org/image/service-scalar",
  type: "Image",
  format: "image/jpeg",
  height: 100,
  width: 100,
  // @ts-expect-error service must be an array
  service: { id: "https://example.org/service/array-required", type: "ImageService3", profile: "level1" },
} satisfies ImageResource;

void imageWithScalarService;

const serviceWithUnknownProperty = {
  id: "https://example.org/service/1",
  type: "ImageService3",
  profile: "level1",
  // @ts-expect-error unknown properties must be rejected
  arbitrary: true,
} satisfies ServiceReference;

void serviceWithUnknownProperty;

const validServiceWithObjectProfile = {
  id: "https://example.org/service/2",
  type: "ImageService3",
  profile: { supports: ["regionByPx"] },
} satisfies ServiceReference;

void validServiceWithObjectProfile;

const serviceWithInvalidObjectProfile = {
  id: "https://example.org/service/3",
  type: "ImageService3",
  // @ts-expect-error profile object keys must match known service profile fields
  profile: { level: "1" },
} satisfies ServiceReference;

void serviceWithInvalidObjectProfile;
