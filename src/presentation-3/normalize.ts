import { TraversalContext, Traverse } from './traverse';
import {
  Annotation,
  AnnotationPage,
  Canvas,
  Collection,
  Manifest,
  PolyEntity,
  Range,
  Reference,
  Selector,
  SpecificResource,
  ResourceProvider,
  Service,
} from '@iiif/presentation-3';
import {
  emptyAgent,
  emptyAnnotationPage,
  emptyCanvas,
  emptyCollection,
  emptyManifest,
  emptyRange,
  emptyService,
} from './empty-types';
import { convertPresentation2 } from '../presentation-2';
import { CompatibleStore, NormalizedEntity } from './serialize';
import { expandTargetToSpecificResource } from '../shared/expand-target';
import {
  AnnotationPageNormalized,
  CanvasNormalized,
  CollectionNormalized,
  ManifestNormalized,
  RangeNormalized,
  ResourceProviderNormalized,
} from '@iiif/presentation-3-normalized';
import { isSpecificResource } from '../shared/is-specific-resource';
import { EMPTY, HAS_PART, PART_OF, WILDCARD } from './utilities';

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
    throw new Error(`Invalid resource does not have an ID (${JSON.stringify(entityOrString)}, ${type})`);
  }
  return entityOrString as Reference;
}

function mapToEntities(entities: Record<string, Record<string, NormalizedEntity>>, topLevel: any) {
  return <T extends Reference | string>(type: string, defaultStringType?: string) => {
    const storeType = entities[type] ? entities[type] : {};
    return (r: T, context: TraversalContext): T => {
      const resource = getResource(r, defaultStringType || type);
      if (resource && resource.id && type) {
        storeType[resource.id] = storeType[resource.id]
          ? (mergeEntities(storeType[resource.id], resource, {
              parent: context.parent,
              isTopLevel: topLevel.id === resource.id,
            }) as any)
          : mergeEntities({ id: resource.id, type: resource.type } as any, resource, {
              parent: context.parent,
              isTopLevel: topLevel.id === resource.id,
            });
        return {
          id: resource.id,
          type: type === 'ContentResource' ? type : resource.type,
        } as T;
      }
      return resource as T;
    };
  };
}

export function merge(existing: any, incoming: any, context?: { parent?: any; isTopLevel?: boolean }): any {
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
    const added: string[] = [];
    const unchanged: string[] = [];
    const existingKeys = Object.keys(existing).filter((key) => key !== HAS_PART && key !== 'id' && key !== 'type');
    const previouslyChangedValues: any = {};
    const incomingChangedValues: any = {};
    for (const [key, val] of Object.entries(incoming)) {
      if (key === HAS_PART || key === 'id' || key === 'type') {
        continue;
      }
      const currentVal = merged[key];
      if (currentVal === val) {
        unchanged.push(key);
      } else if (currentVal === EMPTY || !currentVal) {
        added.push(key);
        merged[key] = val;
      } else {
        if (currentVal && val) {
          previouslyChangedValues[key] = currentVal;
          incomingChangedValues[key] = val;
        }
        merged[key] = merge(currentVal, val);
        if (merged[key] === previouslyChangedValues[key]) {
          unchanged.push(key);
          delete previouslyChangedValues[key];
        }
      }
    }

    if (context && ((context.parent && context.parent.id) || context.isTopLevel)) {
      const newHasPart: any[] = [];
      const part: any = {};
      if (context.parent) {
        part[PART_OF] = context.parent.id;
      } else if (context.isTopLevel) {
        part[PART_OF] = existing.id;
      }

      if (merged[HAS_PART] && merged[HAS_PART].length) {
        const noExplicit = !merged[HAS_PART].find((r: any) => r['@explicit']);
        const hasDiverged = added.length > 0 || unchanged.length !== existingKeys.length;
        // We already have one, it may conflict here.
        // 1. Fix the first part.
        if (noExplicit && hasDiverged) {
          for (const item of merged[HAS_PART]) {
            const first = { ...item };
            const changedKeys = Object.keys(previouslyChangedValues);
            if (first) {
              first['@explicit'] = true;
              for (const addedProperty of existingKeys) {
                if (addedProperty !== HAS_PART) {
                  first[addedProperty] = WILDCARD;
                }
              }
              for (const changedKey of changedKeys) {
                first[changedKey] = previouslyChangedValues[changedKey];
              }
            }
            newHasPart.push(first);
          }
        } else {
          newHasPart.push(...merged[HAS_PART]);
        }

        if (hasDiverged) {
          // Add the framing.
          const changedKeys = Object.keys(incomingChangedValues);
          part['@explicit'] = true;
          for (const addedProperty of added) {
            part[addedProperty] = WILDCARD;
          }
          for (const unchangedValue of unchanged) {
            part[unchangedValue] = WILDCARD;
          }
          for (const changedKey of changedKeys) {
            part[changedKey] = incomingChangedValues[changedKey];
          }
        }
      }

      part.id = merged.id;
      part.type = merged.type;
      newHasPart.push(part);

      merged[HAS_PART] = newHasPart;
    }

    return merged;
  } else if (existing) {
    return existing;
  }
  return incoming;
}

