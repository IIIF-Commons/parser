import { compose } from '../shared/compose';
import { ensureArray } from '../shared/ensure-array';
import {
  annotationTypes,
  containerTypes,
  getType,
  identifyResourceType,
  isQuantity,
  isSelector,
  isSpecificResource,
  sceneComponentTypes,
  structuralTypes,
} from './utilities';

export type TraversalContext = {
  parent?: any;
  path: string;
  typeHint?: string;
};

export type Traversal<T = any> = (resource: T, context: TraversalContext) => T | void;

export type TraversalMap = {
  collection?: Array<Traversal>;
  manifest?: Array<Traversal>;
  timeline?: Array<Traversal>;
  canvas?: Array<Traversal>;
  scene?: Array<Traversal>;
  annotationCollection?: Array<Traversal>;
  annotationPage?: Array<Traversal>;
  annotation?: Array<Traversal>;
  contentResource?: Array<Traversal>;
  range?: Array<Traversal>;
  service?: Array<Traversal>;
  agent?: Array<Traversal>;
  specificResource?: Array<Traversal>;
  selector?: Array<Traversal>;
  quantity?: Array<Traversal>;
  transform?: Array<Traversal>;
};

export type TraverseOptions = {
  allowUndefinedReturn: boolean;
};

type UnknownTraversalArgs = {
  parent?: any;
  path: string;
  typeHint?: string;
};

const linkedResourceKeys = [
  'thumbnail',
  'homepage',
  'rendering',
  'seeAlso',
  'supplementary',
  'logo',
] as const;

const linkedObjectKeys = ['placeholderContainer', 'accompanyingContainer', 'start'] as const;

function isResourceReference(resource: any): boolean {
  if (!resource || typeof resource !== 'object' || Array.isArray(resource)) {
    return false;
  }
  if (typeof resource.id !== 'string' || typeof resource.type !== 'string') {
    return false;
  }
  if (resource.type === 'SpecificResource') {
    return false;
  }
  return Object.keys(resource).every((key) => key === 'id' || key === 'type');
}

export class Traverse {
  private traversals: Required<TraversalMap>;
  private options: TraverseOptions;

  constructor(traversals: TraversalMap = {}, options: Partial<TraverseOptions> = {}) {
    this.traversals = {
      collection: [],
      manifest: [],
      timeline: [],
      canvas: [],
      scene: [],
      annotationCollection: [],
      annotationPage: [],
      annotation: [],
      contentResource: [],
      range: [],
      service: [],
      agent: [],
      specificResource: [],
      selector: [],
      quantity: [],
      transform: [],
      ...traversals,
    };
    this.options = {
      allowUndefinedReturn: false,
      ...options,
    };
  }

  static all(traversal: Traversal) {
    return new Traverse({
      collection: [traversal],
      manifest: [traversal],
      timeline: [traversal],
      canvas: [traversal],
      scene: [traversal],
      annotationCollection: [traversal],
      annotationPage: [traversal],
      annotation: [traversal],
      contentResource: [traversal],
      range: [traversal],
      service: [traversal],
      agent: [traversal],
      specificResource: [traversal],
      selector: [traversal],
      quantity: [traversal],
      transform: [traversal],
    });
  }

  private traverseLinkedResources(resource: any, path: string) {
    if (!resource || typeof resource !== 'object') {
      return resource;
    }

    for (const key of linkedResourceKeys) {
      if (resource[key]) {
        resource[key] = ensureArray(resource[key]).map((item: any, index: number) =>
          this.traverseContentResource(item, resource, `${path}.${key}[${index}]`)
        );
      }
    }

    if (resource.provider) {
      resource.provider = ensureArray(resource.provider).map((item: any, index: number) =>
        this.traverseAgent(item, resource, `${path}.provider[${index}]`)
      );
    }

    if (resource.service) {
      resource.service = ensureArray(resource.service).map((item: any, index: number) =>
        this.traverseService(item, resource, `${path}.service[${index}]`)
      );
    }

    if (resource.services) {
      resource.services = ensureArray(resource.services).map((item: any, index: number) =>
        this.traverseService(item, resource, `${path}.services[${index}]`)
      );
    }

    if (resource.partOf) {
      resource.partOf = ensureArray(resource.partOf).map((item: any, index: number) =>
        typeof item === 'string'
          ? item
          : this.traverseUnknown(item, { parent: resource, path: `${path}.partOf[${index}]` })
      );
    }

    for (const key of linkedObjectKeys) {
      if (resource[key]) {
        resource[key] = this.traverseUnknown(resource[key], {
          parent: resource,
          path: `${path}.${key}`,
        });
      }
    }

    if (resource.navPlace && typeof resource.navPlace === 'object') {
      resource.navPlace = this.traverseType(resource.navPlace, { parent: resource, path: `${path}.navPlace` }, []);
    }

    return resource;
  }

