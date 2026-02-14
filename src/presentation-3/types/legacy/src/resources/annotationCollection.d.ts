import { W3CAnnotationPage } from './annotationPage';
import { OmitProperties, Prettify, SomeRequired } from '../utility';
import { TechnicalProperties } from '../iiif/technical';
import { DescriptiveProperties } from '../iiif/descriptive';
import { LinkingProperties } from '../iiif/linking';
import { Manifest } from './manifest';
import { Collection } from './collection';

export type AnnotationCollectionOmittedTechnical =
  | 'type'
  | 'format'
  | 'profile'
  | 'height'
  | 'width'
  | 'duration'
  | 'viewingDirection'
  | 'timeMode'
  | 'motivation';
export type AnnotationCollectionOmittedDescriptive = 'accompanyingCanvas' | 'placeholderCanvas' | 'navDate' | 'language';
export type AnnotationCollectionOmittedLinking = 'services' | 'partOf' | 'start' | 'supplementary';

export type AnnotationCollectionTechnical = OmitProperties<TechnicalProperties, AnnotationCollectionOmittedTechnical>;
export type AnnotationCollectionDescriptive = OmitProperties<
  DescriptiveProperties,
  AnnotationCollectionOmittedDescriptive
>;
export type AnnotationCollectionLinking = OmitProperties<LinkingProperties, AnnotationCollectionOmittedLinking>;

export type W3CAnnotationCollection = {
  '@context'?: string;
  id: string;
  type: 'AnnotationCollection';
  label: string | string[];
  total?: number;
  first?: string | OmitProperties<W3CAnnotationPage, 'partOf'>;
  last?: string | OmitProperties<W3CAnnotationPage, 'partOf'>;
};

export type AnnotationCollection = Prettify<
  SomeRequired<AnnotationCollectionTechnical, 'id'> &
    Partial<AnnotationCollectionDescriptive> &
    Partial<AnnotationCollectionLinking> &
    OmitProperties<W3CAnnotationCollection, 'label'> & {
      type: 'AnnotationCollection';
      partOf: Array<Collection | Manifest | string>;
    }
>;
