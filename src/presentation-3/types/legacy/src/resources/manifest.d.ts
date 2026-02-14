import { TechnicalProperties } from '../iiif/technical';
import { DescriptiveProperties } from '../iiif/descriptive';
import { StructuralProperties } from '../iiif/structural';
import { LinkingProperties } from '../iiif/linking';
import { JsonLDContext, OmitProperties, Prettify, SomeRequired } from '../utility';
import { Canvas } from './canvas';
import { NavPlaceExtension } from '../extensions/nav-place';

export type ManifestItems = Canvas;

export type ManifestOmittedTechnical = 'format' | 'profile' | 'height' | 'width' | 'duration' | 'timeMode' | 'motivation';
export type ManifestOmittedDescriptive = 'language';
export type ManifestOmittedLinking = 'supplementary';

export type ManifestTechnical = OmitProperties<TechnicalProperties, ManifestOmittedTechnical>;
export type ManifestDescriptive = OmitProperties<DescriptiveProperties, ManifestOmittedDescriptive>;
export type ManifestStructural = StructuralProperties<Canvas>;
export type ManifestLinking = OmitProperties<LinkingProperties, ManifestOmittedLinking>;

export type Manifest = Prettify<
  SomeRequired<ManifestTechnical, 'id' | 'type'> &
    SomeRequired<ManifestDescriptive, 'label'> &
    SomeRequired<ManifestStructural, 'items'> &
    Partial<ManifestLinking> &
    NavPlaceExtension &
    JsonLDContext & {
      type: 'Manifest';
    }
>;

type ManifestItemSchemas = 'Canvas';
