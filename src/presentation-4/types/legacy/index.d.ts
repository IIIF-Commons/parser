export * from "../../../presentation-3/types/legacy/src/change-discovery";
export * from "../../../presentation-3/types/legacy/src/extensions/nav-place";
export * from "../../../presentation-3/types/legacy/src/extensions/text-granularity";
export * from "../../../presentation-3/types/legacy/src/reference";
export type { ResourceProvider } from "../../../presentation-3/types/legacy/src/resources/provider";
export * from "../../../presentation-3/types/legacy/src/services/auth-2";
export * from "../../../presentation-3/types/legacy/src/services/auth-service";
export * from "../../../presentation-3/types/legacy/src/services/geo-json";
export * from "../../../presentation-3/types/legacy/src/services/image-service";
export * from "../../../presentation-3/types/legacy/src/services/search";
export * from "../../../presentation-3/types/legacy/src/services/search-2";
export * from "../../../presentation-3/types/legacy/src/utility";
export type {
  AnimationSelector,
  AudioContentSelector,
  CompositeSelector,
  FragmentSelector,
  ImageApiSelector,
  PointSelector,
  PolygonZSelector,
  Selector,
  SelectorBase,
  VisualContentSelector,
  WktSelector,
} from "./src/extensions/presentation-4";
export type {
  ExcludeType,
  InteractionMode,
  Provides,
  Quantity,
  RotateTransform,
  ScaleTransform,
  SpatialScale,
  TemporalScale,
  Transform,
  TransformBase,
  TranslateTransform,
} from "./src/iiif/technical";
export type {
  ActivatingAnnotation,
  Annotation,
  ContentStateAnnotation,
  Presentation4Annotation,
} from "./src/resources/annotation";
export type { AnnotationCollection } from "./src/resources/annotationCollection";
export type { AnnotationPage } from "./src/resources/annotationPage";
export type { Canvas, CanvasItemSchemas } from "./src/resources/canvas";
export type { Collection, CollectionItemSchemas } from "./src/resources/collection";
export type { CollectionPage } from "./src/resources/collectionPage";
export type {
  Agent,
  AgentLike,
  AudioResource,
  ChoiceResource,
  CompositeResource,
  ContentResource,
  ContentResourceBase,
  ContentResourceLike,
  DatasetResource,
  ImageResource,
  IndependentsResource,
  LanguageMap,
  ListResource,
  MetadataItem,
  ModelResource,
  ResourceReference,
  ServiceReference,
  SpecificResource,
  TextResource,
  TextualBodyResource,
  VideoResource,
} from "./src/resources/contentResource";
export type { Manifest } from "./src/resources/manifest";
export type { Range, RangeItem } from "./src/resources/range";
export type { Scene } from "./src/resources/scene";
export type {
  AmbientAudio,
  AmbientLight,
  AudioEmitter,
  Camera,
  DirectionalLight,
  Light,
  LookAtTarget,
  OrthographicCamera,
  PerspectiveCamera,
  PointAudio,
  PointLight,
  SceneComponent,
  SceneComponentBase,
  SpotAudio,
  SpotLight,
} from "./src/resources/scene-components";
export type { GenericService, Service } from "./src/resources/service";
export type { Timeline } from "./src/resources/timeline";
