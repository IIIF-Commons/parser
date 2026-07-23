import { InternationalString, Reference } from '../../../../presentation-3/types';

export declare type ResourceProviderNormalized = {
  id: string;
  type: 'Agent';
  label: InternationalString;
  homepage: Array<Reference<'ContentResource'>>;
  logo: Array<Reference<'ContentResource'>>;
  seeAlso: Array<Reference<'ContentResource'>>;
};
