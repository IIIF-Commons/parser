import type { InteractionMode, PointSelector, Quantity, WktSelector } from "../../../../presentation-4/types";
import type { NormalizedReference } from "../iiif/technical-v4";
import type { ContentResourceNormalized } from "./contentResource";

export type LookAtTargetNormalized = PointSelector | WktSelector | NormalizedReference;

export type SceneComponentNormalizedBase = Omit<ContentResourceNormalized, "type" | "lookAt"> & {
  type: string;
};

export type PerspectiveCameraNormalized = SceneComponentNormalizedBase & {
  type: "PerspectiveCamera";
  near?: number;
  far?: number;
  fieldOfView?: number;
  lookAt?: LookAtTargetNormalized;
  interactionMode?: readonly InteractionMode[];
};

export type OrthographicCameraNormalized = SceneComponentNormalizedBase & {
  type: "OrthographicCamera";
  near?: number;
  far?: number;
  viewHeight?: number;
  lookAt?: LookAtTargetNormalized;
  interactionMode?: readonly InteractionMode[];
};

export type AmbientLightNormalized = SceneComponentNormalizedBase & {
  type: "AmbientLight";
  color?: string;
  intensity?: Quantity;
};

export type DirectionalLightNormalized = SceneComponentNormalizedBase & {
  type: "DirectionalLight";
  color?: string;
  intensity?: Quantity;
  lookAt?: LookAtTargetNormalized;
};

export type ImageBasedLightNormalized = SceneComponentNormalizedBase & {
  type: "ImageBasedLight";
  environmentMap: NormalizedReference;
  intensity?: Quantity;
};

export type PointLightNormalized = SceneComponentNormalizedBase & {
  type: "PointLight";
  color?: string;
  intensity?: Quantity;
};

export type SpotLightNormalized = SceneComponentNormalizedBase & {
  type: "SpotLight";
  color?: string;
  intensity?: Quantity;
  angle?: number;
  lookAt?: LookAtTargetNormalized;
};

export type AmbientAudioNormalized = SceneComponentNormalizedBase & {
  type: "AmbientAudio";
  source: NormalizedReference;
  volume?: Quantity;
};

export type PointAudioNormalized = SceneComponentNormalizedBase & {
  type: "PointAudio";
  source: NormalizedReference;
  volume?: Quantity;
};

export type SpotAudioNormalized = SceneComponentNormalizedBase & {
  type: "SpotAudio";
  source: NormalizedReference;
  volume?: Quantity;
  angle?: number;
  lookAt?: LookAtTargetNormalized;
};

export type CameraNormalized = PerspectiveCameraNormalized | OrthographicCameraNormalized;
export type LightNormalized =
  | AmbientLightNormalized
  | DirectionalLightNormalized
  | ImageBasedLightNormalized
  | PointLightNormalized
  | SpotLightNormalized;
export type AudioEmitterNormalized = AmbientAudioNormalized | PointAudioNormalized | SpotAudioNormalized;
export type SceneComponentNormalized = CameraNormalized | LightNormalized | AudioEmitterNormalized;
