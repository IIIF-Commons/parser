import { Reference, SpecificResource } from '../../../../presentation-3/types';

export declare type StructuralNormalized<T extends Reference | SpecificResource> = {
  items: T[];
  annotations: Array<Reference<'AnnotationPage'>>;
  structures: Array<Reference<'Range'>>;
};
