import type { AudioResource, LanguageMap, Quantity } from './content-resources';
import type { PointSelector, WktSelector } from './selectors';

export type LookAtTarget = PointSelector | WktSelector | { id: string; type: string };

export interface SceneComponentBase {
  id: string;
  type: string;
  label?: LanguageMap;
  [key: string]: unknown;
}

export interface PerspectiveCamera extends SceneComponentBase {
  type: 'PerspectiveCamera';
  near?: number;
  far?: number;
  fieldOfView?: number;
  lookAt?: LookAtTarget;
  interactionMode?: string[];
}

export interface OrthographicCamera extends SceneComponentBase {
  type: 'OrthographicCamera';
  near?: number;
  far?: number;
  viewHeight?: number;
  lookAt?: LookAtTarget;
  interactionMode?: string[];
}

export interface AmbientLight extends SceneComponentBase {
  type: 'AmbientLight';
  color?: string;
  intensity?: Quantity;
}

export interface DirectionalLight extends SceneComponentBase {
  type: 'DirectionalLight';
  color?: string;
  intensity?: Quantity;
  lookAt?: LookAtTarget;
}

export interface PointLight extends SceneComponentBase {
  type: 'PointLight';
  color?: string;
  intensity?: Quantity;
}

export interface SpotLight extends SceneComponentBase {
  type: 'SpotLight';
  color?: string;
  intensity?: Quantity;
  angle?: number;
  lookAt?: LookAtTarget;
}

export interface AmbientAudio extends SceneComponentBase {
  type: 'AmbientAudio';
  source: AudioResource | { id: string; type: 'Audio' | 'Sound' };
  volume?: Quantity;
}

export interface PointAudio extends SceneComponentBase {
  type: 'PointAudio';
  source: AudioResource | { id: string; type: 'Audio' | 'Sound' };
  volume?: Quantity;
}

export interface SpotAudio extends SceneComponentBase {
  type: 'SpotAudio';
  source: AudioResource | { id: string; type: 'Audio' | 'Sound' };
  volume?: Quantity;
  angle?: number;
  lookAt?: LookAtTarget;
}

export type Camera = PerspectiveCamera | OrthographicCamera;
export type Light = AmbientLight | DirectionalLight | PointLight | SpotLight;
export type AudioEmitter = AmbientAudio | PointAudio | SpotAudio;
export type SceneComponent = Camera | Light | AudioEmitter;
