/**
 * IIIF Presentation API 4.0 - Empty Types
 *
 * This file defines default/empty objects for all core Presentation 4 entities.
 * These are used as safe defaults during normalization and serialization.
 * Extend as new types and features are implemented.
 */

import * as Types from './types/containers';
import * as ContentTypes from './types/content-resources';
import * as SceneTypes from './types/scene-components';
import * as SelectorTypes from './types/selectors';
import * as TransformTypes from './types/transforms';
import * as ExtendedProps from './types/extended-properties';

// Utility constant for empty arrays/objects
export const EMPTY_ARRAY: any[] = Object.freeze([]);
export const EMPTY_OBJ: any = Object.freeze({});

// Empty Timeline (temporal container)
export const emptyTimeline = {
  id: 'https://iiif-parser/empty-timeline',
  type: 'Timeline',
  label: EMPTY_OBJ,
  duration: 0,
  items: EMPTY_ARRAY,
  metadata: EMPTY_ARRAY,
  summary: EMPTY_OBJ,
  provider: EMPTY_ARRAY,
  thumbnail: EMPTY_ARRAY,
  requiredStatement: EMPTY_OBJ,
  rights: null,
  navDate: null,
  navPlace: null,
  placeholderContainer: null,
  accompanyingContainer: null,
  behavior: EMPTY_ARRAY,
  seeAlso: EMPTY_ARRAY,
  service: EMPTY_ARRAY,
  homepage: EMPTY_ARRAY,
  rendering: EMPTY_ARRAY,
  partOf: EMPTY_ARRAY,
  structures: EMPTY_ARRAY,
  annotations: EMPTY_ARRAY,
};

// Empty Canvas (2D container)
export const emptyCanvas = {
  id: 'https://iiif-parser/empty-canvas',
  type: 'Canvas',
  label: EMPTY_OBJ,
  width: 0,
  height: 0,
  duration: 0,
  items: EMPTY_ARRAY,
  metadata: EMPTY_ARRAY,
  summary: EMPTY_OBJ,
  provider: EMPTY_ARRAY,
  thumbnail: EMPTY_ARRAY,
  requiredStatement: EMPTY_OBJ,
  rights: null,
  navDate: null,
  navPlace: null,
  placeholderContainer: null,
  accompanyingContainer: null,
  behavior: EMPTY_ARRAY,
  seeAlso: EMPTY_ARRAY,
  service: EMPTY_ARRAY,
  homepage: EMPTY_ARRAY,
  rendering: EMPTY_ARRAY,
  partOf: EMPTY_ARRAY,
  structures: EMPTY_ARRAY,
  annotations: EMPTY_ARRAY,
  spatialScale: null,
  timeMode: null,
  viewingDirection: 'left-to-right',
  backgroundColor: null,
};

// Empty Scene (3D container)
export const emptyScene = {
  id: 'https://iiif-parser/empty-scene',
  type: 'Scene',
  label: EMPTY_OBJ,
  items: EMPTY_ARRAY,
  metadata: EMPTY_ARRAY,
  summary: EMPTY_OBJ,
  provider: EMPTY_ARRAY,
  thumbnail: EMPTY_ARRAY,
  requiredStatement: EMPTY_OBJ,
  rights: null,
  navDate: null,
  navPlace: null,
  placeholderContainer: null,
  accompanyingContainer: null,
  behavior: EMPTY_ARRAY,
  seeAlso: EMPTY_ARRAY,
  service: EMPTY_ARRAY,
  homepage: EMPTY_ARRAY,
  rendering: EMPTY_ARRAY,
  partOf: EMPTY_ARRAY,
  structures: EMPTY_ARRAY,
  annotations: EMPTY_ARRAY,
  duration: 0,
  spatialScale: null,
  backgroundColor: null,
};

// Empty AnnotationPage
export const emptyAnnotationPage = {
  id: 'https://iiif-parser/empty-annotation-page',
  type: 'AnnotationPage',
  label: EMPTY_OBJ,
  items: EMPTY_ARRAY,
  metadata: EMPTY_ARRAY,
  summary: EMPTY_OBJ,
  provider: EMPTY_ARRAY,
  thumbnail: EMPTY_ARRAY,
  requiredStatement: EMPTY_OBJ,
  rights: null,
  navDate: null,
  navPlace: null,
  behavior: EMPTY_ARRAY,
  seeAlso: EMPTY_ARRAY,
  service: EMPTY_ARRAY,
  homepage: EMPTY_ARRAY,
  rendering: EMPTY_ARRAY,
  partOf: EMPTY_ARRAY,
  annotations: EMPTY_ARRAY,
};