  private traverseContainerItems(container: any, path: string) {
    if (!container || typeof container !== 'object') {
      return container;
    }

    if (container.items) {
      container.items = ensureArray(container.items).map((item: any, index: number) => {
        const itemType = identifyResourceType(item);
        if (itemType === 'AnnotationPage') {
          return this.traverseAnnotationPage(item, container, `${path}.items[${index}]`);
        }
        return this.traverseUnknown(item, {
          parent: container,
          path: `${path}.items[${index}]`,
        });
      });
    }

    if (container.annotations) {
      container.annotations = ensureArray(container.annotations).map((item: any, index: number) =>
        this.traverseAnnotationPage(item, container, `${path}.annotations[${index}]`)
      );
    }

    return container;
  }

  private traverseManifestItems(manifest: any, path: string) {
    if (manifest.items) {
      manifest.items = ensureArray(manifest.items).map((item: any, index: number) =>
        this.traverseUnknown(item, {
          parent: manifest,
          path: `${path}.items[${index}]`,
        })
      );
    }
    if (manifest.structures) {
      manifest.structures = ensureArray(manifest.structures).map((item: any, index: number) =>
        this.traverseRange(item, manifest, `${path}.structures[${index}]`)
      );
    }
    return manifest;
  }

  private traverseCollectionItems(collection: any, path: string) {
    if (collection.items) {
      collection.items = ensureArray(collection.items).map((item: any, index: number) =>
        this.traverseUnknown(item, {
          parent: collection,
          path: `${path}.items[${index}]`,
        })
      );
    }
    return collection;
  }

  traverseCollection(collection: any, parent?: any, path = '$'): any {
    return this.traverseType(
      this.traverseLinkedResources(this.traverseContainerItems(this.traverseCollectionItems(collection, path), path), path),
      { parent, path },
      this.traversals.collection
    );
  }

  traverseManifest(manifest: any, parent?: any, path = '$'): any {
    const pipeline = compose<any>(
      (value: any) => this.traverseManifestItems(value, path),
      (value: any) => this.traverseContainerItems(value, path),
      (value: any) => this.traverseLinkedResources(value, path)
    );
    return this.traverseType(pipeline(manifest), { parent, path }, this.traversals.manifest);
  }

  traverseTimeline(timeline: any, parent?: any, path = '$'): any {
    return this.traverseType(
      this.traverseLinkedResources(this.traverseContainerItems(timeline, path), path),
      { parent, path },
      this.traversals.timeline
    );
  }

  traverseCanvas(canvas: any, parent?: any, path = '$'): any {
    return this.traverseType(
      this.traverseLinkedResources(this.traverseContainerItems(canvas, path), path),
      { parent, path },
      this.traversals.canvas
    );
  }

  traverseScene(scene: any, parent?: any, path = '$'): any {
    return this.traverseType(
      this.traverseLinkedResources(this.traverseContainerItems(scene, path), path),
      { parent, path },
      this.traversals.scene
    );
  }

  private traverseAnnotationItems(page: any, path: string) {
    if (page.items) {
      page.items = ensureArray(page.items).map((item: any, index: number) =>
        this.traverseAnnotation(item, page, `${path}.items[${index}]`)
      );
    }
    return page;
  }

  traverseAnnotationPage(annotationPage: any, parent?: any, path = '$'): any {
    return this.traverseType(
      this.traverseLinkedResources(this.traverseAnnotationItems(annotationPage, path), path),
      { parent, path },
      this.traversals.annotationPage
    );
  }

