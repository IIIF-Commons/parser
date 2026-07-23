import type { Service as ServiceV3 } from "../../../../../presentation-3/types/legacy/src/resources/service";
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

export interface GenericService extends ServiceReference {
  id: string;
  type: string;
  service?: GenericService[];
  services?: GenericService[];
}

export type Service = ServiceV3 | GenericService;
