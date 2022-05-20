import {
  Agent,
  Annotation,
  AnnotationCollection,
  AnnotationPage,
  Canvas,
  ChoiceBody,
  ChoiceTarget,
  Collection,
  ContentResource,
  DescriptiveProperties,
  IIIFExternalWebResource,
  LinkingProperties,
  Manifest,
  Range,
  RangeItems,
  Required,
  Service,
} from '@iiif/presentation-3';
import { ResourceProvider } from '@iiif/presentation-3/resources/provider';

export const types = [
  'Collection',
  'Manifest',
  'Canvas',
  'AnnotationPage',
  'AnnotationCollection',
  'Annotation',
  'ContentResource',
  'Range',
  'Service',
  'Selector',
  'Agent',
];

export type Traversal<T> = (jsonLd: T) => Partial<T> | any;

export type TraversalMap = {
  collection?: Array<Traversal<Collection>>;
  manifest?: Array<Traversal<Manifest>>;
  canvas?: Array<Traversal<Canvas>>;
  annotationCollection?: Array<Traversal<AnnotationCollection>>;
  annotationPage?: Array<Traversal<AnnotationPage>>;
  annotation?: Array<Traversal<Annotation>>;
  contentResource?: Array<Traversal<ContentResource>>;
  choice?: Array<Traversal<ChoiceTarget | ChoiceBody>>;
  range?: Array<Traversal<Range>>;
  service?: Array<Traversal<Service>>;
  agent?: Array<Traversal<ResourceProvider>>;
};

export type TraverseOptions = {
  allowUndefinedReturn: boolean;
};

export function identifyResource(resource: any): string {
  if (typeof resource === 'undefined' || resource === null) {
    throw new Error('Null or undefined is not a valid entity.');
  }
  if (Array.isArray(resource)) {
    throw new Error('Array is not a valid entity');
  }
  if (typeof resource !== 'object') {
    throw new Error(`${typeof resource} is not a valid entity`);
  }

  if (typeof resource!.type === 'string') {
    const hasType = types.indexOf(resource.type);
    if (hasType !== -1) {
      return types[hasType];
    }
  }

  if (resource!.profile) {
    return 'Service';
  }

  throw new Error('Resource type is not known');
}

export class Traverse {
  private traversals: Required<TraversalMap>;

  private options: TraverseOptions;

  constructor(traversals: TraversalMap, options: Partial<TraverseOptions> = {}) {
    this.traversals = {
      collection: [],
      manifest: [],
      canvas: [],
      annotationCollection: [],
      annotationPage: [],
      annotation: [],
      contentResource: [],
      choice: [],
      range: [],
      service: [],
      agent: [],
      ...traversals,
    };
    this.options = {
      allowUndefinedReturn: false,
      ...options,
    };
  }

  static all(traversal: (resource: any) => any) {
    return new Traverse({
      collection: [traversal],
      manifest: [traversal],
      canvas: [traversal],
      annotationCollection: [traversal],
      annotationPage: [traversal],
      annotation: [traversal],
      contentResource: [traversal],
      choice: [traversal],
      range: [traversal],
      service: [traversal],
    });
  }

  traverseDescriptive<T extends Partial<DescriptiveProperties>>(_resource: T) {
    let changed = false;
    const resource = Object.assign({}, _resource) as T;
    if (resource.thumbnail) {
      changed = true;
      resource.thumbnail = resource.thumbnail.map((thumbnail) =>
        this.traverseType(thumbnail, this.traversals.contentResource)
      );
    }
    if (resource.provider) {
      changed = true;
      resource.provider = resource.provider.map((agent) => this.traverseAgent(agent));
    }

    if (!changed) {
      return _resource;
    }

    return resource;
  }

