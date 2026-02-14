import { InternationalString } from '../iiif/descriptive';
import { ContentResource } from './contentResource';

export type ResourceProvider = {
  id: string;
  type: 'Agent';
  label: InternationalString;
  homepage?: ContentResource[];
  logo?: ContentResource[];
  seeAlso?: ContentResource[];
};
