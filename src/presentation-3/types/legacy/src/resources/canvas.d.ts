import { TechnicalProperties } from '../iiif/technical';
import { DescriptiveProperties } from '../iiif/descriptive';
import { StructuralProperties } from '../iiif/structural';
import { LinkingProperties } from '../iiif/linking';
import { JsonLDContext, OmitProperties, Prettify, SomeRequired } from '../utility';
import { AnnotationPage } from './annotationPage';

export type CanvasItems = AnnotationPage;

export type CanvasOmittedTechnical = 'format' | 'profile' | 'viewingDirection' | 'timeMode' | 'motivation';
export type CanvasOmittedDescriptive = 'language';
export type CanvasOmittedLinking = 'services' | 'start' | 'supplementary';
export type CanvasOmittedStructural = 'structures';

export type CanvasTechnical = OmitProperties<TechnicalProperties, CanvasOmittedTechnical>;
export type CanvasDescriptive = OmitProperties<DescriptiveProperties, CanvasOmittedDescriptive>;
export type CanvasStructural = OmitProperties<StructuralProperties<CanvasItems>, CanvasOmittedStructural>;
export type CanvasLinking = OmitProperties<LinkingProperties, CanvasOmittedLinking>;

export type Canvas = Prettify<
  SomeRequired<CanvasTechnical, 'id' | 'type'> &
    Partial<CanvasDescriptive> &
    Partial<CanvasStructural> &
    Partial<CanvasLinking> &
    JsonLDContext & {
      type: 'Canvas';
    }
>;

export type CanvasItemSchemas = 'AnnotationPage';
