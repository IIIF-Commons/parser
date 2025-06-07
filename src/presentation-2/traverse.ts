import {
  Annotation,
  AnnotationList,
  Canvas,
  ChoiceEmbeddedContent,
  Collection,
  CommonContentResource,
  ContentResource,
  DescriptiveProperties,
  Layer,
  LinkingProperties,
  Manifest,
  OneOrMany,
  Range,
  RightsProperties,
  Sequence,
  Service,
  TraversableEntityTypes,
  Traversal,
  TraversalMap,
} from '@iiif/presentation-2';

export const types: TraversableEntityTypes[] = [
  'sc:Collection',
  'sc:Manifest',
  'sc:Canvas',
  'sc:AnnotationList',
  'oa:Annotation',
  'sc:Range',
  'sc:Layer',
  'sc:Sequence',
  'oa:Choice',
  // Opaque.
  'Service',
  'ContentResource',
];

export type TraverseOptions = {
  convertPropsToArray: boolean;
  mergeMemberProperties: boolean;
  allowUndefinedReturn: boolean;
};

export function identifyResource(resource: any): TraversableEntityTypes {
  if (typeof resource === 'undefined' || resource === null) {
    throw new Error('Null or undefined is not a valid entity.');
  }
  if (Array.isArray(resource)) {
    throw new Error('Array is not a valid entity');
  }
  if (typeof resource !== 'object') {
    throw new Error(`${typeof resource} is not a valid entity`);
  }

  if (typeof resource['@type'] === 'string') {
    const hasType = types.indexOf(resource['@type'] as any);
    if (hasType !== -1) {
      return types[hasType]!;
    }
  }

  if (resource.profile) {
    return 'Service';
  }

  if (resource.format) {
    return 'ContentResource';
  }

  // Big o'l fallback.
  if (resource['@type']) {
    return 'ContentResource';
  }

  throw new Error('Resource type is not known');
}

export class Traverse<
  T extends {
    Collection: any;
    Manifest: any;
    Canvas: any;
    AnnotationList: any;
    Sequence: any;
    Annotation: any;
    ContentResource: any;
    Choice: any;
    Range: any;
    Service: any;
    Layer: any;
  } = {
    Collection: Collection;
    Manifest: Manifest;
    Canvas: Canvas;
    AnnotationList: AnnotationList;
    Sequence: Sequence;
    Annotation: Annotation;
    ContentResource: CommonContentResource;
    Choice: ChoiceEmbeddedContent;
    Range: Range;
    Service: Service;
    Layer: Layer;
  },
