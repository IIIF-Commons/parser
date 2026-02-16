export type * from "./legacy/index";

import { createPresentationHelpers, type ResourceSpecs } from "../../presentation-shared/helpers/create-helpers";
import type {
  Agent,
  Annotation,
  AnnotationCollection,
  AnnotationPage,
  Canvas,
  Collection,
  Manifest,
  Range,
  Scene,
  Timeline,
} from "./legacy/index";
import type {
  ContentResourceLike,
  AudioResource,
  DatasetResource,
  ImageResource,
  ModelResource,
  SpecificResource,
  TextResource,
  Quantity,
  VideoResource,
} from "./legacy/index";
import type {
  AmbientAudio,
  AmbientLight,
  DirectionalLight,
  OrthographicCamera,
  PerspectiveCamera,
  PointAudio,
  PointLight,
  SpotAudio,
  SpotLight,
} from "./legacy/index";
import type { Selector } from "./legacy/index";
import type { Transform } from "./legacy/index";

export type Container = Collection | Manifest | Timeline | Canvas | Scene;

export type Presentation4HelperTypes = {
  Collection: Collection;
  Manifest: Manifest;
  Timeline: Timeline;
  Canvas: Canvas;
  Scene: Scene;
  AnnotationPage: AnnotationPage;
  AnnotationCollection: AnnotationCollection;
  Annotation: Annotation;
  ContentResource: ContentResourceLike;
  Range: Range;
  Service: { id: string; type: string; profile?: string | string[] };
  Selector: Selector;
  Agent: Agent;
  Quantity: Quantity;
  Transform: Transform;
  SpecificResource: SpecificResource;
  Image: ImageResource;
  Audio: AudioResource;
  Video: VideoResource;
  Model: ModelResource;
  Text: TextResource;
  Dataset: DatasetResource;
  PerspectiveCamera: PerspectiveCamera;
  OrthographicCamera: OrthographicCamera;
  AmbientLight: AmbientLight;
  DirectionalLight: DirectionalLight;
  PointLight: PointLight;
  SpotLight: SpotLight;
  AmbientAudio: AmbientAudio;
  PointAudio: PointAudio;
  SpotAudio: SpotAudio;
};

const presentation4Specs: ResourceSpecs<Presentation4HelperTypes> = {
  Collection: { type: "Collection", aliases: ["sc:Collection"] },
  Manifest: { type: "Manifest", aliases: ["sc:Manifest"] },
  Timeline: { type: "Timeline" },
  Canvas: { type: "Canvas", aliases: ["sc:Canvas"] },
  Scene: { type: "Scene" },
  AnnotationPage: { type: "AnnotationPage", aliases: ["sc:AnnotationList"] },
  AnnotationCollection: { type: "AnnotationCollection", aliases: ["sc:Layer"] },
  Annotation: { type: "Annotation", aliases: ["oa:Annotation"] },
  ContentResource: {
    type: "ContentResource",
    aliases: ["Image", "Audio", "Sound", "Video", "Model", "Text", "Dataset", "TextualBody", "Choice"],
  },
  Range: { type: "Range", aliases: ["sc:Range"] },
  Service: { type: "Service" },
  Selector: { type: "Selector" },
  Agent: { type: "Agent" },
  Quantity: { type: "Quantity" },
  Transform: { type: "Transform", aliases: ["RotateTransform", "ScaleTransform", "TranslateTransform"] },
  SpecificResource: { type: "SpecificResource", aliases: ["oa:SpecificResource"] },
  Image: { type: "Image", aliases: ["dctypes:Image"] },
  Audio: { type: "Audio", aliases: ["Sound", "dctypes:Sound"] },
  Video: { type: "Video" },
  Model: { type: "Model" },
  Text: { type: "Text", aliases: ["TextualBody", "dctypes:Text"] },
  Dataset: { type: "Dataset" },
  PerspectiveCamera: { type: "PerspectiveCamera" },
  OrthographicCamera: { type: "OrthographicCamera" },
  AmbientLight: { type: "AmbientLight" },
  DirectionalLight: { type: "DirectionalLight" },
  PointLight: { type: "PointLight" },
  SpotLight: { type: "SpotLight" },
  AmbientAudio: { type: "AmbientAudio" },
  PointAudio: { type: "PointAudio" },
  SpotAudio: { type: "SpotAudio" },
};

const presentation4Helpers = createPresentationHelpers(presentation4Specs);

/** Runtime-checked identity helpers for Presentation 4 resources. */
export const infer = presentation4Helpers.infer;
/** Runtime assertion helpers for Presentation 4 resources. */
export const cast = presentation4Helpers.cast;
/** Type guards for Presentation 4 discriminated resources. */
export const narrow = presentation4Helpers.narrow;