export function mergeEntities(
  existing: NormalizedEntity,
  incoming: any,
  context?: { parent?: any; isTopLevel?: boolean }
): NormalizedEntity {
  if (typeof existing === 'string') {
    return existing;
  }
  if (incoming.id !== (existing as any).id || incoming.type !== (existing as any).type) {
    if (incoming.type === 'ImageService3') {
      return incoming;
    }
    if ((existing as any).type === 'ImageService3') {
      return existing;
    }

    throw new Error(
      `Can only merge entities with identical identifiers and type! ${incoming.type}(${incoming.id}) => ${
        (existing as any).type
      }(${(existing as any).id})`
    );
  }
  return merge({ ...existing }, incoming, context);
}

function recordTypeInMapping(mapping: Record<string, string>) {
  return <T extends Reference | string>(type: string, defaultStringType?: string) => {
    return (r: T): T => {
      const { id, type: foundType } = getResource(r, defaultStringType || type);
      if (typeof id === 'undefined') {
        throw new Error('Found invalid entity without an ID.');
      }
      if (type === 'ContentResource' || type === 'Service') {
        mapping[id] = type;
      } else {
        mapping[id] = foundType as any;
      }
      return r;
    };
  };
}

function normalizeService(_service: any): any {
  const service = Object.assign({}, _service);
  if (service['@id']) {
    service.id = service['@id'];
  }

  if (service['@type']) {
    service.type = service['@type'];
  }

  if (service.service) {
    const serviceReferences = [];
    service.service = Array.isArray(service.service) ? service.service : [service.service];
    for (const innerService of service.service) {
      serviceReferences.push({
        id: innerService['@id'] || innerService.id,
        type: innerService['@type'] || innerService.type,
      });
    }
    service.service = serviceReferences;
  }

  return Object.assign({}, emptyService, service);
}

function recordServiceForLoading(store: CompatibleStore['entities']) {
  return (resource: Service) => {
    store.Service = store.Service ? store.Service : {};
    const id: string = (resource as any).id || (resource as any)['@id'];
    const normalizedResource = normalizeService(resource);

    // @todo add loading status for image services.

    if (normalizedResource && normalizedResource.id) {
      if (store.Service[normalizedResource.id]) {
        // We need to merge.
        store.Service[id] = mergeEntities(store.Service[id], normalizedResource);
      } else {
        store.Service[id] = normalizedResource as any;
      }
    }

    // Keep original on resource - this is a parallel copy for READING
    return resource;
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

function toSpecificResource(
  target: string | Reference<any> | SpecificResource,
  { typeHint, partOfTypeHint }: { typeHint?: string; partOfTypeHint?: string } = {}
): SpecificResource {
  if (typeof target === 'string') {
    target = { id: target, type: typeHint || 'unknown' };
  }

  if (isSpecificResource(target)) {
    if (typeof target.source === 'string') {
      target.source = { id: target.source, type: typeHint || 'unknown' };
    }

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

export function traverseSpecificResource(specificResource: SpecificResource): SpecificResource {
  return specificResource;
}

export function normalize(unknownEntity: unknown) {
  const entity = convertPresentation2(unknownEntity);
  const entities = getDefaultEntities();
  const mapping = {};
  const addToEntities = mapToEntities(entities, entity);
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
    specificResource: [
      // Special-case changes to this type of resource.
      traverseSpecificResource,
    ],
    service: [
      // Only record, don't replace.
      recordServiceForLoading(entities),
    ],
  });
  const resource = traversal.traverseUnknown(entity) as Reference;

  return { entities, resource, mapping };
}
