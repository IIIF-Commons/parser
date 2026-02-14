import { EmbeddedResource, ExternalResourceTypes, ExternalWebResource, SpecificResource } from './annotation';
import { Service } from './service';
import { Prettify } from '../utility';

export type IIIFExternalWebResource = Prettify<
  ExternalWebResource & {
    type: ExternalResourceTypes | string;
    height?: number;
    width?: number;
    service?: Service[];
    duration?: number;
  }
>;

export type ContentResourceString = string;

export type ContentResource = EmbeddedResource | ExternalWebResource | SpecificResource | IIIFExternalWebResource;
