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
} from '@iiif/presentation-3';
import { isSpecificResource } from '../shared/is-specific-resource';
import { ensureArray } from '../shared/ensure-array';

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

  traverseDescriptive<T extends Partial<DescriptiveProperties>>(resource: T) {
    if (resource.thumbnail) {
      resource.thumbnail = resource.thumbnail.map((thumbnail) =>
        this.traverseType(thumbnail, this.traversals.contentResource)
      );
    }
    if (resource.provider) {
      resource.provider = resource.provider.map((agent) => this.traverseAgent(agent));
    }
    return resource;
  }

  traverseLinking<T extends Partial<LinkingProperties>>(resource: T) {
    if (resource.seeAlso) {
      resource.seeAlso = resource.seeAlso.map((content) => this.traverseType(content, this.traversals.contentResource));
    }
    if (resource.service) {
      resource.service = ensureArray(resource.service).map((service) => this.traverseService(service));
    }
    if (resource.services) {
      resource.services = resource.services.map((service) => this.traverseService(service));
    }
    if (resource.logo) {
      resource.logo = resource.logo.map((content) => this.traverseType(content, this.traversals.contentResource));
    }
    if (resource.homepage) {
      resource.homepage = resource.homepage.map((homepage) =>
        this.traverseType(homepage, this.traversals.contentResource)
      );
    }
    if (resource.partOf) {
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
      if (isSpecificResource(resource.start)) {
        resource.start = this.traverseSpecificResource(resource.start, 'Canvas') as any;
      } else {
        resource.start = this.traverseType(resource.start, this.traversals.canvas);
      }
    }
    if (resource.rendering) {
      resource.rendering = resource.rendering.map((content) =>
        this.traverseType(content, this.traversals.contentResource)
      );
    }
    if (resource.supplementary) {
      resource.supplementary = resource.supplementary.map((content) =>
        this.traverseType(content, this.traversals.contentResource)
      );
    }

    return resource;
  }

  traverseCollectionItems(collection: Collection): Collection {
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

  traverseCollection(collection: Collection): Collection {
    return this.traverseType<Collection>(
      this.traverseDescriptive(
        this.traverseInlineAnnotationPages(
          this.traverseLinking(this.traverseLinkedCanvases(this.traverseCollectionItems(collection)))
        )
      ),
      this.traversals.collection
    );
  }

  traverseGeoJson(geoJson: import('geojson').GeoJSON): import('geojson').GeoJSON {
    return this.traverseType<import('geojson').GeoJSON>(geoJson, this.traversals.geoJson);
  }

  traverseNavPlace(resource: any /*NavPlaceExtension*/) {
    if (resource.navPlace) {
      resource.navPlace = this.traverseGeoJson(resource.navPlace);
    }
    return resource.navPlace;
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

  traverseManifest(manifest: Manifest): Manifest {
    return this.traverseType<Manifest>(
      this.traverseInlineAnnotationPages(
        this.traverseManifestStructures(
          this.traverseLinkedCanvases(
            this.traverseDescriptive(this.traverseLinking(this.traverseManifestItems(manifest)))
          )
        )
      ),
      this.traversals.manifest
    );
  }

  traverseCanvasItems(canvas: Canvas): Canvas {
    canvas.items = (canvas.items || []).map((annotationPage: AnnotationPage): AnnotationPage => {
      return this.traverseAnnotationPage(annotationPage);
    });

    return canvas;
  }

  traverseInlineAnnotationPages<T extends Manifest | Canvas | Range | string>(resource: T): T {
    if (typeof resource === 'string' || !resource) {
      return resource;
    }
    if (resource.annotations) {
      resource.annotations = resource.annotations.map((annotationPage: AnnotationPage): AnnotationPage => {
        return this.traverseAnnotationPage(annotationPage);
      });
    }

    return resource;
  }

  traverseCanvas(canvas: Canvas): Canvas {
    return this.traverseType<Canvas>(
      this.traverseInlineAnnotationPages(
        this.traverseLinkedCanvases(this.traverseDescriptive(this.traverseLinking(this.traverseCanvasItems(canvas))))
      ),
      this.traversals.canvas
    );
  }

  traverseAnnotationPageItems(annotationPage: AnnotationPage): AnnotationPage {
    if (annotationPage.items) {
      annotationPage.items = annotationPage.items.map((annotation: Annotation): Annotation => {
        return this.traverseAnnotation(annotation);
      });
    }
    return annotationPage;
  }

  traverseAnnotationPage(annotationPageJson: AnnotationPage): AnnotationPage {
    return this.traverseType<AnnotationPage>(
      this.traverseDescriptive(this.traverseLinking(this.traverseAnnotationPageItems(annotationPageJson) as any)),
      this.traversals.annotationPage
    );
  }

  // Disabling these.

  traverseAnnotationBody(annotation: Annotation): Annotation {
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

  traverseLinkedCanvases<T extends Collection | Manifest | Canvas | Range>(json: T): T {
    if (json.placeholderCanvas) {
      json.placeholderCanvas = this.traverseCanvas(json.placeholderCanvas);
    }

    if (json.accompanyingCanvas) {
      json.accompanyingCanvas = this.traverseCanvas(json.accompanyingCanvas);
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

  traverseContentResourceLinking(contentResourceJson: ContentResource): ContentResource {
    if (typeof contentResourceJson === 'string' || !contentResourceJson) {
      return contentResourceJson;
    }
    if (contentResourceJson && (contentResourceJson as IIIFExternalWebResource)!.service) {
      (contentResourceJson as IIIFExternalWebResource).service = ensureArray(
        (contentResourceJson as IIIFExternalWebResource).service || []
      ).map((service) => this.traverseService(service));
    }

    return contentResourceJson;
  }

  traverseContentResource(contentResourceJson: ContentResource): ContentResource {
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

  traverseSpecificResource(specificResource: SpecificResource, typeHint?: string): SpecificResource {
    let source = specificResource.source;
    if (typeof specificResource.source === 'string') {
      source = { id: specificResource.source, type: typeHint || 'unknown' };
    }

    return this.traverseType<SpecificResource>(
      {
        ...specificResource,
        source:
          typeHint === 'Canvas' || source.type === 'Canvas'
            ? this.traverseType(source, this.traversals.canvas)
            : this.traverseUnknown(source, typeHint),
      },
      this.traversals.specificResource
    );
  }

  traverseRangeRanges(range: Range): Range {
    if (range.items) {
      range.items = range.items.map((rangeOrManifest: RangeItems) => {
        if (typeof rangeOrManifest === 'string') {
          return this.traverseCanvas({ id: rangeOrManifest, type: 'Canvas' });
        }
        if (isSpecificResource(rangeOrManifest)) {
          return this.traverseSpecificResource(rangeOrManifest, 'Canvas');
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
      this.traverseLinkedCanvases(this.traverseDescriptive(this.traverseLinking(this.traverseRangeRanges(range)))),
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
    const _service: any = Object.assign({}, service);
    if (_service && _service.service) {
      _service.service = _service.service.map((innerService: any) => this.traverseService(innerService));
    }
    return this.traverseType<Service>(_service, this.traversals.service);
  }

  traverseUnknown(resource: any, typeHint?: string) {
    const type = identifyResource(resource, typeHint);

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
      default: {
        if (typeHint) {
          return typeHint;
        }
        throw new Error(`Unknown or unsupported resource type of ${type}`);
      }
    }
  }
}
