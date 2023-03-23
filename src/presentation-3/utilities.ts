import { CompatibleStore, NormalizedEntity } from './serialize';
import { toRef } from '../shared/to-ref';

export const WILDCARD = {};
export const HAS_PART = 'iiif-parser:hasPart';
export const PART_OF = 'iiif-parser:partOf';
export const UNSET = '__$UNSET$__';
export const UNWRAP = '__$UNWRAP$__';
export const EMPTY = [];

// Prevent accidental mutation
Object.freeze(EMPTY);
Object.freeze(WILDCARD);

export function isWildcard(object: any) {
  if (object === WILDCARD || Object.keys(object).length === 0) {
    return true;
  }
  for (const i in object) {
    return false;
  }
  return true;
}

export function frameResource(resource: any, framing: any) {
  if (framing && framing['@explicit']) {
    const newEntity: any = {};
    const keys = Object.keys(framing);
    for (const key of keys) {
      if (key === PART_OF || key === '@explicit') {
        continue;
      }
      if (isWildcard(framing[key])) {
        newEntity[key] = resource[key];
      } else {
        newEntity[key] = framing[key];
      }
    }
    return newEntity;
  }

  return resource;
}

export function resolveIfExists<T extends NormalizedEntity>(
  state: CompatibleStore,
  urlOrResource: any,
  parent?: any
): readonly [T | undefined, T | undefined] {
  const ref = toRef(urlOrResource);
  if (!ref) {
    return [undefined, undefined];
  }

  const request = state.requests[ref.id];
  // Return the resource.
  const resourceType = state.mapping[ref.id] || ref.type;
  if (!resourceType || (request && request.resourceUri && !state.entities[resourceType][request.resourceUri])) {
    // Continue refetching resource, this is an invalid state.
    return [undefined, undefined];
  }
  const fullEntity: any = state.entities[resourceType][request ? request.resourceUri : ref.id] as T;

  if (fullEntity && fullEntity[HAS_PART]) {
    const framing = fullEntity[HAS_PART].find((t: any) => {
      return parent ? t[PART_OF] === parent.id : t[PART_OF] === fullEntity.id;
    });

    const newEntity = frameResource(fullEntity, framing);
    return [newEntity, fullEntity];
  }

  return [fullEntity, fullEntity];
}
