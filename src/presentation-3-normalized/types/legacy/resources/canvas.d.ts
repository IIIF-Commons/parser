import {
  CanvasOmittedDescriptive,
  CanvasOmittedLinking,
  CanvasOmittedStructural,
  CanvasOmittedTechnical,
  NavPlaceExtension,
  OmitProperties,
  Reference,
  TechnicalProperties,
} from '../../../../presentation-3/types';
import { DescriptiveNormalized } from '../iiif/descriptive';
import { StructuralNormalized } from '../iiif/structural';
import { LinkingNormalized } from '../iiif/linking';

export declare type CanvasNormalized = OmitProperties<TechnicalProperties, CanvasOmittedTechnical> &
  OmitProperties<DescriptiveNormalized, CanvasOmittedDescriptive> &
  OmitProperties<StructuralNormalized<Reference<'AnnotationPage'>>, CanvasOmittedStructural> &
  OmitProperties<LinkingNormalized, CanvasOmittedLinking> &
  NavPlaceExtension & { type: 'Canvas' };