  traverseAnnotationCollection(annotationCollection: any, parent?: any, path = '$'): any {
    return this.traverseType(
      this.traverseLinkedResources(this.traverseAnnotationItems(annotationCollection, path), path),
      { parent, path },
      this.traversals.annotationCollection
    );
  }

  private traverseAnnotationBody(annotation: any, path: string) {
    if (annotation.body) {
      annotation.body = ensureArray(annotation.body).map((body: any, index: number) =>
        this.traverseUnknown(body, {
          parent: annotation,
          path: `${path}.body[${index}]`,
          typeHint: 'ContentResource',
        })
      );
    }
    return annotation;
  }

  private traverseAnnotationTarget(annotation: any, path: string) {
    if (annotation.target) {
      annotation.target = ensureArray(annotation.target).map((target: any, index: number) => {
        if (isSpecificResource(target)) {
          return this.traverseSpecificResource(target, undefined, annotation, `${path}.target[${index}]`);
        }
        if (typeof target === 'string') {
          return target;
        }
        if (target && typeof target === 'object' && !Array.isArray(target) && !getType(target)) {
          return target;
        }
        if (isResourceReference(target)) {
          return target;
        }
        return this.traverseUnknown(target, {
          parent: annotation,
          path: `${path}.target[${index}]`,
        });
      });
    }
    return annotation;
  }

  traverseAnnotation(annotation: any, parent?: any, path = '$'): any {
    return this.traverseType(
      this.traverseLinkedResources(this.traverseAnnotationTarget(this.traverseAnnotationBody(annotation, path), path), path),
      { parent, path },
      this.traversals.annotation
    );
  }

  traverseSelector(selector: any, parent?: any, path = '$'): any {
    if (selector.refinedBy) {
      selector.refinedBy = this.traverseSelector(selector.refinedBy, selector, `${path}.refinedBy`);
    }
    return this.traverseType(selector, { parent, path }, this.traversals.selector);
  }

  traverseQuantity(quantity: any, parent?: any, path = '$'): any {
    return this.traverseType(quantity, { parent, path }, this.traversals.quantity);
  }

  traverseTransform(transform: any, parent?: any, path = '$'): any {
    return this.traverseType(transform, { parent, path }, this.traversals.transform);
  }

  traverseSpecificResource(specificResource: any, typeHint?: string, parent?: any, path = '$'): any {
    const source = specificResource.source;
    let nextSource = source;

    if (Array.isArray(source)) {
      nextSource = source.map((sourceItem: any, index: number) =>
        typeof sourceItem === 'string'
          ? sourceItem
          : this.traverseUnknown(sourceItem, {
              parent: specificResource,
              path: `${path}.source[${index}]`,
              typeHint: typeHint || 'ContentResource',
            })
      );
    } else if (source && typeof source === 'object') {
      nextSource = this.traverseUnknown(source, {
        parent: specificResource,
        path: `${path}.source`,
        typeHint: typeHint || 'ContentResource',
      });
    }

    if (specificResource.selector) {
      specificResource.selector = ensureArray(specificResource.selector).map((selector: any, index: number) =>
        this.traverseSelector(selector, specificResource, `${path}.selector[${index}]`)
      );
    }

    if (specificResource.transform) {
      specificResource.transform = ensureArray(specificResource.transform).map((transform: any, index: number) =>
        this.traverseTransform(transform, specificResource, `${path}.transform[${index}]`)
      );
    }

    if (specificResource.position && typeof specificResource.position === 'object') {
      specificResource.position = this.traverseSpecificResource(
        specificResource.position,
        'SpecificResource',
        specificResource,
        `${path}.position`
      );
    }

    if (nextSource) {
      specificResource.source = nextSource;
    }

    return this.traverseType(specificResource, { parent, path }, this.traversals.specificResource);
  }

