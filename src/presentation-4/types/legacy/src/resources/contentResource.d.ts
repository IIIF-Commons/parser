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
export type ServiceProfileDetails = {
  "@context"?: string;
  "@type"?: "iiif:ImageProfile";
  type?: "ImageProfile";
  formats?: string[];
  qualities?: string[];
  supports?: string[];
  maxArea?: number;
  maxHeight?: number;
  maxWidth?: number;
};
export type ServiceProfile = string | ServiceProfileDetails;
export type ServiceProfileValue = ServiceProfile | ServiceProfile[];
export type ServiceSize = {
  type?: "Size";
  width: number;
  height: number;
};
export type ServiceTile = {
  type?: "Tile";
  scaleFactors: number[];
  width: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
};

export type ResourceReference<TType extends string = string> = Prettify<
  Reference<TType> & {
    label?: LanguageMap | string | null;
    summary?: LanguageMap | null;
    profile?: ServiceProfileValue;
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
  "@context"?: string | string[];
  type?: string;
  "@type"?: string;
  profile?: ServiceProfileValue;
  label?: LanguageMap | string;
  format?: string;
  protocol?: string;
  width?: number;
  height?: number;
  sizes?: ServiceSize[];
  tiles?: ServiceTile[];
  physicalScale?: number;
  physicalUnits?: string;
  extraFormats?: string[];
  extraQualities?: string[];
  header?: LanguageMap | string;
  description?: LanguageMap | string;
  service?: ServiceReference[];
  services?: ServiceReference[];
};

export type ServiceLike = ServiceReference | string;
export type LinkedAnnotationBody = ContentResourceLike | SpecificResource | ResourceReference;
export type LinkedAnnotationTarget = ContentResourceLike | SpecificResource | ResourceReference;
export type LinkedAnnotationList<T> = {
  type: "List";
  items: T[];
};
export type LinkedAnnotationLike = {
  id?: string;
  type: string;
  motivation?: string[];
  body?: LinkedAnnotationBody | LinkedAnnotationList<LinkedAnnotationBody>;
  target?: LinkedAnnotationTarget | LinkedAnnotationList<LinkedAnnotationTarget>;
};
export type LinkedResource = ContentResourceLike | SpecificResource | ResourceReference | LinkedAnnotationLike | string;
export type AgentLike = {
  id?: string;
  type: "Agent";
  label: LanguageMap | null;
  homepage?: LinkedResource[];
  logo?: LinkedResource[];
  seeAlso?: LinkedResource[];
  summary?: LanguageMap;
  service?: ServiceLike[];
  profile?: ServiceProfileValue;
};

export type Agent = {
  id?: string;
  type: "Agent";
  label: LanguageMap | null;
  homepage?: LinkedResource[];
  logo?: LinkedResource[];
  seeAlso?: LinkedResource[];
  summary?: LanguageMap;
};

export type ContentResourceBase = Prettify<
  Omit<IIIFExternalWebResourceV3, "language" | "service"> & {
    id?: string;
    "@id"?: string;
    type?: string;
    "@type"?: string;
    profile?: ServiceProfileValue;
    label?: LanguageMap | string | null;
    language?: string[];
    provider?: Array<AgentLike | ResourceReference<"Agent">>;
    behavior?: string[];
    service?: ServiceLike[];
    services?: ServiceLike[];
    thumbnail?: LinkedResource[];
    metadata?: MetadataItem[];
    summary?: LanguageMap;
    requiredStatement?: MetadataItem;
    rights?: string | null;
    seeAlso?: LinkedResource[];
    homepage?: LinkedResource[];
    rendering?: LinkedResource[];
    partOf?: LinkedResource[];
    logo?: LinkedResource[];
    supplementary?: LinkedResource[];
    canonical?: string;
    via?: string[];
    annotations?: LinkedResource[];
    spatialScale?: Quantity | null;
    temporalScale?: Quantity | null;
    provides?: Provides[];
    fileSize?: number;
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
    purpose?: Array<AnyMotivation | string>;
  }
>;

export type ChoiceResource = Prettify<
  Omit<ContentResourceBase, "type"> & {
    type: "Choice";
    items: LinkedResource[];
    default?: LinkedResource;
  }
>;

export type CompositeResource = Prettify<
  Omit<ContentResourceBase, "type"> & {
    type: "Composite";
    items: LinkedResource[];
  }
>;

export type ListResource = Prettify<
  Omit<ContentResourceBase, "type"> & {
    type: "List";
    items: LinkedResource[];
  }
>;

export type IndependentsResource = Prettify<
  Omit<ContentResourceBase, "type"> & {
    type: "Independents";
    items: LinkedResource[];
  }
>;

export type SpecificResource = Prettify<
  Omit<SpecificResourceV3, "source" | "selector" | "purpose" | "scope"> & {
    id: string;
    type: "SpecificResource";
    source: LinkedResource;
    selector?: Selector[];
    position?: Selector;
    transform?: Transform[];
    action?: LinkedResource[];
    purpose?: Array<AnyMotivation | string>;
    scope?: Array<ResourceReference | string>;
  }
>;

export type StartContainerReference = ResourceReference<"Canvas" | "Scene" | "Timeline">;

export type StartSpecificResource = {
  id: string;
  type: "SpecificResource";
  source: ResourceReference<"Canvas"> | string;
  selector: Selector | Selector[];
};

export type Start = StartContainerReference | StartSpecificResource;

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
