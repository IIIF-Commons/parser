/**
 * IIIF Presentation API 4.0 - Container Types
 *
 * This file defines TypeScript interfaces for the core container types
 * introduced or updated in Presentation API 4.0: Timeline, Canvas, Scene.
 * These types are experimental and will be expanded as the implementation matures.
 */

export interface Timeline {
  id: string;
  type: 'Timeline';
  label?: InternationalString;
  duration: number;
  items?: Array<string | AnnotationPage | TimelineItem>;
  metadata?: MetadataItem[];
  summary?: InternationalString;
  provider?: Agent[];
  thumbnail?: ContentResource[];
  requiredStatement?: MetadataItem;
  rights?: string | null;
  navDate?: string | null;
  navPlace?: any; // GeoJSON or reference
  placeholderContainer?: Canvas | Scene | Timeline | null;
  accompanyingContainer?: Canvas | Scene | Timeline | null;
  behavior?: string[];
  seeAlso?: ContentResource[];
  service?: Service[];
  homepage?: ContentResource[];
  rendering?: ContentResource[];
  partOf?: Array<Collection | Manifest>;
  structures?: Range[];
  annotations?: AnnotationPage[];
}

export interface Canvas {
  id: string;
  type: 'Canvas';
  label?: InternationalString;
  width: number;
  height: number;
  duration?: number;
  items?: Array<string | AnnotationPage | CanvasItem>;
  metadata?: MetadataItem[];
  summary?: InternationalString;
  provider?: Agent[];
  thumbnail?: ContentResource[];
  requiredStatement?: MetadataItem;
  rights?: string | null;
  navDate?: string | null;
  navPlace?: any; // GeoJSON or reference
  placeholderContainer?: Canvas | Scene | Timeline | null;
  accompanyingContainer?: Canvas | Scene | Timeline | null;
  behavior?: string[];
  seeAlso?: ContentResource[];
  service?: Service[];
  homepage?: ContentResource[];
  rendering?: ContentResource[];
  partOf?: Array<Collection | Manifest>;
  structures?: Range[];
  annotations?: AnnotationPage[];
  spatialScale?: UnitValue | null;
  timeMode?: string | null;
  viewingDirection?: string;
  backgroundColor?: string | null;
}

export interface Scene {
  id: string;
  type: 'Scene';
  label?: InternationalString;
  items?: Array<string | AnnotationPage | SceneItem>;
  metadata?: MetadataItem[];
  summary?: InternationalString;
  provider?: Agent[];
  thumbnail?: ContentResource[];
  requiredStatement?: MetadataItem;
  rights?: string | null;
  navDate?: string | null;
  navPlace?: any; // GeoJSON or reference
  placeholderContainer?: Canvas | Scene | Timeline | null;
  accompanyingContainer?: Canvas | Scene | Timeline | null;
  behavior?: string[];
  seeAlso?: ContentResource[];
  service?: Service[];
  homepage?: ContentResource[];
  rendering?: ContentResource[];
  partOf?: Array<Collection | Manifest>;
  structures?: Range[];
  annotations?: AnnotationPage[];
  duration?: number;
  spatialScale?: UnitValue | null;
  backgroundColor?: string | null;
}

// --- Supporting Types (stubs, to be expanded) ---

export type InternationalString = { [lang: string]: string[] };

export interface MetadataItem {
  label: InternationalString;
  value: InternationalString;
}

export interface Agent {
  id: string;
  type: 'Agent';
  label?: InternationalString;
  logo?: ContentResource[];
  seeAlso?: ContentResource[];
  homepage?: ContentResource[];
  summary?: InternationalString;
}

export interface ContentResource {
  id: string;
  type: string;
  format?: string;
  height?: number;
  width?: number;
  duration?: number;
  label?: InternationalString;
  thumbnail?: ContentResource[];
  // ...etc
}

export interface Service {
  id: string;
  type: string;
  profile?: string;
  service?: Service[];
}

export interface UnitValue {
  id?: string;
  type: 'UnitValue';
  value: number;
  unit: string;
  label?: InternationalString;
}

// Placeholders for other IIIF types
export type AnnotationPage = any;
export type TimelineItem = any;
export type CanvasItem = any;
export type SceneItem = any;
export type Collection = any;
export type Manifest = any;
export type Range = any;
