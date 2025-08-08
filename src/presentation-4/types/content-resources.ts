/**
 * IIIF Presentation API 4.0 - Content Resource Types
 *
 * This file defines TypeScript interfaces and type aliases for content resources
 * in Presentation 4.0. Content resources include images, audio, video, models,
 * text, datasets, and other external or embedded resources that can be associated
 * with containers via annotations.
 *
 * Extend these interfaces as the implementation matures.
 */

// Base Content Resource
export interface ContentResource {
  id: string;
  type: string;
  label?: InternationalString;
  format?: string;
  profile?: string;
  height?: number;
  width?: number;
  duration?: number;
  language?: string[]; // BCP 47 codes
  thumbnail?: ContentResource[];
  metadata?: MetadataItem[];
  summary?: InternationalString;
  requiredStatement?: MetadataItem;
  rights?: string | null;
  seeAlso?: ContentResource[];
  service?: Service[];
  homepage?: ContentResource[];
  rendering?: ContentResource[];
  partOf?: any[];
  annotations?: any[];
  // v4 additions
  spatialScale?: UnitValue;
  temporalScale?: UnitValue;
  provides?: string[];
  fileSize?: number;
}

// Image Resource
export interface ImageResource extends ContentResource {
  type: 'Image';
  height: number;
  width: number;
}

// Audio Resource
export interface AudioResource extends ContentResource {
  type: 'Audio' | 'Sound';
  duration: number;
}

// Video Resource
export interface VideoResource extends ContentResource {
  type: 'Video';
  duration: number;
  height: number;
  width: number;
}

// Model Resource (3D)
export interface ModelResource extends ContentResource {
  type: 'Model';
  // format: e.g. 'model/gltf-binary'
}

// Text Resource
export interface TextResource extends ContentResource {
  type: 'Text';
}

// Dataset Resource
export interface DatasetResource extends ContentResource {
  type: 'Dataset';
}

// UnitValue (for spatialScale, temporalScale, etc.)
export interface UnitValue {
  id?: string;
  type: 'UnitValue';
  value: number;
  unit: string; // e.g. 'm', 's', 'relative'
  label?: InternationalString;
}

// Service (stub, to be expanded)
export interface Service {
  id: string;
  type: string;
  profile?: string;
  service?: Service[];
}

// InternationalString (language map)
export interface InternationalString {
  [lang: string]: string[];
}

// MetadataItem (label/value pairs)
export interface MetadataItem {
  label: InternationalString;
  value: InternationalString;
}

// Union type for all content resources
export type AnyContentResource =
  | ImageResource
  | AudioResource
  | VideoResource
  | ModelResource
  | TextResource
  | DatasetResource
  | ContentResource;

// Add more as Presentation 4 content resource types expand.
