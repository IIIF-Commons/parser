import type { Service as ServiceV3 } from "../../../../../presentation-3/types/legacy/src/resources/service";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { LanguageMap, OneOrMany } from "./contentResource";

export type ServiceReference = {
  id?: string;
  "@id"?: string;
  type?: string;
  "@type"?: string;
  profile?: string | string[] | Record<string, unknown>;
  label?: LanguageMap | string;
  service?: OneOrMany<ServiceReference>;
  services?: OneOrMany<ServiceReference>;
  format?: string;
  [key: string]: unknown;
};

export type GenericService = Prettify<
  ServiceReference & {
    id?: string;
    "@id"?: string;
    type?: string;
    "@type"?: string;
    profile?: string | string[] | Record<string, unknown>;
    label?: LanguageMap | string;
    service?: OneOrMany<GenericService>;
    services?: OneOrMany<GenericService>;
    [key: string]: unknown;
  }
>;

export type Service = ServiceV3 | GenericService | string | Record<string, unknown>;