  traverseLinking<T extends Partial<LinkingProperties>>(_resource: T) {
    let changed = false;
    const resource = Object.assign({}, _resource) as T;
    if (resource.seeAlso) {
      changed = true;
      resource.seeAlso = resource.seeAlso.map((content) => this.traverseType(content, this.traversals.contentResource));
    }
    if (resource.service) {
      changed = true;
      resource.service = resource.service.map((service) => this.traverseType(service, this.traversals.service));
    }
    if (resource.services) {
      changed = true;
      resource.services = resource.services.map((service) => this.traverseType(service, this.traversals.service));
    }
    if (resource.logo) {
      changed = true;
      resource.logo = resource.logo.map((content) => this.traverseType(content, this.traversals.contentResource));
    }
    if (resource.homepage) {
      changed = true;
      resource.homepage = resource.homepage.map((homepage) =>
        this.traverseType(homepage, this.traversals.contentResource)
      );
    }
    if (resource.partOf) {
      changed = true;
      // Array<ContentResource | Canvas | AnnotationCollection>
      resource.partOf = resource.partOf.map((partOf) => {
        if (typeof partOf === 'string' || !partOf.type) {
          return this.traverseType(partOf as ContentResource, this.traversals.contentResource);
        }
        if (partOf.type === 'Canvas') {
          return this.traverseType(partOf as Canvas, this.traversals.canvas);
        }
        if (partOf.type === 'AnnotationCollection') {
          return this.traverseType(partOf as AnnotationCollection, this.traversals.annotationCollection);
        }
        return this.traverseType(partOf as ContentResource, this.traversals.contentResource);
      });
    }
    if (resource.start) {
      changed = true;
      resource.start = resource.start ? this.traverseType(resource.start, this.traversals.canvas) : null;
    }
    if (resource.rendering) {
      changed = true;
      resource.rendering = resource.rendering.map((content) =>
        this.traverseType(content, this.traversals.contentResource)
      );
    }
    if (resource.supplementary) {
      changed = true;
      resource.supplementary = resource.supplementary.map((content) =>
        this.traverseType(content, this.traversals.contentResource)
      );
    }

    if (!changed) {
      return _resource;
    }

    return resource;
  }

  traverseCollectionItems(_collection: Collection): Collection {
    const collection = Object.assign({}, _collection) as Collection;

    if (collection.items) {
      collection.items.map((collectionOrManifest: Manifest | Collection) => {
        if (collectionOrManifest.type === 'Collection') {
          return this.traverseCollection(collectionOrManifest as Collection);
        }
        return this.traverseManifest(collectionOrManifest as Manifest);
      });

      return collection;
    }

    return _collection;
  }

  traverseCollection(collection: Collection): Collection {
    return this.traverseType<Collection>(
      this.traverseDescriptive(
        this.traverseInlineAnnotationPages(
          this.traverseLinking(this.traversePosterCanvas(this.traverseCollectionItems(collection)))
        )
      ),
      this.traversals.collection
    );
  }

  traverseManifestItems(_manifest: Manifest): Manifest {
    const manifest = Object.assign({}, _manifest) as Manifest;
    if (manifest.items) {
      manifest.items = manifest.items.map((canvas) => this.traverseCanvas(canvas));

      return manifest;
    }

    return _manifest;
  }

  traverseManifestStructures(_manifest: Manifest): Manifest {
    const manifest = Object.assign({}, _manifest) as Manifest;

    if (manifest.structures) {
      manifest.structures = manifest.structures.map((range) => this.traverseRange(range));

      return manifest;
    }
    return _manifest;
  }

  traverseManifest(manifest: Manifest): Manifest {
    return this.traverseType<Manifest>(
      this.traverseInlineAnnotationPages(
        this.traverseManifestStructures(
          this.traversePosterCanvas(
            this.traverseDescriptive(this.traverseLinking(this.traverseManifestItems(manifest)))
          )
        )
      ),
      this.traversals.manifest
    );
  }

