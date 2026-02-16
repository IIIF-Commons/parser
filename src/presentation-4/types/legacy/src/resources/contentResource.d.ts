import type {
  AnyMotivation,
  SpecificResource as SpecificResourceV3,
} from "../../../../../presentation-3/types/legacy/src/resources/annotation";
import type {
  ContentResource as ContentResourceV3,
  IIIFExternalWebResource as IIIFExternalWebResourceV3,
} from "../../../../../presentation-3/types/legacy/src/resources/contentResource";
import type {
  InternationalString,
  MetadataItem as MetadataItemV3,
} from "../../../../../presentation-3/types/legacy/src/iiif/descriptive";
import type { Reference } from "../../../../../presentation-3/types/legacy/src/reference";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { Selector } from "../extensions/presentation-4";
import type { Provides, Quantity, Transform } from "../iiif/technical-v4";
import type { SceneComponent } from "./scene-components";

export type LanguageMap = InternationalString;
export type MetadataItem = MetadataItemV3;
export type OneOrMany<T> = T | T[];

export type ResourceReference<TType extends string = string> = Reference<TType>;

export type ServiceReference = {
  id: string;
  type: string;
  profile?: string | string[];
  service?: OneOrMany<ServiceReference>;
  [key: string]: unknown;
};

export type ContentResourceBase = Prettify<
  Omit<IIIFExternalWebResourceV3, "language" | "service"> & {
    id: string;
    type: string;
    language?: OneOrMany<string>;
    service?: OneOrMany<ServiceReference>;
    thumbnail?: OneOrMany<ContentResourceLike | ResourceReference>;
    metadata?: OneOrMany<MetadataItem>;
    summary?: LanguageMap;
    requiredStatement?: MetadataItem;
    rights?: string | null;
    seeAlso?: OneOrMany<ContentResourceLike | ResourceReference>;
    homepage?: OneOrMany<ContentResourceLike | ResourceReference>;
    rendering?: OneOrMany<ContentResourceLike | ResourceReference>;
    partOf?: OneOrMany<ResourceReference | ContentResourceLike>;
    spatialScale?: Quantity | null;
    temporalScale?: Quantity | null;
    provides?: OneOrMany<Provides>;
    fileSize?: number;
    [key: string]: unknown;
  }
>;

export type ImageResource = Prettify<
  Omit<ContentResourceBase, "type" | "height" | "width"> & {
    type: "Image";
    height: number;
    width: number;
  }
>;

export type AudioResource = Prettify<
  Omit<ContentResourceBase, "type" | "duration"> & {
    type: "Audio" | "Sound";
    duration: number;
  }
>;

export type VideoResource = Prettify<
  Omit<ContentResourceBase, "type" | "duration" | "height" | "width"> & {
    type: "Video";
    duration: number;
    height: number;
    width: number;
  }
>;

export type ModelResource = Prettify<Omit<ContentResourceBase, "type"> & { type: "Model" }>;
export type TextResource = Prettify<Omit<ContentResourceBase, "type"> & { type: "Text" }>;
export type DatasetResource = Prettify<Omit<ContentResourceBase, "type"> & { type: "Dataset" }>;

export type TextualBodyResource = Prettify<
  Omit<ContentResourceBase, "type"> & {
    type: "TextualBody";
    value: string;
    purpose?: OneOrMany<AnyMotivation | string>;
  }
>;

export type ChoiceResource = Prettify<
  Omit<ContentResourceBase, "type"> & {
    type: "Choice";
    items?: OneOrMany<ContentResourceLike | ResourceReference | string | Record<string, unknown>>;
    default?: ContentResourceLike | ResourceReference | string | Record<string, unknown>;
  }
>;

export type SpecificResource = Prettify<
  Omit<SpecificResourceV3, "source" | "selector" | "purpose" | "scope"> & {
    type: "SpecificResource";
    source: OneOrMany<ContentResourceLike | ResourceReference | string>;
    selector?: OneOrMany<Selector>;
    transform?: OneOrMany<Transform>;
    action?: OneOrMany<ContentResourceLike | ResourceReference | string>;
    purpose?: OneOrMany<AnyMotivation | string>;
    scope?: OneOrMany<ResourceReference | string>;
    [key: string]: unknown;
  }
>;

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

export type ContentResource = ContentResourceLike | SpecificResource | ContentResourceV3;
