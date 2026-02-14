import {
  ManifestOmittedDescriptive,
  ManifestOmittedLinking,
  ManifestOmittedTechnical,
  OmitProperties,
  Reference,
  TechnicalProperties,
  NavPlaceExtension,
} from '../../../../presentation-3/types';
import { DescriptiveNormalized } from '../iiif/descriptive';
import { StructuralNormalized } from '../iiif/structural';
import { LinkingNormalized } from '../iiif/linking';

export declare type ManifestNormalized = OmitProperties<TechnicalProperties, ManifestOmittedTechnical> &
  OmitProperties<DescriptiveNormalized, ManifestOmittedDescriptive> &
  StructuralNormalized<Reference<'Canvas'>> &
  OmitProperties<LinkingNormalized, ManifestOmittedLinking> &
  NavPlaceExtension & {
    '@context'?: string | string[];
    type: 'Manifest';
  };
