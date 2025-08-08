/**
 * IIIF Presentation API 4.0 - Selector Types
 *
 * This file defines TypeScript interfaces for all selector types introduced or updated in Presentation 4.
 * These selectors are used to identify parts of resources (spatial, temporal, 3D, etc.) for annotation targets,
 * positioning, and advanced referencing.
 *
 * Extend these interfaces as the implementation matures.
 */

// Base selector interface
export interface Selector {
  type: string;
  id?: string;
}

// PointSelector: 3D spatial and/or temporal point
export interface PointSelector extends Selector {
  type: 'PointSelector';
  x?: number;
  y?: number;
  z?: number;
  instant?: number; // Time in seconds
}

// WktSelector: Well-known text geometry selector (2D/3D polygons, lines, etc.)
export interface WktSelector extends Selector {
  type: 'WktSelector';
  value: string; // WKT string
}

// FragmentSelector: Media fragment (xywh, t, etc.)
export interface FragmentSelector extends Selector {
  type: 'FragmentSelector';
  value: string;
}

// AnimationSelector: Selects a named animation in a model
export interface AnimationSelector extends Selector {
  type: 'AnimationSelector';
  value: string; // Animation name or identifier
}

// ImageApiSelector: IIIF Image API region/size/rotation/quality/format
export interface ImageApiSelector extends Selector {
  type: 'ImageApiSelector';
  region?: string;
  size?: string;
  rotation?: string;
  quality?: string;
  format?: string;
}

// AudioContentSelector: Selects the audio content of an AV resource
export interface AudioContentSelector extends Selector {
  type: 'AudioContentSelector';
}

// VisualContentSelector: Selects the visual content of an AV resource
export interface VisualContentSelector extends Selector {
  type: 'VisualContentSelector';
}

// CompositeSelector: For selectors that refine or combine others (e.g., refinedBy)
export interface CompositeSelector extends Selector {
  type: string; // e.g., 'CompositeSelector'
  selectors: Selector[];
}

// Union type for all selectors
export type AnySelector =
  | PointSelector
  | WktSelector
  | FragmentSelector
  | AnimationSelector
  | ImageApiSelector
  | AudioContentSelector
  | VisualContentSelector
  | CompositeSelector;

// Add more selector types as Presentation 4 evolves.
