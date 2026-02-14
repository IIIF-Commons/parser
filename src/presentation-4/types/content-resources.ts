import type { Selector } from './selectors';
import type { Transform } from './transforms';
import type { SceneComponent } from './scene-components';

export type LanguageMap = Record<string, string[]>;

export interface MetadataItem {
  label: LanguageMap;
  value: LanguageMap;
}

export interface ResourceReference<TType extends string = string> {
  id: string;
  type: TType;
}

export interface ServiceReference {
  id: string;
  type: string;
  profile?: string | string[];
  service?: ServiceReference[];
  [key: string]: unknown;
}

export interface Quantity {
  id?: string;
  type: 'Quantity';
  value: number;
  unit?: string;
  label?: LanguageMap;
  [key: string]: unknown;
}

export interface ContentResourceBase {
  id: string;
  type: string;
  label?: LanguageMap;
  format?: string;
  profile?: string | string[];
  height?: number;
  width?: number;
  duration?: number;
  language?: string[];
  thumbnail?: Array<ContentResourceLike | ResourceReference>;
  metadata?: MetadataItem[];
  summary?: LanguageMap;
  requiredStatement?: MetadataItem;
  rights?: string | null;
  seeAlso?: Array<ContentResourceLike | ResourceReference>;
  service?: ServiceReference[];
  homepage?: Array<ContentResourceLike | ResourceReference>;
  rendering?: Array<ContentResourceLike | ResourceReference>;
  partOf?: Array<ResourceReference | ContentResourceLike>;
  spatialScale?: Quantity | null;
  temporalScale?: Quantity | null;
  provides?: string[];
  fileSize?: number;
  [key: string]: unknown;
}

export interface ImageResource extends ContentResourceBase {
  type: 'Image';
  height: number;
  width: number;
}

export interface AudioResource extends ContentResourceBase {
  type: 'Audio' | 'Sound';
  duration: number;
}

export interface VideoResource extends ContentResourceBase {
  type: 'Video';
  duration: number;
  height: number;
  width: number;
}

export interface ModelResource extends ContentResourceBase {
  type: 'Model';
}

export interface TextResource extends ContentResourceBase {
  type: 'Text';
}

export interface DatasetResource extends ContentResourceBase {
  type: 'Dataset';
}

export interface TextualBodyResource extends ContentResourceBase {
  type: 'TextualBody';
  value: string;
  purpose?: string | string[];
}

export interface ChoiceResource extends ContentResourceBase {
  type: 'Choice';
  items?: ContentResourceLike[];
  default?: ContentResourceLike;
}

export interface SpecificResource {
  id?: string;
  type: 'SpecificResource';
  source: ContentResourceLike | ResourceReference | string;
  selector?: Selector | Selector[];
  transform?: Transform | Transform[];
  action?: Array<ContentResourceLike | ResourceReference | string>;
  purpose?: string | string[];
  scope?: ResourceReference | string;
  [key: string]: unknown;
}

export type ContentResourceLike =
  | ImageResource
  | AudioResource
  | VideoResource
  | ModelResource
  | TextResource
  | DatasetResource
  | TextualBodyResource
  | ChoiceResource
  | ContentResourceBase
  | SceneComponent;
