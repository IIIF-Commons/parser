import type {
  ContentResourceLike,
  LanguageMap,
  MetadataItem,
  Quantity,
  ResourceReference,
  ServiceReference,
  SpecificResource,
} from './content-resources';
import type { ActivatingAnnotation, ContentStateAnnotation } from './extended-properties';

export interface Annotation {
  id: string;
  type: 'Annotation';
  motivation?: string[];
  body?: Array<ContentResourceLike | ResourceReference | string>;
  target: Array<SpecificResource | ResourceReference | string>;
  bodyValue?: string;
  language?: string;
  [key: string]: unknown;
}

export interface AnnotationPage {
  id: string;
  type: 'AnnotationPage';
  items: Annotation[];
  label?: LanguageMap;
  [key: string]: unknown;
}

export interface AnnotationCollection {
  id: string;
  type: 'AnnotationCollection';
  items: Annotation[];
  label?: LanguageMap;
  [key: string]: unknown;
}

export interface Agent {
  id: string;
  type: 'Agent';
  label?: LanguageMap;
  logo?: Array<ContentResourceLike | ResourceReference>;
  seeAlso?: Array<ContentResourceLike | ResourceReference>;
  homepage?: Array<ContentResourceLike | ResourceReference>;
  summary?: LanguageMap;
  [key: string]: unknown;
}

export interface Range {
  id: string;
  type: 'Range';
  label?: LanguageMap;
  items?: Array<ResourceReference<'Range' | 'Canvas' | 'Scene' | 'Timeline'> | SpecificResource>;
  behavior?: string[];
  [key: string]: unknown;
}

interface ContainerBase {
  id: string;
  type: string;
  label?: LanguageMap;
  metadata?: MetadataItem[];
  summary?: LanguageMap;
  provider?: Agent[];
  thumbnail?: Array<ContentResourceLike | ResourceReference>;
  requiredStatement?: MetadataItem;
  rights?: string | null;
  navDate?: string | null;
  navPlace?: Record<string, unknown>;
  behavior?: string[];
  seeAlso?: Array<ContentResourceLike | ResourceReference>;
  service?: ServiceReference[];
  services?: ServiceReference[];
  homepage?: Array<ContentResourceLike | ResourceReference>;
  rendering?: Array<ContentResourceLike | ResourceReference>;
  partOf?: Array<ResourceReference<'Collection' | 'Manifest'>>;
  structures?: Range[];
  annotations?: AnnotationPage[];
  placeholderContainer?: ResourceReference<'Timeline' | 'Canvas' | 'Scene'> | null;
  accompanyingContainer?: ResourceReference<'Timeline' | 'Canvas' | 'Scene'> | null;
  [key: string]: unknown;
}

export interface Timeline extends ContainerBase {
  type: 'Timeline';
  duration: number;
  items?: Array<AnnotationPage | ResourceReference<'AnnotationPage' | 'Canvas' | 'Scene' | 'Timeline'>>;
}

export interface Canvas extends ContainerBase {
  type: 'Canvas';
  width: number;
  height: number;
  duration?: number;
  items?: Array<AnnotationPage | ResourceReference<'AnnotationPage' | 'Canvas' | 'Scene' | 'Timeline'>>;
  spatialScale?: Quantity | null;
  timeMode?: string | null;
  viewingDirection?: string;
  backgroundColor?: string | null;
}

export interface Scene extends ContainerBase {
  type: 'Scene';
  duration?: number;
  items?: Array<AnnotationPage | ResourceReference<'AnnotationPage' | 'Canvas' | 'Scene' | 'Timeline'>>;
  spatialScale?: Quantity | null;
  backgroundColor?: string | null;
}

export interface Collection extends ContainerBase {
  type: 'Collection';
  items?: Array<ResourceReference<'Collection' | 'Manifest'>>;
}

export interface Manifest extends ContainerBase {
  type: 'Manifest';
  items: Array<Canvas | Scene | Timeline | ResourceReference<'Canvas' | 'Scene' | 'Timeline'>>;
  start?: SpecificResource | ResourceReference<'Canvas' | 'Scene' | 'Timeline'> | null;
  viewingDirection?: string;
}

export type Presentation4Annotation = Annotation | ActivatingAnnotation | ContentStateAnnotation;
export type Container = Collection | Manifest | Timeline | Canvas | Scene;
