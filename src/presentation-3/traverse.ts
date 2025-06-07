import {
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
  SpecificResource,
  ResourceProvider,
  StructuralProperties,
} from '@iiif/presentation-3';
import { isSpecificResource } from '../shared/is-specific-resource';
import { ensureArray } from '../shared/ensure-array';
import { compose } from '../shared/compose';

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

export type TraversalContext = { parent?: any };

export type Traversal<T> = (jsonLd: T, context: TraversalContext) => Partial<T> | any;

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
  specificResource?: Array<Traversal<SpecificResource>>;
  geoJson?: Array<Traversal<import('geojson').GeoJSON>>;
};

export type TraverseOptions = {
  allowUndefinedReturn: boolean;
};

export function identifyResource(resource: any, typeHint?: string): string {
  if (typeof resource === 'undefined' || resource === null) {
    throw new Error('Null or undefined is not a valid entity.');
  }
  if (Array.isArray(resource)) {
    throw new Error('Array is not a valid entity');
  }
  if (typeof resource !== 'object') {
    if (typeHint) {
      return typeHint;
    }
    throw new Error(`${typeof resource} is not a valid entity`);
  }

  if (typeof resource!.type === 'string') {
    const hasType = types.indexOf(resource.type);
    if (hasType !== -1) {
      return types[hasType]!;
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
      specificResource: [],
      geoJson: [],
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
      geoJson: [traversal],
      specificResource: [traversal],
      agent: [traversal],
    });
  }

  traverseDescriptive<T extends Partial<DescriptiveProperties>>(resource: T): T {
    if (resource.thumbnail) {
      resource.thumbnail = ensureArray(resource.thumbnail).map((thumbnail) =>
        this.traverseType(thumbnail, { parent: resource }, this.traversals.contentResource)
      );
    }
    if (resource.provider) {
      resource.provider = resource.provider.map((agent) => this.traverseAgent(agent, resource));
    }
    return resource;
  }

  traverseLinking<T extends Partial<LinkingProperties>>(resource: T): T {
    if (resource.seeAlso) {
      resource.seeAlso = resource.seeAlso.map((content) =>
        this.traverseType(content, { parent: resource }, this.traversals.contentResource)
      );
    }
    if (resource.service) {
      resource.service = ensureArray(resource.service).map((service) => this.traverseService(service));
    }
    if (resource.services) {
      resource.services = ensureArray(resource.services).map((service) => this.traverseService(service, resource));
    }
    if (resource.logo) {
      resource.logo = resource.logo.map((content) =>
        this.traverseType(content, { parent: resource }, this.traversals.contentResource)
      );
    }
    if (resource.homepage) {
      resource.homepage = ensureArray(resource.homepage).map((homepage) =>
        this.traverseType(homepage, { parent: resource }, this.traversals.contentResource)
      );
    }
    if (resource.partOf) {
      // Array<ContentResource | Canvas | AnnotationCollection>
      (resource as any).partOf = resource.partOf.map((partOf) => {
        if (typeof partOf === 'string' || !partOf.type) {
          return this.traverseType(partOf as ContentResource, { parent: resource }, this.traversals.contentResource);
        }
        if (partOf.type === 'Canvas') {
          return this.traverseType(partOf as Canvas, { parent: resource }, this.traversals.canvas);
        }
        if (partOf.type === 'AnnotationCollection') {
          return this.traverseType(
            partOf as AnnotationCollection,
            { parent: resource },
            this.traversals.annotationCollection
          );
        }
        if (partOf.type === 'Collection') {
          return this.traverseType(partOf as Collection, { parent: resource }, this.traversals.collection);
        }
        return this.traverseType(partOf as ContentResource, { parent: resource }, this.traversals.contentResource);
      });
    }
    if (resource.start) {
      if (isSpecificResource(resource.start)) {
        resource.start = this.traverseSpecificResource(resource.start, 'Canvas', resource) as any;
      } else {
        // The spec says this can be a "partial canvas" causing errors with the types.
        resource.start = this.traverseType(resource.start as any, { parent: resource }, this.traversals.canvas);
      }
    }
    if (resource.rendering) {
      resource.rendering = resource.rendering.map((content) =>
        this.traverseType(content, { parent: resource }, this.traversals.contentResource)
      );
    }
    if (resource.supplementary) {
      resource.supplementary = resource.supplementary.map((content) =>
        this.traverseType(content, { parent: resource }, this.traversals.contentResource)
      );
    }

    return resource;
  }

  traverseCollectionItems<T extends StructuralProperties<any>>(collection: T): T {
    if (collection.items) {
      collection.items.map((collectionOrManifest: Manifest | Collection) => {
        if (collectionOrManifest.type === 'Collection') {
          return this.traverseCollection(collectionOrManifest as Collection);
        }
        return this.traverseManifest(collectionOrManifest as Manifest);
      });
    }

    return collection;
  }

  traverseCollection(collection: Collection, parent?: any): Collection {
    return this.traverseType<Collection>(
      this.traverseDescriptive(
        this.traverseNavPlace(
          this.traverseInlineAnnotationPages(
            this.traverseLinking(this.traverseLinkedCanvases(this.traverseCollectionItems(collection as any)))
          )
        )
      ),
      { parent },
      this.traversals.collection
    );
  }

  traverseGeoJson(geoJson: import('geojson').GeoJSON, parent?: any): import('geojson').GeoJSON {
    return this.traverseType<import('geojson').GeoJSON>(geoJson, { parent }, this.traversals.geoJson);
  }

  traverseNavPlace(resource: any /*NavPlaceExtension*/) {
    if (resource.navPlace) {
      resource.navPlace = this.traverseGeoJson(resource.navPlace, resource);
    }
    return resource;
  }

  traverseManifestItems(manifest: Manifest): Manifest {
    if (manifest.items) {
      manifest.items = manifest.items.map((canvas) => this.traverseCanvas(canvas));
    }
    return manifest;
  }

  traverseManifestStructures(manifest: Manifest): Manifest {
    if (manifest.structures) {
      manifest.structures = manifest.structures.map((range) => this.traverseRange(range));
    }
    return manifest;
  }

  _traverseManifest: (manifest: Manifest) => Manifest = compose<Manifest>(
    this.traverseManifestItems.bind(this),
    this.traverseNavPlace.bind(this),
    this.traverseLinking.bind(this),
    this.traverseDescriptive.bind(this),
    this.traverseLinkedCanvases.bind(this),
    this.traverseManifestStructures.bind(this),
    this.traverseInlineAnnotationPages.bind(this),
  );

  traverseManifest(manifest: Manifest, parent?: any): Manifest {
    return this.traverseType<Manifest>(this._traverseManifest(manifest), { parent }, this.traversals.manifest);
  }

  traverseCanvasItems(canvas: Canvas): Canvas {
    canvas.items = (canvas.items || []).map((annotationPage: AnnotationPage): AnnotationPage => {
      return this.traverseAnnotationPage(annotationPage, canvas);
    });

    return canvas;
  }

  traverseInlineAnnotationPages<T extends Manifest | Canvas | Range | string>(resource: T): T {
    if (typeof resource === 'string' || !resource) {
      return resource;
    }
    if (resource.annotations) {
      resource.annotations = resource.annotations.map((annotationPage: AnnotationPage): AnnotationPage => {
        return this.traverseAnnotationPage(annotationPage, resource);
      });
    }

    return resource;
  }

  _traverseCanvas: (canvas: Canvas) => Canvas = compose<Canvas>(
    this.traverseCanvasItems.bind(this),
    this.traverseLinking.bind(this),
    this.traverseDescriptive.bind(this),
    this.traverseLinkedCanvases.bind(this),
    this.traverseInlineAnnotationPages.bind(this)
  );

  traverseCanvas(canvas: Canvas, parent?: any): Canvas {
    return this.traverseType<Canvas>(this._traverseCanvas(canvas), { parent }, this.traversals.canvas);
  }

  traverseAnnotationPageItems(annotationPage: AnnotationPage): AnnotationPage {
    if (annotationPage.items) {
      annotationPage.items = annotationPage.items.map((annotation: Annotation): Annotation => {
        return this.traverseAnnotation(annotation, annotationPage);
      });
    }
    return annotationPage;
  }

  _traverseAnnotationPage: (page: AnnotationPage) => AnnotationPage = compose<AnnotationPage>(
    this.traverseAnnotationPageItems.bind(this),
    this.traverseLinking.bind(this),
    this.traverseDescriptive.bind(this)
  );

  traverseAnnotationPage(annotationPageJson: AnnotationPage, parent?: any): AnnotationPage {
    return this.traverseType<AnnotationPage>(
      this._traverseAnnotationPage(annotationPageJson),
      { parent },
      this.traversals.annotationPage
    );
  }

  // Disabling these.

  traverseAnnotationBody(annotation: Annotation): Annotation {
    if (Array.isArray(annotation.body)) {
      annotation.body = annotation.body.map((annotationBody: any): ContentResource => {
        return this.traverseContentResource(annotationBody, annotation);
      });
    } else if (annotation.body) {
      annotation.body = this.traverseContentResource(annotation.body as ContentResource, annotation);
    }

    return annotation;
  }

  traverseLinkedCanvases<T extends { placeholderCanvas?: any; accompanyingCanvas?: any }>(json: T): T {
    if (json.placeholderCanvas) {
      json.placeholderCanvas = this.traverseCanvas(json.placeholderCanvas);
    }

    if (json.accompanyingCanvas) {
      json.accompanyingCanvas = this.traverseCanvas(json.accompanyingCanvas);
    }

    return json;
  }

  // @todo traverseAnnotationSelector
  traverseAnnotation(annotationJson: Annotation, parent?: any): Annotation {
    return this.traverseType<Annotation>(
      this.traverseLinking(this.traverseAnnotationBody(this.traverseDescriptive(annotationJson as any))),
      { parent },
      this.traversals.annotation
    );
  }

  traverseContentResourceLinking(contentResourceJson: ContentResource): ContentResource {
    if (typeof contentResourceJson === 'string' || !contentResourceJson) {
      return contentResourceJson;
    }
    if (contentResourceJson && (contentResourceJson as IIIFExternalWebResource)!.service) {
      (contentResourceJson as IIIFExternalWebResource).service = ensureArray(
        (contentResourceJson as IIIFExternalWebResource).service || []
      ).map((service) => this.traverseService(service, contentResourceJson));
    }

    return contentResourceJson;
  }

  traverseContentResource(contentResourceJson: ContentResource, parent?: any): ContentResource {
    if ((contentResourceJson as any).type === 'Choice') {
      (contentResourceJson as any).items = (contentResourceJson as any).items.map((choiceItem: ContentResource) => {
        return this.traverseContentResource(choiceItem, contentResourceJson);
      });
    }

    if (isSpecificResource(contentResourceJson)) {
      return this.traverseSpecificResource(contentResourceJson, 'ContentResource');
    }

    return this.traverseType<ContentResource>(
      // This needs an `any` because of the scope of W3C annotation bodies (covered by ContentResource).
      // ContentResources are permitted to have a `.annotations` property, so we can pass it as any  for this
      // case.
      this.traverseInlineAnnotationPages(this.traverseContentResourceLinking(contentResourceJson) as any),
      { parent },
      this.traversals.contentResource
    );
  }

  traverseSpecificResource(specificResource: SpecificResource, typeHint?: string, parent?: any): SpecificResource {
    let source = specificResource.source;
    if (typeof specificResource.source === 'string') {
      source = { id: specificResource.source, type: typeHint || 'unknown' };
    }

    return this.traverseType<SpecificResource>(
      {
        ...specificResource,
        source:
          typeHint === 'Canvas' || source.type === 'Canvas'
            ? this.traverseType(source, { parent }, this.traversals.canvas)
            : typeHint === 'ContentResource'
              ? this.traverseContentResource(source, { parent })
              : this.traverseUnknown(source, { parent, typeHint }),
      },
      { parent },
      this.traversals.specificResource
    );
  }

  traverseRangeRanges(range: Range): Range {
    if (range.items) {
      range.items = range.items.map((rangeOrManifest: RangeItems) => {
        if (typeof rangeOrManifest === 'string') {
          return this.traverseCanvas({ id: rangeOrManifest, type: 'Canvas' }, range);
        }
        if (isSpecificResource(rangeOrManifest)) {
          return this.traverseSpecificResource(rangeOrManifest, 'Canvas', range);
        }
        // This is a non-standard case.
        if ((rangeOrManifest as any).type === 'Manifest') {
          return this.traverseManifest(rangeOrManifest as any, range) as any as RangeItems;
        }
        return this.traverseRange(rangeOrManifest as Range, range);
      });
    }

    return range;
  }

  _traverseRange: (range: Range) => Range = compose<Range>(
    this.traverseRangeRanges.bind(this),
    this.traverseLinking.bind(this),
    this.traverseDescriptive.bind(this),
    this.traverseLinkedCanvases.bind(this)
  );

  traverseRange(range: Range, parent?: any): Range {
    return this.traverseType<Range>(this._traverseRange(range), { parent }, this.traversals.range);
  }

  traverseAgent(agent: ResourceProvider, parent?: any) {
    return this.traverseType<ResourceProvider>(
      this.traverseDescriptive(this.traverseLinking(agent)),
      { parent },
      this.traversals.agent
    );
  }

  traverseType<T>(object: T, context: TraversalContext, traversals: Array<Traversal<T>>): T {
    return traversals.reduce((acc: T, traversal: Traversal<T>): T => {
      const returnValue = traversal(acc, context);
      if (typeof returnValue === 'undefined' && !this.options.allowUndefinedReturn) {
        return acc;
      }
      return returnValue;
    }, object);
  }

  traverseService(service: Service, parent?: any): Service {
    const _service: any = Object.assign({}, service);
    if (_service && _service.service) {
      _service.service = ensureArray(_service.service).map((innerService: any) => this.traverseService(innerService));
    }
    return this.traverseType<Service>(_service, { parent }, this.traversals.service);
  }

  traverseUnknown(
    resource: any,
    { parent, typeHint }: { typeHint?: string; parent?: any } = {}
  ):
    | Collection
    | Manifest
    | Canvas
    | AnnotationPage
    | Annotation
    | ContentResource
    | Range
    | Service
    | ResourceProvider {
    const type = identifyResource(resource, typeHint);

    switch (type) {
      case 'Collection':
        return this.traverseCollection(resource as Collection, parent);
      case 'Manifest':
        return this.traverseManifest(resource as Manifest, parent);
      case 'Canvas':
        return this.traverseCanvas(resource as Canvas, parent);
      case 'AnnotationPage':
        return this.traverseAnnotationPage(resource as AnnotationPage, parent);
      case 'Annotation':
        return this.traverseAnnotation(resource as Annotation, parent);
      case 'ContentResource':
        return this.traverseContentResource(resource as ContentResource, parent);
      case 'Range':
        return this.traverseRange(resource as Range, parent);
      case 'Service':
        return this.traverseService(resource as Service, parent);
      case 'Agent':
        return this.traverseAgent(resource as ResourceProvider, parent);
      default: {
        throw new Error(`Unknown or unsupported resource type of ${type}`);
      }
    }
  }
}