// Empty Annotation
export const emptyAnnotation = {
  id: 'https://iiif-parser/empty-annotation',
  type: 'Annotation',
  motivation: EMPTY_ARRAY,
  body: EMPTY_ARRAY,
  target: null,
  label: EMPTY_OBJ,
  metadata: EMPTY_ARRAY,
  summary: EMPTY_OBJ,
  provider: EMPTY_ARRAY,
  thumbnail: EMPTY_ARRAY,
  requiredStatement: EMPTY_OBJ,
  rights: null,
  navDate: null,
  navPlace: null,
  behavior: EMPTY_ARRAY,
  seeAlso: EMPTY_ARRAY,
  service: EMPTY_ARRAY,
  homepage: EMPTY_ARRAY,
  rendering: EMPTY_ARRAY,
  partOf: EMPTY_ARRAY,
  annotations: EMPTY_ARRAY,
  timeMode: null,
  stylesheet: null,
  canonical: null,
  via: EMPTY_ARRAY,
  created: null,
  creator: EMPTY_ARRAY,
  generated: null,
  generator: EMPTY_ARRAY,
  modified: null,
  audience: EMPTY_ARRAY,
  accessibility: EMPTY_ARRAY,
  provides: EMPTY_ARRAY,
  toggles: EMPTY_ARRAY,
  position: null,
  exclude: EMPTY_ARRAY,
};

// Empty Agent (Provider)
export const emptyAgent = {
  id: 'https://iiif-parser/empty-agent',
  type: 'Agent',
  label: EMPTY_OBJ,
  logo: EMPTY_ARRAY,
  seeAlso: EMPTY_ARRAY,
  homepage: EMPTY_ARRAY,
  summary: EMPTY_OBJ,
};

// Empty Service
export const emptyService = {
  id: 'https://iiif-parser/empty-service',
  type: 'UnknownService',
  profile: null,
  service: EMPTY_ARRAY,
};

// Empty Selector stubs
export const emptyPointSelector = {
  type: 'PointSelector',
  x: 0,
  y: 0,
  z: 0,
  instant: null,
};

export const emptyWktSelector = {
  type: 'WktSelector',
  value: '',
};

export const emptyAnimationSelector = {
  type: 'AnimationSelector',
  value: '',
};

// Empty Transform stubs
export const emptyRotateTransform = {
  type: 'RotateTransform',
  x: 0,
  y: 0,
  z: 0,
};

export const emptyScaleTransform = {
  type: 'ScaleTransform',
  x: 1,
  y: 1,
  z: 1,
};

export const emptyTranslateTransform = {
  type: 'TranslateTransform',
  x: 0,
  y: 0,
  z: 0,
};

// Empty Camera (Perspective)
export const emptyPerspectiveCamera = {
  id: 'https://iiif-parser/empty-perspective-camera',
  type: 'PerspectiveCamera',
  label: EMPTY_OBJ,
  near: 0.1,
  far: 1000,
  fieldOfView: 45,
  lookAt: null,
  interactionMode: EMPTY_ARRAY,
};

// Empty Light (Ambient)
export const emptyAmbientLight = {
  id: 'https://iiif-parser/empty-ambient-light',
  type: 'AmbientLight',
  color: '#FFFFFF',
  intensity: null,
  label: EMPTY_OBJ,
};

// Empty Audio Emitter (Ambient)
export const emptyAmbientAudio = {
  id: 'https://iiif-parser/empty-ambient-audio',
  type: 'AmbientAudio',
  source: null,
  volume: null,
  label: EMPTY_OBJ,
};

// Empty UnitValue
export const emptyUnitValue = {
  id: 'https://iiif-parser/empty-unit-value',
  type: 'UnitValue',
  value: 0,
  unit: '',
  label: EMPTY_OBJ,
};

// Add more as Presentation 4 features are implemented...
