export * from "../../../presentation-3/types/legacy/src/services/auth-service";
export * from "../../../presentation-3/types/legacy/src/services/geo-json";
export * from "../../../presentation-3/types/legacy/src/services/image-service";
export * from "../../../presentation-3/types/legacy/src/services/search";
export * from "../../../presentation-3/types/legacy/src/services/search-2";
export * from "../../../presentation-3/types/legacy/src/services/auth-2";
export * from "../../../presentation-3/types/legacy/src/iiif/descriptive";
export * from "../../../presentation-3/types/legacy/src/iiif/linking";
export * from "../../../presentation-3/types/legacy/src/iiif/structural";
export * from "../../../presentation-3/types/legacy/src/iiif/technical";
export * from "../../../presentation-3/types/legacy/src/utility";
export * from "../../../presentation-3/types/legacy/src/reference";
export * from "../../../presentation-3/types/legacy/src/extensions/nav-place";
export * from "../../../presentation-3/types/legacy/src/extensions/text-granularity";
export * from "../../../presentation-3/types/legacy/src/change-discovery";
export type { Agent } from "../../../presentation-3/types/legacy/src/resources/annotation";
export type { ResourceProvider } from "../../../presentation-3/types/legacy/src/resources/provider";

export type {
  Annotation,
  ContentStateAnnotation,
  ActivatingAnnotation,
  Presentation4Annotation,
} from "./src/resources/annotation";
export type { AnnotationCollection } from "./src/resources/annotationCollection";
export type { AnnotationPage } from "./src/resources/annotationPage";
export type { Canvas, CanvasItemSchemas } from "./src/resources/canvas";
export type { Collection, CollectionItemSchemas } from "./src/resources/collection";
export type {
  LanguageMap,
  MetadataItem,
  ResourceReference,
  ServiceReference,
  ContentResourceBase,
  ImageResource,
  AudioResource,
  VideoResource,
  ModelResource,
  TextResource,
  DatasetResource,
  TextualBodyResource,
  ChoiceResource,
  SpecificResource,
  ContentResourceLike,
  ContentResource,
} from "./src/resources/contentResource";
export type { Manifest } from "./src/resources/manifest";
export type { Range, RangeItem } from "./src/resources/range";
export type { Service, GenericService } from "./src/resources/service";
export type { Timeline } from "./src/resources/timeline";
export type { Scene } from "./src/resources/scene";
export type {
  LookAtTarget,
  SceneComponentBase,
  PerspectiveCamera,
  OrthographicCamera,
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
  AmbientAudio,
  PointAudio,
  SpotAudio,
  Camera,
  Light,
  AudioEmitter,
  SceneComponent,
} from "./src/resources/scene-components";

export type {
  SelectorBase,
  PointSelector,
  FragmentSelector,
  ImageApiSelector,
  AudioContentSelector,
  VisualContentSelector,
  WktSelector,
  PolygonZSelector,
  AnimationSelector,
  CompositeSelector,
  Selector,
} from "./src/extensions/presentation-4";

export type {
  InteractionMode,
  Provides,
  ExcludeType,
  Quantity,
  SpatialScale,
  TemporalScale,
  TransformBase,
  RotateTransform,
  ScaleTransform,
  TranslateTransform,
  Transform,
} from "./src/iiif/technical-v4";
