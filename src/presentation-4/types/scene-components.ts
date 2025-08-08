/**
 * IIIF Presentation API 4.0 - Scene Components Types
 *
 * This file defines TypeScript interfaces for 3D scene components introduced in Presentation 4:
 * - Cameras (PerspectiveCamera, OrthographicCamera)
 * - Lights (AmbientLight, DirectionalLight, PointLight, SpotLight)
 * - Audio Emitters (AmbientAudio, PointAudio, SpotAudio)
 * - UnitValue (for intensity, volume, etc.)
 *
 * These types are experimental and may evolve as the specification matures.
 */

// =====================
// Camera Types
// =====================

export interface PerspectiveCamera {
  id: string;
  type: 'PerspectiveCamera';
  label?: LanguageMap;
  near?: number;
  far?: number;
  fieldOfView?: number;
  lookAt?: LookAtTarget;
  interactionMode?: string[];
}

export interface OrthographicCamera {
  id: string;
  type: 'OrthographicCamera';
  label?: LanguageMap;
  near?: number;
  far?: number;
  viewHeight?: number;
  lookAt?: LookAtTarget;
  interactionMode?: string[];
}

// =====================
// Light Types
// =====================

export interface AmbientLight {
  id: string;
  type: 'AmbientLight';
  color?: string;
  intensity?: UnitValue;
  label?: LanguageMap;
}

export interface DirectionalLight {
  id: string;
  type: 'DirectionalLight';
  color?: string;
  intensity?: UnitValue;
  lookAt?: LookAtTarget;
  label?: LanguageMap;
}

export interface PointLight {
  id: string;
  type: 'PointLight';
  color?: string;
  intensity?: UnitValue;
  label?: LanguageMap;
}

export interface SpotLight {
  id: string;
  type: 'SpotLight';
  color?: string;
  intensity?: UnitValue;
  angle?: number;
  lookAt?: LookAtTarget;
  label?: LanguageMap;
}

// =====================
// Audio Emitter Types
// =====================

export interface AmbientAudio {
  id: string;
  type: 'AmbientAudio';
  source: AudioSource;
  volume?: UnitValue;
  label?: LanguageMap;
}

export interface PointAudio {
  id: string;
  type: 'PointAudio';
  source: AudioSource;
  volume?: UnitValue;
  label?: LanguageMap;
}

export interface SpotAudio {
  id: string;
  type: 'SpotAudio';
  source: AudioSource;
  volume?: UnitValue;
  angle?: number;
  lookAt?: LookAtTarget;
  label?: LanguageMap;
}

// =====================
// Supporting Types
// =====================

/**
 * A UnitValue expresses a quantity with a value and a unit (e.g., intensity, volume, scale).
 */
export interface UnitValue {
  id?: string;
  type: 'UnitValue';
  value: number;
  unit: string; // e.g., 'relative', 'm', 's'
  label?: LanguageMap;
}

/**
 * LanguageMap for internationalized strings.
 */
export interface LanguageMap {
  [lang: string]: string[];
}

/**
 * LookAtTarget can be a PointSelector, WktSelector, Annotation reference, or SpecificResource.
 * For now, we use a generic type.
 */
export type LookAtTarget = any;

/**
 * AudioSource is a minimal representation of an audio content resource.
 */
export interface AudioSource {
  id: string;
  type: string; // e.g., 'Audio'
  format?: string;
  duration?: number;
  label?: LanguageMap;
}

// =====================
// Union Types for Convenience
// =====================

export type Camera =
  | PerspectiveCamera
  | OrthographicCamera;

export type Light =
  | AmbientLight
  | DirectionalLight
  | PointLight
  | SpotLight;

export type AudioEmitter =
  | AmbientAudio
  | PointAudio
  | SpotAudio;
