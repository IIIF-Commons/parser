import type { Service as ServiceV3 } from "../../../../../presentation-3/types/legacy/src/resources/service";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { LanguageMap, ServiceProfileValue, ServiceSize, ServiceTile } from "./contentResource";

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

export type GenericService = Prettify<
  ServiceReference & {
    id: string;
    "@id"?: string;
    type: string;
    "@type"?: string;
    "@context"?: string | string[];
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
    service?: GenericService[];
    services?: GenericService[];
  }
>;

export type Service = ServiceV3 | GenericService;
