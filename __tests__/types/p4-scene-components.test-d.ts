import { emptyContentResource } from "../../src/presentation-4/empty-types";
import { infer, narrow } from "../../src/presentation-4/types";
import type {
  AmbientAudio,
  AmbientLight,
  DirectionalLight,
  ImageBasedLight,
  OrthographicCamera,
  PerspectiveCamera,
  PointAudio,
  PointLight,
  SceneComponent,
  SpotAudio,
  SpotLight,
} from "../../src/presentation-4/types";
import type {
  AmbientAudioNormalized,
  AmbientLightNormalized,
  DirectionalLightNormalized,
  ImageBasedLightNormalized,
  OrthographicCameraNormalized,
  PerspectiveCameraNormalized,
  PointAudioNormalized,
  PointLightNormalized,
  SceneComponentNormalized,
  SpotAudioNormalized,
  SpotLightNormalized,
} from "../../src/presentation-4-normalized/types";

const point = {
  type: "PointSelector",
  x: 1,
  y: 2,
  z: 3,
  refinedBy: {
    type: "WktSelector",
    value: "POINT Z (1 2 3)",
  },
} as const;

const authoredComponents = [
  {
    type: "PerspectiveCamera",
    near: 0.1,
    far: 1000,
    fieldOfView: 45,
    lookAt: point,
    interactionMode: ["orbit"],
  } satisfies PerspectiveCamera,
  {
    type: "OrthographicCamera",
    viewHeight: 40,
    lookAt: { id: "https://example.org/annotation/1", type: "Annotation" },
  } satisfies OrthographicCamera,
  {
    type: "AmbientLight",
    color: "#fff",
    intensity: { type: "Quantity", quantityValue: 0.5, unit: "relative" },
  } satisfies AmbientLight,
  {
    type: "DirectionalLight",
    lookAt: {
      type: "SpecificResource",
      source: { id: "https://example.org/scene/1", type: "Scene" },
      selector: point,
    },
  } satisfies DirectionalLight,
  {
    type: "ImageBasedLight",
    environmentMap: {
      id: "https://example.org/environment.hdr",
      type: "Image",
      format: "image/vnd.radiance",
      profile: "equirectangular",
    },
  } satisfies ImageBasedLight,
  { type: "PointLight", color: "#fff" } satisfies PointLight,
  { type: "SpotLight", angle: 30, lookAt: point } satisfies SpotLight,
  {
    type: "AmbientAudio",
    source: {
      id: "https://example.org/audio.mp3",
      type: "Audio",
      format: "audio/mp3",
    },
  } satisfies AmbientAudio,
  {
    type: "PointAudio",
    source: { id: "https://example.org/timeline/1", type: "Timeline", duration: 60 },
  } satisfies PointAudio,
  {
    type: "SpotAudio",
    source: {
      type: "SpecificResource",
      source: { id: "https://example.org/audio.mp3", type: "Audio" },
      selector: { type: "FragmentSelector", value: "t=10,20" },
    },
    angle: 45,
    lookAt: point,
  } satisfies SpotAudio,
] satisfies SceneComponent[];

void authoredComponents;

const imageBasedLight = infer.ImageBasedLight({
  type: "ImageBasedLight",
  environmentMap: { id: "https://example.org/environment.hdr", type: "Image" },
});
if (narrow.isContentResource(imageBasedLight)) {
  imageBasedLight.environmentMap;
}

const invalidImageBasedLight = {
  type: "ImageBasedLight",
  // @ts-expect-error ImageBasedLight requires an environmentMap
} satisfies ImageBasedLight;

void invalidImageBasedLight;

const invalidPointAudio = {
  type: "PointAudio",
  // @ts-expect-error Audio emitters cannot use an Image as their source
  source: { id: "https://example.org/image.jpg", type: "Image" },
} satisfies PointAudio;

void invalidPointAudio;

const invalidCameraLookAt = {
  type: "PerspectiveCamera",
  // @ts-expect-error lookAt must target a selector, Annotation, or SpecificResource
  lookAt: { id: "https://example.org/image.jpg", type: "Image" },
} satisfies PerspectiveCamera;

void invalidCameraLookAt;

const normalizedBase = emptyContentResource;
const normalizedComponents = [
  {
    ...normalizedBase,
    type: "PerspectiveCamera",
    fieldOfView: 45,
    lookAt: point,
  } satisfies PerspectiveCameraNormalized,
  {
    ...normalizedBase,
    type: "OrthographicCamera",
    viewHeight: 40,
    lookAt: undefined,
  } satisfies OrthographicCameraNormalized,
  { ...normalizedBase, type: "AmbientLight", color: "#fff" } satisfies AmbientLightNormalized,
  { ...normalizedBase, type: "DirectionalLight", lookAt: point } satisfies DirectionalLightNormalized,
  {
    ...normalizedBase,
    type: "ImageBasedLight",
    environmentMap: { id: "https://example.org/environment.hdr", type: "ContentResource" },
  } satisfies ImageBasedLightNormalized,
  { ...normalizedBase, type: "PointLight", color: "#fff" } satisfies PointLightNormalized,
  { ...normalizedBase, type: "SpotLight", angle: 30, lookAt: undefined } satisfies SpotLightNormalized,
  {
    ...normalizedBase,
    type: "AmbientAudio",
    source: { id: "https://example.org/audio.mp3", type: "ContentResource" },
  } satisfies AmbientAudioNormalized,
  {
    ...normalizedBase,
    type: "PointAudio",
    source: { id: "https://example.org/timeline/1", type: "Timeline" },
  } satisfies PointAudioNormalized,
  {
    ...normalizedBase,
    type: "SpotAudio",
    source: { id: "https://example.org/audio.mp3", type: "ContentResource" },
    lookAt: point,
  } satisfies SpotAudioNormalized,
] satisfies SceneComponentNormalized[];

void normalizedComponents;
