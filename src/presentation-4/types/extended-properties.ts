/**
 * IIIF Presentation API 4.0 - Extended Properties Types
 *
 * This module defines TypeScript types for new or extended properties
 * introduced in Presentation API 4.0 that do not fit cleanly into the
 * core container/content/scene/selector/transform categories.
 *
 * As the implementation matures, move or split types as appropriate.
 */

// Physical dimension properties
export interface SpatialScale {
  type: 'UnitValue';
  value: number;
  unit: 'm' | string; // meters or extension
  label?: any;
}

export interface TemporalScale {
  type: 'UnitValue';
  value: number;
  unit: 's' | string; // seconds or extension
  label?: any;
}

// Content state and activation
export interface ContentStateAnnotation {
  id?: string;
  type: 'Annotation';
  motivation: 'contentState';
  target: any; // Could be any IIIF resource or fragment
}

export interface ActivatingAnnotation {
  id?: string;
  type: 'Annotation';
  motivation: 'activating';
  body: any; // Typically a TextualBody or IIIF resource
  target: any; // Typically a SpecificResource or Annotation
}

// Extended properties for containers/resources
export interface PlaceholderContainer {
  id: string;
  type: string; // Timeline, Canvas, Scene, etc.
  [key: string]: any;
}

export interface AccompanyingContainer {
  id: string;
  type: string; // Timeline, Canvas, Scene, etc.
  [key: string]: any;
}

// Interaction and accessibility
export type InteractionMode =
  | 'locked'
  | 'orbit'
  | 'hemisphere-orbit'
  | 'free'
  | 'free-direction'
  | string; // Allow extension

export type Provides =
  | 'closedCaptions'
  | 'alternativeText'
  | 'audioDescription'
  | 'longDescription'
  | 'signLanguage'
  | 'highContrastAudio'
  | 'highContrastDisplay'
  | 'braille'
  | 'tactileGraphic'
  | 'transcript'
  | 'translation'
  | 'subtitles'
  | string; // Allow extension

// Exclude property for annotations
export type ExcludeType = 'Audio' | 'Animations' | 'Cameras' | 'Lights' | string;

// Miscellaneous
export interface UnitValue {
  id?: string;
  type: 'UnitValue';
  value: number;
  unit: string;
  label?: any;
}

// Extend as new v4 properties are implemented...