  traverseContentResource(contentResource: any, parent?: any, path = '$'): any {
    if (!contentResource || typeof contentResource !== 'object') {
      return contentResource;
    }

    if (isSpecificResource(contentResource)) {
      return this.traverseSpecificResource(contentResource, 'ContentResource', parent, path);
    }

    if (isQuantity(contentResource)) {
      return this.traverseQuantity(contentResource, parent, path);
    }

    if (isSelector(contentResource)) {
      return this.traverseSelector(contentResource, parent, path);
    }

    if (contentResource.type === 'Choice' && contentResource.items) {
      contentResource.items = ensureArray(contentResource.items).map((item: any, index: number) =>
        this.traverseContentResource(item, contentResource, `${path}.items[${index}]`)
      );
    }

    if (contentResource.annotations) {
      contentResource.annotations = ensureArray(contentResource.annotations).map((item: any, index: number) =>
        this.traverseAnnotationPage(item, contentResource, `${path}.annotations[${index}]`)
      );
    }

    if (contentResource.service) {
      contentResource.service = ensureArray(contentResource.service).map((service: any, index: number) =>
        this.traverseService(service, contentResource, `${path}.service[${index}]`)
      );
    }

    if (contentResource.services) {
      contentResource.services = ensureArray(contentResource.services).map((service: any, index: number) =>
        this.traverseService(service, contentResource, `${path}.services[${index}]`)
      );
    }

    return this.traverseType(
      this.traverseLinkedResources(contentResource, path),
      { parent, path },
      this.traversals.contentResource
    );
  }

  traverseRange(range: any, parent?: any, path = '$'): any {
    if (range.items) {
      range.items = ensureArray(range.items).map((item: any, index: number) => {
        if (isSpecificResource(item)) {
          return this.traverseSpecificResource(item, 'Canvas', range, `${path}.items[${index}]`);
        }
        return this.traverseUnknown(item, {
          parent: range,
          path: `${path}.items[${index}]`,
        });
      });
    }
    return this.traverseType(
      this.traverseLinkedResources(range, path),
      { parent, path },
      this.traversals.range
    );
  }

  traverseAgent(agent: any, parent?: any, path = '$'): any {
    return this.traverseType(this.traverseLinkedResources(agent, path), { parent, path }, this.traversals.agent);
  }

  traverseService(service: any, parent?: any, path = '$'): any {
    if (service && typeof service === 'object' && service.service) {
      service.service = ensureArray(service.service).map((innerService: any, index: number) =>
        this.traverseService(innerService, service, `${path}.service[${index}]`)
      );
    }
    return this.traverseType(service, { parent, path }, this.traversals.service);
  }

  private traverseType<T>(object: T, context: TraversalContext, traversals: Array<Traversal<T>>): T {
    return traversals.reduce((acc: T, traversal: Traversal<T>): T => {
      const returnValue = traversal(acc, context) as T | undefined;
      if (typeof returnValue === 'undefined') {
        return acc;
      }
      return returnValue;
    }, object);
  }

  traverseUnknown(resource: any, { parent, path, typeHint }: UnknownTraversalArgs): any {
    const type = identifyResourceType(resource, typeHint);

    switch (type) {
      case 'Collection':
        return this.traverseCollection(resource, parent, path);
      case 'Manifest':
        return this.traverseManifest(resource, parent, path);
      case 'Timeline':
        return this.traverseTimeline(resource, parent, path);
      case 'Canvas':
        return this.traverseCanvas(resource, parent, path);
      case 'Scene':
        return this.traverseScene(resource, parent, path);
      case 'AnnotationCollection':
        return this.traverseAnnotationCollection(resource, parent, path);
      case 'AnnotationPage':
        return this.traverseAnnotationPage(resource, parent, path);
      case 'Annotation':
        return this.traverseAnnotation(resource, parent, path);
      case 'Range':
        return this.traverseRange(resource, parent, path);
      case 'SpecificResource':
        return this.traverseSpecificResource(resource, undefined, parent, path);
      case 'Selector':
        return this.traverseSelector(resource, parent, path);
      case 'Quantity':
        return this.traverseQuantity(resource, parent, path);
      case 'Transform':
        return this.traverseTransform(resource, parent, path);
      case 'Service':
        return this.traverseService(resource, parent, path);
      case 'Agent':
        return this.traverseAgent(resource, parent, path);
      case 'ContentResource':
        return this.traverseContentResource(resource, parent, path);
      default: {
        if (containerTypes.has(type) || structuralTypes.has(type) || annotationTypes.has(type) || sceneComponentTypes.has(type)) {
          return this.traverseContentResource(resource, parent, path);
        }
        throw new Error(`Unknown or unsupported resource type ${type}`);
      }
    }
  }
}

export const traverse = new Traverse();
