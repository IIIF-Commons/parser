import { Traverse } from './traverse';
import {
  Annotation,
  AnnotationPage,
  AnnotationPageNormalized,
  Canvas,
  CanvasNormalized,
  Collection,
  CollectionNormalized,
  Manifest,
  ManifestNormalized,
  PolyEntity,
  Range,
  RangeNormalized,
  Reference,
  Selector,
  SpecificResource,
} from '@iiif/presentation-3';
import {
  emptyAgent,
  emptyAnnotationPage,
  emptyCanvas,
  emptyCollection,
  emptyManifest,
  emptyRange,
} from './empty-types';
import { convertPresentation2 } from '../presentation-2';
import { NormalizedEntity } from './serialize';
import { ResourceProvider, ResourceProviderNormalized } from '@iiif/presentation-3/resources/provider';
import { expandTargetToSpecificResource } from '../shared/expand-target';

export const defaultEntities = {
  Collection: {},
  Manifest: {},
  Canvas: {},
  AnnotationPage: {},
  AnnotationCollection: {},
  Annotation: {},
  ContentResource: {},
  Range: {},
  Service: {},
  Selector: {},
  Agent: {},
};

export function getDefaultEntities() {
  return {
    Collection: {},
    Manifest: {},
    Canvas: {},
    AnnotationPage: {},
    AnnotationCollection: {},
    Annotation: {},
    ContentResource: {},
    Range: {},
    Service: {},
    Selector: {},
    Agent: {},
  };
}

function getResource(entityOrString: PolyEntity, type: string): Reference {
  if (typeof entityOrString === 'string') {
    return { id: entityOrString, type };
  }
  if (!entityOrString.id) {
    throw new Error(`Invalid resource does not have an ID (${type})`);
  }
  return entityOrString as Reference;
}

function mapToEntities(entities: Record<string, Record<string, NormalizedEntity>>) {
  return <T extends Reference | string>(type: string, defaultStringType?: string) => {
    const storeType = entities[type] ? entities[type] : {};
    return (r: T): T => {
      const resource = getResource(r, defaultStringType || type);
      if (resource && resource.id && type) {
        storeType[resource.id] = storeType[resource.id]
          ? (Object.assign({}, storeType[resource.id], resource) as any)
          : Object.assign({}, resource);
        return {
          id: resource.id,
          type: type === 'ContentResource' ? type : resource.type,
        } as T;
      }
      return resource as T;
    };
  };
}

function recordTypeInMapping(mapping: Record<string, string>) {
  return <T extends Reference | string>(type: string, defaultStringType?: string) => {
    return (r: T): T => {
      const { id, type: foundType } = getResource(r, defaultStringType || type);
      if (typeof id === 'undefined') {
        throw new Error('Found invalid entity without an ID.');
      }
      if (type === 'ContentResource') {
        mapping[id] = type;
      } else {
        mapping[id] = foundType as any;
      }
      return r;
    };
  };
}

/**
 * A string hashing function based on Daniel J. Bernstein's popular 'times 33' hash algorithm.
 * @author MatthewBarker <mrjbarker@hotmail.com>
 */
function hash(object: any): string {
  const text = JSON.stringify(object);

  let numHash = 5381,
    index = text.length;

  while (index) {
    numHash = (numHash * 33) ^ text.charCodeAt(--index);
  }

  const num = numHash >>> 0;

  const hexString = num.toString(16);
  if (hexString.length % 2) {
    return '0' + hexString;
  }
  return hexString;
}

function addMissingIdToContentResource<T extends Partial<Reference>>(type: string) {
  return (resource: T | string): T => {
    if (typeof resource === 'string') {
      return { id: resource, type } as T;
    }
    if (!resource.id) {
      return { id: `vault://${hash(resource)}`, type, ...resource };
    }
    if (!resource.type) {
      return { type, ...resource };
    }
    return resource;
  };
}

function ensureDefaultFields<T, R>(defaultResource: R) {
  return (resource: T): R => {
    return {
      ...defaultResource,
      ...resource,
    };
  };
}

function ensureArray<T>(maybeArray: T | T[]): T[] {
  if (Array.isArray(maybeArray)) {
    return maybeArray;
  }
  return [maybeArray];
}

function ensureArrayOnAnnotation(annotation: Annotation): Annotation {
  if (annotation.body) {
    annotation.body = ensureArray(annotation.body);
  }
  if (annotation.seeAlso) {
    annotation.seeAlso = ensureArray(annotation.seeAlso);
  }
  if (annotation.body) {
    annotation.body = ensureArray(annotation.body);
  }
  if (annotation.audience) {
    annotation.audience = ensureArray(annotation.audience);
  }
  if (annotation.accessibility) {
    annotation.accessibility = ensureArray(annotation.accessibility);
  }
  if (annotation.motivation) {
    annotation.motivation = ensureArray(annotation.motivation);
  }

  return annotation;
}

function isSpecificResource(resource: unknown): resource is SpecificResource {
  return (resource as any).type === 'SpecificResource';
}

