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
  ResourceProvider,
  ResourceProviderNormalized,
} from '@iiif/presentation-3';
import {
  EMPTY,
  emptyAgent,
  emptyAnnotationPage,
  emptyCanvas,
  emptyCollection,
  emptyManifest,
  emptyRange,
} from './empty-types';
import { convertPresentation2 } from '../presentation-2';
import { NormalizedEntity } from './serialize';

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
          ? (mergeEntities(storeType[resource.id], resource) as any)
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

function merge(existing: any, incoming: any): any {
  if (!incoming) {
    // Falsy values are ignored
    return existing;
  }
  if (Array.isArray(existing)) {
    if (!Array.isArray(incoming)) {
      throw new Error('Cannot merge array with non-array');
    }
    // For arrays, we check if any of the incoming values are not already in the
    // existing values and add them if this is not the case. If the incoming
    // value is an entity that is already in the existing values, it will be
    // merged with the existing value.
    const merged = [...existing];
    for (const item of incoming) {
      if (item === null || item === undefined) {
        continue;
      }
      if (Array.isArray(item)) {
        // FIXME: How to handle this properly?
        merged.push(item);
      } else if (typeof item === 'object' && item.id && item.type) {
        const existingIdx = merged.findIndex((e) => e.id === item.id && e.type === item.type);
        if (existingIdx >= 0) {
          merged[existingIdx] = merge(merged[existingIdx], item);
        }
      } else if (existing.indexOf(item) === -1) {
        merged.push(item);
      }
    }
    return merged;
  } else if (typeof existing === 'object') {
    if (Array.isArray(incoming) || typeof incoming !== 'object') {
      throw new Error('Cannot merge object with non-object');
    }
    // For objects, we check the existing object for non-existing or "empty"
    // properties and use the value from the incoming object for them
    const merged = { ...existing };
    for (const [key, val] of Object.entries(incoming)) {
      const currentVal = merged[key];
      if (currentVal === EMPTY || !currentVal) {
        merged[key] = val;
      } else {
        merged[key] = merge(currentVal, val);
      }
    }
    return merged;
  } else if (existing) {
    return existing;
  }
  return incoming;
}

function mergeEntities(existing: NormalizedEntity, incoming: any): NormalizedEntity {
  if (typeof existing === 'string') {
    return existing;
  }
  if (incoming.id !== (existing as any).id || incoming.type !== (existing as any).type) {
    throw new Error('Can only merge entities with identical identifiers and type!');
  }
  return merge({ ...existing }, incoming);
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