> {
  private traversals: Required<TraversalMap>;
  private options: TraverseOptions;

  constructor(traversals: Partial<TraversalMap>, options: Partial<TraverseOptions> = {}) {
    this.traversals = {
      collection: [],
      manifest: [],
      canvas: [],
      annotationList: [],
      sequence: [],
      annotation: [],
      contentResource: [],
      choice: [],
      range: [],
      service: [],
      layer: [],
      ...traversals,
    };
    this.options = {
      convertPropsToArray: true,
      mergeMemberProperties: true,
      allowUndefinedReturn: false,
      ...options,
    };
  }

  static all(traversal: (resource: any) => any) {
    return new Traverse({
      collection: [traversal],
      manifest: [traversal],
      canvas: [traversal],
      annotationList: [traversal],
      sequence: [traversal],
      annotation: [traversal],
      contentResource: [traversal],
      choice: [traversal],
      range: [traversal],
      service: [traversal],
      layer: [traversal],
    });
  }

  traverseCollection(collection: Collection): T['Collection'] {
    return this.traverseType(
      this.traverseDescriptive(this.traverseLinking(this.traverseCollectionItems(collection))),
      this.traversals.collection
    );
  }

  traverseCollectionItems(collection: Collection): Collection {
    if (this.options.mergeMemberProperties) {
      const members = [
        ...(collection.manifests || []).map((manifest) => {
          if (typeof manifest === 'string') {
            return { '@id': manifest, '@type': 'sc:Manifest' };
          }
          return manifest;
        }),
        ...(collection.collections || []).map((subCollection) => {
          if (typeof subCollection === 'string') {
            return { '@id': subCollection, '@type': 'sc:Collection' };
          }
          return subCollection;
        }),
        ...(collection.members || []),
      ];

      const seenIds: string[] = [];
      const filteredMembers = members.filter(resource => {
        if (seenIds.includes(resource['@id'])) {
          return false;
        }
        seenIds.push(resource['@id']);
        return true;
      });

      delete collection.collections;
      delete collection.manifests;
      collection.members = filteredMembers;
    }

    if (collection.manifests) {
      collection.manifests = collection.manifests.map((manifest) =>
        this.traverseManifest(
          typeof manifest === 'string'
            ? ({ '@id': manifest, '@type': 'sc:Manifest' } as Manifest)
            : (manifest as Manifest)
        )
      );
    }

    if (collection.collections) {
      collection.collections = collection.collections.map((subCollection) =>
        this.traverseCollection(
          typeof subCollection === 'string'
            ? ({ '@id': subCollection, '@type': 'sc:Collection' } as Collection)
            : (subCollection as Collection)
        )
      );
    }

    if (collection.members) {
      collection.members = collection.members.map((member) => {
        if (typeof member === 'string') {
          return member;
        }
        if (member['@type'] === 'sc:Collection') {
          return this.traverseCollection(member);
        }
        if (member['@type'] === 'sc:Manifest') {
          return this.traverseManifest(member as any);
        }
        return this.traverseUnknown(member);
      });
    }

    return collection;
  }

  traverseManifest(manifest: Manifest): T['Manifest'] {
    return this.traverseType(
      this.traverseDescriptive(this.traverseLinking(this.traverseManifestItems(manifest))),
      this.traversals.manifest
    );
  }

  traverseManifestItems(manifest: Manifest): Manifest {
    if (manifest.sequences) {
      manifest.sequences = manifest.sequences.map((sequence) => this.traverseSequence(sequence));
    }
    if (manifest.structures) {
      manifest.structures = manifest.structures.map((structure) => this.traverseRange(structure));
    }
    return manifest;
  }

  traverseSequence(sequence: Sequence): T['Sequence'] {
    return this.traverseType(
      this.traverseDescriptive(this.traverseLinking(this.traverseSequenceItems(sequence))),
      this.traversals.sequence
    );
  }

  traverseSequenceItems(sequence: Sequence): Sequence {
    if (sequence.canvases) {
      sequence.canvases = sequence.canvases.map((canvas) => this.traverseCanvas(canvas));
    }
    return sequence;
  }

  traverseCanvas(canvas: Canvas): T['Canvas'] {
    return this.traverseType(
      this.traverseDescriptive(this.traverseLinking(this.traverseCanvasItems(canvas))),
      this.traversals.canvas
    );
  }

  traverseCanvasItems(canvas: Canvas): Canvas {
    if (canvas.images) {
      canvas.images = canvas.images.map((image) => this.traverseAnnotation(image));
    }
    if (canvas.otherContent) {
      canvas.otherContent = canvas.otherContent.map((annotationList) => this.traverseAnnotationList(annotationList));
    }
    return canvas;
  }

  traverseRange(range: Range): T['Range'] {
    return this.traverseType(
      this.traverseDescriptive(this.traverseLinking(this.traverseRangeItems(range))),
      this.traversals.range
    );
  }

  traverseRangeItems(range: Range): Range {
    if (this.options.mergeMemberProperties) {
      const members = [
        ...(range.ranges || []).map((innerRange: any) => {
          if (typeof innerRange === 'string') {
            return { '@id': innerRange, '@type': 'sc:Range' };
          }
          return innerRange;
        }),
        ...(range.canvases || []).map((canvas: any) => {
          if (typeof canvas === 'string') {
            return { '@id': canvas, '@type': 'sc:Canvas' };
          }
          return canvas;
        }),
        ...(range.members || []),
      ];

      delete range.ranges;
      delete range.canvases;
      range.members = members.length ? members.map((member) => this.traverseUnknown(member)) : undefined;
    }
    return range;
  }

  traverseAnnotationList(annotationList: AnnotationList): T['AnnotationList'] {
    const list =
      typeof annotationList === 'string'
        ? ({ '@id': annotationList, '@type': 'sc:AnnotationList' } as any)
        : annotationList;

    return this.traverseType(
      this.traverseDescriptive(this.traverseAnnotationListItems(list)),
      this.traversals.annotationList
    );
  }

  traverseAnnotationListItems(annotationList: AnnotationList): AnnotationList {
    if (annotationList.resources) {
      annotationList.resources = annotationList.resources.map((annotation) => this.traverseAnnotation(annotation));
    }

    return annotationList;
  }

  traverseAnnotation(annotation: Annotation): T['Annotation'] {
    return this.traverseType(
      this.traverseDescriptive(this.traverseLinking(this.traverseAnnotationItems(annotation))),
      this.traversals.annotation
    );
  }

  traverseAnnotationItems(annotation: Annotation): Annotation {
    if (annotation.resource) {
      if (Array.isArray(annotation.resource)) {
        annotation.resource = annotation.resource.map((res) =>
          this.traverseContentResource(res as CommonContentResource)
        );
      } else {
        annotation.resource = this.traverseContentResource(annotation.resource as CommonContentResource);
      }
    }

    if (annotation.on) {
      // selector - just traverse the annotations.
      // annotation.on = this.traverseSelector(annotation.on);
    }

    return annotation;
  }

  traverseLayer(layer: Layer): T['Layer'] {
    return this.traverseType(this.traverseLinking(this.traverseLayerItems(layer)), this.traversals.layer);
  }

  traverseLayerItems(layer: Layer): Layer {
    if (layer.otherContent) {
      layer.otherContent = layer.otherContent.map((annotationList) => this.traverseAnnotationList(annotationList));
    }
    return layer;
  }

  traverseChoice(choice: ChoiceEmbeddedContent): T['Choice'] {
    return this.traverseType(this.traverseChoiceItems(choice), this.traversals.choice);
  }

  traverseChoiceItems(choice: ChoiceEmbeddedContent) {
    if (choice.default && choice.default !== 'rdf:nil') {
      choice.default = this.traverseContentResource(choice.default);
    }
    if (choice.item && choice.item !== 'rdf:nil') {
      choice.item = choice.item.map((item) => this.traverseContentResource(item));
    }

    return choice;
  }

  traverseService(service: Service): T['Service'] {
    return this.traverseType(this.traverseLinking(service as any), this.traversals.service);
  }

  traverseContentResource(contentResource: CommonContentResource): T['ContentResource'] {
    if (contentResource['@type'] === 'oa:Choice') {
      return this.traverseChoice(contentResource as any);
    }

    return this.traverseType(
      this.traverseDescriptive(this.traverseLinking(contentResource as any)),
      this.traversals.contentResource
    );
  }

  traverseUnknown(item: any) {
    if (!item['@type'] || typeof item === 'string') {
      // Unknown item.
      return item;
    }
    switch (identifyResource(item)) {
      case 'sc:Collection':
        return this.traverseCollection(item);
      case 'sc:Manifest':
        return this.traverseManifest(item);
      case 'sc:Canvas':
        return this.traverseCanvas(item);
      case 'sc:Sequence':
        return this.traverseSequence(item);
      case 'sc:Range':
        return this.traverseRange(item);
      case 'oa:Annotation':
        return this.traverseAnnotation(item);
      case 'sc:AnnotationList':
        return this.traverseAnnotationList(item);
      case 'sc:Layer':
        return this.traverseLayer(item);
      case 'Service':
        return this.traverseService(item);
      case 'oa:Choice':
        return this.traverseChoice(item);
      case 'ContentResource':
        return this.traverseContentResource(item);
    }

    if (item.profile) {
      return this.traverseService(item);
    }

    return item;
  }

  traverseImageResource(contentResource: OneOrMany<string | ContentResource>) {
    const wasArray = Array.isArray(contentResource);
    const resourceList = Array.isArray(contentResource) ? contentResource : [contentResource];
    const newResourceList: any[] = [];

    for (const singleResource of resourceList) {
      if (typeof singleResource === 'string') {
        newResourceList.push(
          this.traverseContentResource({
            '@id': singleResource,
            '@type': 'dctypes:Image',
          })
        );
      } else {
        newResourceList.push(this.traverseContentResource(singleResource as any));
      }
    }

    if (!wasArray && !this.options.convertPropsToArray) {
      return newResourceList[0];
    }

    return newResourceList;
  }

  traverseDescriptive<T extends Partial<DescriptiveProperties & RightsProperties>>(resource: T) {
    if (resource.thumbnail) {
      resource.thumbnail = this.traverseImageResource(resource.thumbnail);
    }

    if (resource.logo) {
      resource.logo = this.traverseImageResource(resource.logo);
    }

    return resource;
  }

  traverseOneOrMoreServices(allServices: OneOrMany<any>) {
    const wasArray = Array.isArray(allServices);
    const services = Array.isArray(allServices) ? allServices : [allServices];
    const newServices = [];
    for (const service of services) {
      newServices.push(this.traverseService(service));
    }

    if (!wasArray && !this.options.convertPropsToArray) {
      return newServices[0];
    }

    return newServices;
  }

  traverseLinking<T extends Partial<LinkingProperties>>(resource: T) {
    if (resource.related) {
      resource.related = this.traverseOneOrManyType(resource.related, this.traversals.contentResource);
    }
    if (resource.rendering) {
      resource.rendering = this.traverseOneOrManyType(resource.rendering, this.traversals.contentResource);
    }
    if (resource.service) {
      resource.service = this.traverseOneOrMoreServices(resource.service);
    }
    if (resource.seeAlso) {
      resource.seeAlso = this.traverseOneOrManyType(resource.seeAlso, this.traversals.contentResource);
    }
    if (resource.within) {
      if (typeof resource.within === 'string') {
        // I don't know. skip?
      } else {
        resource.within = this.traverseOneOrManyType(
          resource.within as CommonContentResource,
          this.traversals.contentResource
        );
      }
    }
    if (resource.startCanvas) {
      if (typeof resource.startCanvas === 'string') {
        resource.startCanvas = this.traverseType(
          { '@id': resource.startCanvas, '@type': 'sc:Canvas' } as Canvas,
          this.traversals.canvas
        );
      } else if (resource.startCanvas) {
        this.traverseType(resource.startCanvas as any, this.traversals.canvas);
      }
    }
    if (resource.contentLayer) {
      if (typeof resource.contentLayer === 'string') {
        resource.contentLayer = this.traverseLayer({
          '@id': resource.contentLayer,
          '@type': 'sc:Layer',
        });
      } else {
        resource.contentLayer = this.traverseLayer(resource.contentLayer);
      }
    }
    return resource;
  }

  traverseOneOrManyType<T, Return = T>(object: T | T[], traversals: Array<Traversal<T>>): Return {
    if (!Array.isArray(object)) {
      if (this.options.convertPropsToArray) {
        object = [object] as T[];
      } else {
        return this.traverseType(object, traversals);
      }
    }
    return object.map((singleObj) => this.traverseType(singleObj, traversals)) as any;
  }

  traverseType<T, Return = T>(object: T, traversals: Array<Traversal<T>>): Return {
    return traversals.reduce((acc: T, traversal: Traversal<T>): T => {
      const returnValue = traversal(acc);
      if (typeof returnValue === 'undefined' && !this.options.allowUndefinedReturn) {
        return acc;
      }
      return returnValue;
    }, object) as any;
  }
}