  traverseCanvasItems(_canvas: Canvas): Canvas {
    const canvas = Object.assign({}, _canvas) as Canvas;

    if (canvas.items && canvas.items.length) {
      canvas.items = canvas.items.map((annotationPage: AnnotationPage): AnnotationPage => {
        return this.traverseAnnotationPage(annotationPage);
      });

      return canvas;
    }

    return _canvas;
  }

  traverseInlineAnnotationPages<T extends Manifest | Canvas | Range | string>(_resource: T): T {
    if (typeof _resource === 'string' || !_resource) {
      return _resource;
    }
    const resource = Object.assign({}, _resource) as T extends string ? never : T;
    if (resource.annotations && resource.annotations.length) {
      resource.annotations = resource.annotations.map((annotationPage: AnnotationPage): AnnotationPage => {
        return this.traverseAnnotationPage(annotationPage);
      });

      return resource;
    }

    return _resource;
  }

  traverseCanvas(canvas: Canvas): Canvas {
    return this.traverseType<Canvas>(
      this.traverseInlineAnnotationPages(
        this.traversePosterCanvas(this.traverseDescriptive(this.traverseLinking(this.traverseCanvasItems(canvas))))
      ),
      this.traversals.canvas
    );
  }

  traverseAnnotationPageItems(_annotationPage: AnnotationPage): AnnotationPage {
    const annotationPage = Object.assign({}, _annotationPage) as AnnotationPage;

    if (annotationPage.items && annotationPage.items.length) {
      annotationPage.items = annotationPage.items.map((annotation: Annotation): Annotation => {
        return this.traverseAnnotation(annotation);
      });

      return annotationPage;
    }
    return _annotationPage;
  }

  traverseAnnotationPage(annotationPageJson: AnnotationPage): AnnotationPage {
    return this.traverseType<AnnotationPage>(
      this.traverseDescriptive(this.traverseLinking(this.traverseAnnotationPageItems(annotationPageJson) as any)),
      this.traversals.annotationPage
    );
  }

  // Disabling these.

  traverseAnnotationBody(_annotation: Annotation): Annotation {
    const annotation = Object.assign({}, _annotation) as Annotation;

    if (Array.isArray(annotation.body)) {
      annotation.body = annotation.body.map((annotationBody: any): ContentResource => {
        return this.traverseContentResource(annotationBody);
      });
    } else if (annotation.body) {
      annotation.body = this.traverseContentResource(annotation.body as ContentResource);
    }

    return annotation;
  }

  /*
  traverseAnnotationTarget(annotation: Annotation): Annotation {
    if (Array.isArray(annotation.target)) {
      annotation.target = annotation.target.map(
        (annotationBody: ContentResource): ContentResource => {
          return this.traverseContentResource(annotationBody);
        }
      );
    } else if (annotation.target) {
      annotation.target = this.traverseContentResource(annotation.target);
    }

    return annotation;
  }
  */

  traversePosterCanvas<T extends Collection | Manifest | Canvas | Range>(_json: T): T {
    const json = Object.assign({}, _json) as T;
    // @deprecated
    if (json.posterCanvas) {
      json.posterCanvas = this.traverseType(json.posterCanvas, this.traversals.canvas);
    }

    if (json.placeholderCanvas) {
      json.placeholderCanvas = this.traverseType(json.placeholderCanvas, this.traversals.canvas);
    }

    if (json.accompanyingCanvas) {
      json.accompanyingCanvas = this.traverseType(json.accompanyingCanvas, this.traversals.canvas);
    }

    return json;
  }

  // @todo traverseAnnotationSelector
  traverseAnnotation(annotationJson: Annotation): Annotation {
    return this.traverseType<Annotation>(
      // Disabled these for now.
      // this.traverseAnnotationTarget(this.traverseLinking(this.traverseAnnotationBody(annotationJson))),
      this.traverseLinking(this.traverseAnnotationBody(annotationJson)),
      this.traversals.annotation
    );
  }

