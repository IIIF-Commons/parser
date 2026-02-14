export type * from './legacy/index';
export type { ResourceProvider } from './legacy/src/resources/provider';

import { createPresentationHelpers, type ResourceSpecs } from '../../presentation-shared/helpers/create-helpers';
import type {
  Agent,
  Annotation,
  AnnotationCollection,
  AnnotationPage,
  Canvas,
  Collection,
  ContentResource,
  FragmentSelector,
  IIIFExternalWebResource,
  ImageApiSelector,
  ImageService,
  ImageService2,
  ImageService3,
  Manifest,
  PointSelector,
  Range,
  Reference,
  Service,
  SpecificResource,
  Selector,
} from './legacy/index';

export type ImageResourceLike = Omit<IIIFExternalWebResource, 'type'> & { type: 'Image' };
export type Sound = Omit<IIIFExternalWebResource, 'type'> & { type: 'Sound' };
export type Video = Omit<IIIFExternalWebResource, 'type'> & { type: 'Video' };
export type Text = Omit<IIIFExternalWebResource, 'type'> & { type: 'Text' };
export type Dataset = Omit<IIIFExternalWebResource, 'type'> & { type: 'Dataset' };
export type ImageService1 = ImageService & ({ type: 'ImageService1' } | { '@type': 'ImageService1' });

export type Presentation3HelperTypes = {
  Collection: Collection;
  Manifest: Manifest;
  Canvas: Canvas;
  AnnotationPage: AnnotationPage;
  AnnotationCollection: AnnotationCollection;
  Annotation: Annotation;
  Range: Range;
  ContentResource: ContentResource;
  SpecificResource: SpecificResource;
  Service: Service;
  Selector: Selector;
  Agent: Agent;
  Reference: Reference;
  Image: ImageResourceLike;
  Sound: Sound;
  Video: Video;
  Text: Text;
  Dataset: Dataset;
  FragmentSelector: FragmentSelector;
  PointSelector: PointSelector;
  ImageApiSelector: ImageApiSelector;
  ImageService: ImageService;
  ImageService1: ImageService1;
  ImageService2: ImageService2;
  ImageService3: ImageService3;
};

const presentation3Specs: ResourceSpecs<Presentation3HelperTypes> = {
  Collection: { type: 'Collection', aliases: ['sc:Collection'] },
  Manifest: { type: 'Manifest', aliases: ['sc:Manifest'] },
  Canvas: { type: 'Canvas', aliases: ['sc:Canvas'] },
  AnnotationPage: { type: 'AnnotationPage', aliases: ['sc:AnnotationList'] },
  AnnotationCollection: { type: 'AnnotationCollection', aliases: ['sc:Layer'] },
  Annotation: { type: 'Annotation', aliases: ['oa:Annotation'] },
  Range: { type: 'Range', aliases: ['sc:Range'] },
  ContentResource: {
    type: 'ContentResource',
    aliases: ['Image', 'Video', 'Sound', 'Text', 'Dataset', 'TextualBody', 'dctypes:Image', 'dctypes:Text', 'dctypes:Sound'],
  },
  SpecificResource: { type: 'SpecificResource', aliases: ['oa:SpecificResource'] },
  Service: { type: 'Service' },
  Selector: { type: 'Selector' },
  Agent: { type: 'Agent' },
  Reference: { type: 'Reference' },
  Image: { type: 'Image', aliases: ['dctypes:Image'] },
  Sound: { type: 'Sound', aliases: ['dctypes:Sound', 'Audio'] },
  Video: { type: 'Video' },
  Text: { type: 'Text', aliases: ['dctypes:Text', 'TextualBody'] },
  Dataset: { type: 'Dataset' },
  FragmentSelector: { type: 'FragmentSelector', aliases: ['oa:FragmentSelector'] },
  PointSelector: { type: 'PointSelector' },
  ImageApiSelector: { type: 'ImageApiSelector', aliases: ['iiif:ImageApiSelector'] },
  ImageService: { type: 'ImageService3', aliases: ['ImageService1', 'ImageService2', 'ImageService3'] },
  ImageService1: { type: 'ImageService1' },
  ImageService2: { type: 'ImageService2' },
  ImageService3: { type: 'ImageService3' },
};

const presentation3Helpers = createPresentationHelpers(presentation3Specs);

/** Runtime-checked identity helpers for Presentation 3 resources. */
export const infer = presentation3Helpers.infer;
/** Runtime assertion helpers for Presentation 3 resources. */
export const cast = presentation3Helpers.cast;
/** Type guards for Presentation 3 discriminated resources. */
export const narrow = presentation3Helpers.narrow;
