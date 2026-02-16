import type { Service as ServiceV3 } from "../../../../../presentation-3/types/legacy/src/resources/service";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";

type OneOrMany<T> = T | T[];

export type ServiceReference = {
  id: string;
  type: string;
  profile?: string | string[];
  service?: OneOrMany<ServiceReference>;
  [key: string]: unknown;
};

export type GenericService = Prettify<
  ServiceReference & {
    label?: Record<string, string[]>;
  }
>;

export type Service = ServiceV3 | GenericService;
