import type {
  InternationalString,
  MetadataItem as MetadataItemV3,
} from "../../../../../presentation-3/types/legacy/src/iiif/descriptive";
import type { Reference } from "../../../../../presentation-3/types/legacy/src/reference";
import type {
  AnyMotivation,
  SpecificResource as SpecificResourceV3,
} from "../../../../../presentation-3/types/legacy/src/resources/annotation";
import type { IIIFExternalWebResource as IIIFExternalWebResourceV3 } from "../../../../../presentation-3/types/legacy/src/resources/contentResource";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { Selector } from "../extensions/presentation-4";
import type { Provides, Quantity, Transform } from "../iiif/technical";
import type { SceneComponent } from "./scene-components";

export type LanguageMap = InternationalString & {
  "@none"?: string[];
  none?: string[];
};
export type MetadataItem =
  | MetadataItemV3
  | {
      label: LanguageMap;
      value: { [language: string]: Array<string | number> };
    };
export type OneOrMany<T> = T | T[];

export type ResourceReference<TType extends string = string> = Prettify<
  Reference<TType> & {
    label?: LanguageMap | string | null;
    summary?: LanguageMap | null;
    profile?: string | string[] | Record<string, unknown>;
    format?: string;
    height?: number;
    width?: number;
    duration?: number;
    first?: string | ResourceReference;
    last?: string | ResourceReference;
    next?: string | ResourceReference;
    prev?: string | ResourceReference;
    total?: number;
  }
>;

export type ServiceReference = {
  id?: string;
  "@id"?: string;
  type?: string;
  "@type"?: string;
  profile?: string | Array<string, Record<string, unknown>> | Record<string, unknown>;
  label?: LanguageMap | string;
  service?: OneOrMany<ServiceReference>;
  services?: OneOrMany<ServiceReference>;
  format?: string;
  [key: string]: unknown;
};

export type ServiceLike = ServiceReference | string;
export type LinkedAnnotationLike = {
  id?: string;
  type: string;
  motivation?: OneOrMany<string>;
  body?: OneOrMany<ContentResourceLike | SpecificResource | ResourceReference | string>;
  target?: OneOrMany<ContentResourceLike | SpecificResource | ResourceReference | string>;
};
export type LinkedResource = ContentResourceLike | SpecificResource | ResourceReference | LinkedAnnotationLike | string;
export type AgentLike = {
  id?: string;
  type: "Agent";
  label: LanguageMap | null;
  homepage?: OneOrMany<LinkedResource>;
  logo?: OneOrMany<LinkedResource>;
  seeAlso?: OneOrMany<LinkedResource>;
  summary?: LanguageMap;
  service?: OneOrMany<ServiceLike>;
  profile?: string | string[] | Record<string, unknown>;
};

export type Agent = {
  id?: string;
  type: "Agent";
  label: LanguageMap | null;
  homepage?: OneOrMany<LinkedResource>;
  logo?: OneOrMany<LinkedResource>;
  seeAlso?: OneOrMany<LinkedResource>;
  summary?: LanguageMap;
};

export type ContentResourceBase = Prettify<
  Omit<IIIFExternalWebResourceV3, "language" | "service"> & {
    id?: string;
    "@id"?: string;
    type?: string;
    "@type"?: string;
    profile?: string | string[] | Record<string, unknown>;
    label?: LanguageMap | string | null;
    language?: OneOrMany<string>;
    provider?: OneOrMany<AgentLike | ResourceReference<"Agent">>;
    behavior?: OneOrMany<string>;
    service?: OneOrMany<ServiceLike>;
    services?: OneOrMany<ServiceLike>;
    thumbnail?: OneOrMany<LinkedResource>;
    metadata?: OneOrMany<MetadataItem>;
    summary?: LanguageMap;
    requiredStatement?: MetadataItem;
    rights?: string | null;
    seeAlso?: OneOrMany<LinkedResource>;
    homepage?: OneOrMany<LinkedResource>;
    rendering?: OneOrMany<LinkedResource>;
    partOf?: OneOrMany<LinkedResource>;
    logo?: OneOrMany<LinkedResource>;
    supplementary?: OneOrMany<LinkedResource>;
    canonical?: string;
    via?: OneOrMany<string>;
    annotations?: OneOrMany<LinkedResource>;
    spatialScale?: Quantity | null;
    temporalScale?: Quantity | null;
    provides?: OneOrMany<Provides>;
    fileSize?: number;
  }
>;

export type ImageResource = Prettify<
  Omit<ContentResourceBase, "type" | "height" | "width"> & {
    type: "Image";
    height: number;
    width: number;
  }
> & { [key: string]: unknown };

export type AudioResource = Prettify<
  Omit<ContentResourceBase, "type" | "duration"> & {
    type: "Audio" | "Sound";
    duration: number;
  }
> & { [key: string]: unknown };

export type VideoResource = Prettify<
  Omit<ContentResourceBase, "type" | "duration" | "height" | "width"> & {
    type: "Video";
    duration: number;
    height: number;
    width: number;
  }
> & { [key: string]: unknown };

export type ModelResource = Prettify<Omit<ContentResourceBase, "type"> & { type: "Model" }> & {
  [key: string]: unknown;
};
export type TextResource = Prettify<Omit<ContentResourceBase, "type"> & { type: "Text" }> & { [key: string]: unknown };
export type DatasetResource = Prettify<Omit<ContentResourceBase, "type"> & { type: "Dataset" }> & {
  [key: string]: unknown;
};

export type TextualBodyResource = Prettify<
  Omit<ContentResourceBase, "type"> & {
    type: "TextualBody";
    value: string;
    purpose?: OneOrMany<AnyMotivation | string>;
  }
> & { [key: string]: unknown };

export type ChoiceResource = Prettify<
  Omit<ContentResourceBase, "type"> & {
    type: "Choice";
    items: OneOrMany<LinkedResource>;
    default?: LinkedResource;
  }
> & { [key: string]: unknown };

export type CompositeResource = Prettify<
  Omit<ContentResourceBase, "type"> & {
    type: "Composite";
    items: OneOrMany<LinkedResource>;
  }
> & { [key: string]: unknown };

export type ListResource = Prettify<
  Omit<ContentResourceBase, "type"> & {
    type: "List";
    items: OneOrMany<LinkedResource>;
  }
> & { [key: string]: unknown };

export type IndependentsResource = Prettify<
  Omit<ContentResourceBase, "type"> & {
    type: "Independents";
    items: OneOrMany<LinkedResource>;
  }
> & { [key: string]: unknown };

export type SpecificResource = Prettify<
  Omit<SpecificResourceV3, "source" | "selector" | "purpose" | "scope"> & {
    id: string;
    type: "SpecificResource";
    source: OneOrMany<LinkedResource>;
    selector?: OneOrMany<Selector>;
    position?: Selector;
    transform?: OneOrMany<Transform>;
    action?: OneOrMany<LinkedResource>;
    purpose?: OneOrMany<AnyMotivation | string>;
    scope?: OneOrMany<ResourceReference | string>;
    [key: string]: unknown;
  }
> & { [key: string]: unknown };

export type ContentResourceLike =
  | ImageResource
  | AudioResource
  | VideoResource
  | ModelResource
  | TextResource
  | DatasetResource
  | TextualBodyResource
  | ChoiceResource
  | CompositeResource
  | ListResource
  | IndependentsResource
  | ContentResourceBase
  | SceneComponent;

export type ContentResource = ContentResourceLike | SpecificResource;
