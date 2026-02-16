export * from "../../../presentation-3-normalized/types/legacy/iiif/descriptive";
export * from "../../../presentation-3-normalized/types/legacy/iiif/linking";
export * from "../../../presentation-3-normalized/types/legacy/iiif/structural";

export type {
  NormalizedReference,
  NormalizedFramingPart,
  NormalizedEntityBase,
  NormalizedLinkedEntity,
} from "./iiif/technical-v4";

export type { CollectionNormalized } from "./resources/collection";
export type { ManifestNormalized } from "./resources/manifest";
export type { TimelineNormalized } from "./resources/timeline";
export type { CanvasNormalized } from "./resources/canvas";
export type { SceneNormalized } from "./resources/scene";
export type { AnnotationPageNormalized } from "./resources/annotationPage";
export type { AnnotationCollectionNormalized } from "./resources/annotationCollection";
export type { AnnotationNormalized } from "./resources/annotation";
export type { RangeNormalized } from "./resources/range";
export type { ServiceNormalized } from "./resources/service";
export type { AgentNormalized, ProviderNormalized } from "./resources/provider";
export type { ContentResourceNormalized, SpecificResourceNormalized } from "./resources/contentResource";
export type { SceneComponentNormalized } from "./resources/scene-components";
