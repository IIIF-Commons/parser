import {
  AnnotationPageOmittedDescriptive,
  AnnotationPageOmittedLinking,
  AnnotationPageOmittedStructural,
  AnnotationPageOmittedTechnical,
  OmitProperties,
  Reference,
  TechnicalProperties,
} from '../../../../presentation-3/types';
import { LinkingNormalized } from '../iiif/linking';
import { StructuralNormalized } from '../iiif/structural';
import { DescriptiveNormalized } from '../iiif/descriptive';

export declare type AnnotationPageNormalized = OmitProperties<TechnicalProperties, AnnotationPageOmittedTechnical> &
  OmitProperties<DescriptiveNormalized, AnnotationPageOmittedDescriptive> &
  OmitProperties<StructuralNormalized<Reference<'Annotation'>>, AnnotationPageOmittedStructural> &
  OmitProperties<LinkingNormalized, AnnotationPageOmittedLinking> & {
    type: 'AnnotationPage';
  };
