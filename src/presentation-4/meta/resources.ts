/**
 * Presentation 4 resource type inventory derived from the model specification.
 */

const all = [
  "Agent",
  "AmbientAudio",
  "AmbientLight",
  "AnimationSelector",
  "Annotation",
  "AnnotationCollection",
  "AnnotationPage",
  "AudioContentSelector",
  "AudioEmitters",
  "Camera",
  "Canvas",
  "Choice",
  "Collection",
  "CollectionPage",
  "DirectionalLight",
  "FragmentSelector",
  "ImageApiSelector",
  "Light",
  "Manifest",
  "OrthographicCamera",
  "PerspectiveCamera",
  "PointAudio",
  "PointLight",
  "PointSelector",
  "Quantity",
  "Range",
  "RotateTransform",
  "ScaleTransform",
  "Scene",
  "Service",
  "SpecificResource",
  "SpotAudio",
  "SpotLight",
  "SvgSelector",
  "TextualBody",
  "Timeline",
  "Transforms",
  "TranslateTransform",
  "VisualContentSelector",
  "WktSelector"
] as const;

export type Presentation4ResourceType = (typeof all)[number];

export const resources = {
  all,
  groups: {
  "topLevel": [
    "Collection",
    "Manifest",
    "Range"
  ],
  "paging": [
    "CollectionPage"
  ],
  "containers": [
    "Canvas",
    "Scene",
    "Timeline"
  ],
  "annotations": [
    "Annotation",
    "AnnotationCollection",
    "AnnotationPage",
    "Choice",
    "SpecificResource",
    "TextualBody"
  ],
  "selectors": [
    "AnimationSelector",
    "AudioContentSelector",
    "FragmentSelector",
    "ImageApiSelector",
    "PointSelector",
    "SvgSelector",
    "VisualContentSelector",
    "WktSelector"
  ],
  "sceneComponents": [
    "AmbientAudio",
    "AmbientLight",
    "AudioEmitters",
    "Camera",
    "DirectionalLight",
    "Light",
    "OrthographicCamera",
    "PerspectiveCamera",
    "PointAudio",
    "PointLight",
    "RotateTransform",
    "ScaleTransform",
    "SpotAudio",
    "SpotLight",
    "Transforms",
    "TranslateTransform"
  ],
  "utility": [
    "Agent",
    "Quantity",
    "Service"
  ],
  "other": []
} as const,
} as const;