  traverseContentResourceLinking(_contentResourceJson: ContentResource): ContentResource {
    if (typeof _contentResourceJson === 'string' || !_contentResourceJson) {
      return _contentResourceJson;
    }
    const contentResourceJson = Object.assign({}, _contentResourceJson) as any;
    if (contentResourceJson && (contentResourceJson as IIIFExternalWebResource)!.service) {
      (contentResourceJson as IIIFExternalWebResource).service = (
        (contentResourceJson as IIIFExternalWebResource).service || []
      ).map((service) => this.traverseType(service, this.traversals.service));
    }

    return contentResourceJson;
  }

  traverseContentResource(_contentResourceJson: ContentResource): ContentResource {
    const contentResourceJson =
      typeof _contentResourceJson === 'string'
        ? _contentResourceJson
        : (Object.assign({}, _contentResourceJson) as ContentResource);

    if ((contentResourceJson as any).type === 'Choice') {
      (contentResourceJson as any).items = (contentResourceJson as any).items.map((choiceItem: ContentResource) => {
        return this.traverseContentResource(choiceItem);
      });
    }

    return this.traverseType<ContentResource>(
      // This needs an `any` because of the scope of W3C annotation bodies (covered by ContentResource).
      // ContentResources are permitted to have a `.annotations` property, so we can pass it as any  for this
      // case.
      this.traverseInlineAnnotationPages(this.traverseContentResourceLinking(contentResourceJson) as any),
      this.traversals.contentResource
    );
  }

  traverseRangeRanges(_range: Range): Range {
    const range = Object.assign({}, _range) as Range;
    if (range.items) {
      range.items = range.items.map((rangeOrManifest: RangeItems) => {
        if (typeof rangeOrManifest === 'string') {
          return this.traverseCanvas({ id: rangeOrManifest, type: 'Canvas' });
        }
        if (rangeOrManifest.type === 'Manifest') {
          return this.traverseManifest(rangeOrManifest as Manifest);
        }
        return this.traverseRange(rangeOrManifest as Range);
      });
    }

    return range;
  }

  traverseRange(range: Range): Range {
    return this.traverseType<Range>(
      this.traversePosterCanvas(this.traverseDescriptive(this.traverseLinking(this.traverseRangeRanges(range)))),
      this.traversals.range
    );
  }

  traverseAgent(agent: ResourceProvider) {
    return this.traverseType<ResourceProvider>(
      this.traverseDescriptive(this.traverseLinking(agent)),
      this.traversals.agent
    );
  }

  traverseType<T>(object: T, traversals: Array<Traversal<T>>): T {
    return traversals.reduce((acc: T, traversal: Traversal<T>): T => {
      const returnValue = traversal(acc);
      if (typeof returnValue === 'undefined' && !this.options.allowUndefinedReturn) {
        return acc;
      }
      return returnValue;
    }, object);
  }

  traverseService(service: Service): Service {
    return this.traverseType<Service>(service, this.traversals.service);
  }

  traverseUnknown(resource: any) {
    const type = identifyResource(resource);

    switch (type) {
      case 'Collection':
        return this.traverseCollection(resource as Collection);
      case 'Manifest':
        return this.traverseManifest(resource as Manifest);
      case 'Canvas':
        return this.traverseCanvas(resource as Canvas);
      case 'AnnotationPage':
        return this.traverseAnnotationPage(resource as AnnotationPage);
      case 'Annotation':
        return this.traverseAnnotation(resource as Annotation);
      case 'ContentResource':
        return this.traverseContentResource(resource as ContentResource);
      case 'Range':
        return this.traverseRange(resource as Range);
      case 'Service':
        return this.traverseService(resource as Service);
      case 'Agent':
        return this.traverseAgent(resource as ResourceProvider);
      default:
        throw new Error(`Unknown or unsupported resource type of ${type}`);
    }
  }
}
