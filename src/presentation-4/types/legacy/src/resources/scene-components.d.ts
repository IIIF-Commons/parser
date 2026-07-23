import type { InternationalString } from "../../../../../presentation-3/types/legacy/src/iiif/descriptive";
import type { Reference } from "../../../../../presentation-3/types/legacy/src/reference";
import type { PointSelector, WktSelector } from "../extensions/presentation-4";
import type { InteractionMode, Quantity } from "../iiif/technical";
import type { AudioResource } from "./contentResource";

export type LookAtTarget = PointSelector | WktSelector | Reference;

export type SceneComponentBase = {
  id: string;
  type: string;
  label?: InternationalString;
  [key: string]: unknown;
};

export type PerspectiveCamera = SceneComponentBase & {
  type: "PerspectiveCamera";
  near?: number;
  far?: number;
  fieldOfView?: number;
  lookAt?: LookAtTarget;
  interactionMode?: InteractionMode[];
};

export type OrthographicCamera = SceneComponentBase & {
  type: "OrthographicCamera";
  near?: number;
  far?: number;
  viewHeight?: number;
  lookAt?: LookAtTarget;
  interactionMode?: InteractionMode[];
};

export type AmbientLight = SceneComponentBase & {
  type: "AmbientLight";
  color?: string;
  intensity?: Quantity;
};

export type DirectionalLight = SceneComponentBase & {
  type: "DirectionalLight";
  color?: string;
  intensity?: Quantity;
  lookAt?: LookAtTarget;
};

export type PointLight = SceneComponentBase & {
  type: "PointLight";
  color?: string;
  intensity?: Quantity;
};

export type SpotLight = SceneComponentBase & {
  type: "SpotLight";
  color?: string;
  intensity?: Quantity;
  angle?: number;
  lookAt?: LookAtTarget;
};

export type AmbientAudio = SceneComponentBase & {
  type: "AmbientAudio";
  source: AudioResource | Reference<"Audio" | "Sound">;
  volume?: Quantity;
};

export type PointAudio = SceneComponentBase & {
  type: "PointAudio";
  source: AudioResource | Reference<"Audio" | "Sound">;
  volume?: Quantity;
};

export type SpotAudio = SceneComponentBase & {
  type: "SpotAudio";
  source: AudioResource | Reference<"Audio" | "Sound">;
  volume?: Quantity;
  angle?: number;
  lookAt?: LookAtTarget;
};

export type Camera = PerspectiveCamera | OrthographicCamera;
export type Light = AmbientLight | DirectionalLight | PointLight | SpotLight;
export type AudioEmitter = AmbientAudio | PointAudio | SpotAudio;
export type SceneComponent = Camera | Light | AudioEmitter;