function toSpecificResource(
  target: string | Reference<any> | SpecificResource,
  { typeHint, partOfTypeHint }: { typeHint?: string; partOfTypeHint?: string } = {}
): SpecificResource {
  if (typeof target === 'string') {
    target = { id: target, type: typeHint || 'unknown' };
  }

  if (isSpecificResource(target)) {
    if (target.source.type === 'Canvas' && target.source.partOf && typeof target.source.partOf === 'string') {
      target.source.partOf = [
        {
          id: target.source.partOf,
          type: partOfTypeHint || 'Manifest', // Most common is manifest.
        },
      ];
    }

    return target;
  }

  let selector: Selector | undefined;
  if (target.id.indexOf('#') !== -1) {
    const [id, fragment] = target.id.split('#');
    target.id = id;
    if (fragment) {
      selector = {
        type: 'FragmentSelector',
        value: fragment,
      };
    }
  }

  return {
    type: 'SpecificResource',
    source: target,
    selector,
  };
}

function rangeItemToSpecificResource(range: Range): Range {
  const _range = Object.assign({}, range);
  if (range && range.items) {
    _range.items = range.items.map((rangeItem) => {
      if (typeof rangeItem === 'string' || rangeItem.type === 'Canvas') {
        return toSpecificResource(rangeItem);
      }
      return rangeItem;
    });
  }
  return _range;
}

function startCanvasToSpecificResource(manifest: Manifest): Manifest {
  const _manifest = Object.assign({}, manifest);
  if (_manifest.start) {
    _manifest.start = toSpecificResource(_manifest.start, { typeHint: 'Canvas' }) as any;
    return _manifest;
  }
  return manifest;
}

function annotationTargetToSpecificResource(annotation: Annotation): Annotation {
  const _annotation = Object.assign({}, annotation);
  if (_annotation.target) {
    _annotation.target = expandTargetToSpecificResource(_annotation.target as any, { typeHint: 'Canvas' }) as any;
    return _annotation;
  }
  return annotation;
}

export function normalize(unknownEntity: unknown) {
  const entity = convertPresentation2(unknownEntity);
  const entities = getDefaultEntities();
  const mapping = {};
  const addToEntities = mapToEntities(entities);
  const addToMapping = recordTypeInMapping(mapping);

  const traversal = new Traverse({
    collection: [
      ensureDefaultFields<Collection, CollectionNormalized>(emptyCollection),
      addToMapping<Collection>('Collection'),
      addToEntities<Collection>('Collection'),
    ],
    manifest: [
      ensureDefaultFields<Manifest, ManifestNormalized>(emptyManifest),
      startCanvasToSpecificResource,
      addToMapping<Manifest>('Manifest'),
      addToEntities<Manifest>('Manifest'),
    ],
    canvas: [
      ensureDefaultFields<Canvas, CanvasNormalized>(emptyCanvas),
      addToMapping<Canvas>('Canvas'),
      addToEntities<Canvas>('Canvas'),
    ],
    annotationPage: [
      addMissingIdToContentResource('AnnotationPage'),
      ensureDefaultFields<AnnotationPage, AnnotationPageNormalized>(emptyAnnotationPage),
      addToMapping<AnnotationPage>('AnnotationPage'),
      addToEntities<AnnotationPage>('AnnotationPage'),
    ],
    annotation: [
      // This won't be normalized before going into the state.
      // It will be normalized through selectors and pattern matching.
      addMissingIdToContentResource('Annotation'),
      ensureArrayOnAnnotation,
      annotationTargetToSpecificResource,
      addToMapping<Annotation>('Annotation'),
      addToEntities<Annotation>('Annotation'),
    ],
    contentResource: [
      // This won't be normalized before going into the state.
      // It will be normalized through selectors and pattern matching.
      addMissingIdToContentResource<any>('ContentResource'),
      addToMapping<any>('ContentResource'),
      addToEntities<any>('ContentResource'),
    ],
    range: [
      // This will add a LOT to the state, maybe this will be configurable down the line.
      ensureDefaultFields<Range, RangeNormalized>(emptyRange),
      rangeItemToSpecificResource,
      addToMapping<Range>('Range', 'Canvas'),
      addToEntities<Range>('Range', 'Canvas'),
    ],
    agent: [
      ensureDefaultFields<ResourceProvider, ResourceProviderNormalized>(emptyAgent),
      addToMapping<ResourceProvider>('Agent'),
      addToEntities<ResourceProvider>('Agent'),
    ],
    // Remove this, content resources are NOT usually processed by this library.
    // They need to be available in full when they get passed down the chain.
    // There may be a better way to preserve annotations and content resources.
    // service: [
    //   ensureDefaultFields<Service, ServiceNormalized>(emptyService),
    //   addToMapping<Service>('Service'),
    //   addToEntities<Service>('Service'),
    // ],
  });
  const resource = traversal.traverseUnknown(entity) as Reference;

  return { entities, resource, mapping };
}
