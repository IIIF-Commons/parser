import {
  AnnotationCollection,
  AnnotationCollectionNormalized,
  AnnotationNormalized,
  AnnotationPageNormalized,
  CanvasNormalized,
  CollectionNormalized,
  ContentResource,
  ManifestNormalized,
  RangeNormalized,
  Reference,
  Selector,
  ServiceNormalized,
} from '@iiif/presentation-3';
import { ResourceProvider, ResourceProviderNormalized } from '@iiif/presentation-3/resources/provider';

export const UNSET = '__$UNSET$__';
export const UNWRAP = '__$UNWRAP$__';

export type Field = any[];

export type CompatibleStore<T extends string = string> = {
  requests: {
    [url: string]: { resourceUri?: string } & any;
  };
  entities: {
    [type in T]: {
      [id: string]: NormalizedEntity;
    };
  };
  mapping: {
    [id: string]: T;
  };
};

export type NormalizedEntity =
  | CollectionNormalized
  | ManifestNormalized
  | CanvasNormalized
  | AnnotationPageNormalized
  | AnnotationCollectionNormalized
  | AnnotationCollection
  | AnnotationNormalized
  | ContentResource
  | RangeNormalized
  | ServiceNormalized
  | Selector
  | ResourceProviderNormalized;

type SerializerContext = {
  isTopLevel?: boolean;
};

export type Serializer<Type extends NormalizedEntity> = (
  entity: Type,
  state: any,
  context: SerializerContext
) => Generator<Reference | Reference[], typeof UNSET | Field[], any>;

export type SerializeConfig = {
  Collection?: Serializer<CollectionNormalized>;
  Manifest?: Serializer<ManifestNormalized>;
  Canvas?: Serializer<CanvasNormalized>;
  AnnotationPage?: Serializer<AnnotationPageNormalized>;
  AnnotationCollection?: Serializer<AnnotationCollectionNormalized>;
  Annotation?: Serializer<AnnotationNormalized>;
  ContentResource?: Serializer<ContentResource>;
  Range?: Serializer<RangeNormalized>;
  Service?: Serializer<ServiceNormalized>;
  Selector?: Serializer<Selector>;
  Agent?: Serializer<ResourceProviderNormalized>;
};

function resolveIfExists<T extends NormalizedEntity>(state: CompatibleStore, url: string): T | undefined {
  const request = state.requests[url];
  // Return the resource.
  const resourceType = state.mapping[url];
  if (!resourceType || (request && request.resourceUri && !state.entities[resourceType][request.resourceUri])) {
    // Continue refetching resource, this is an invalid state.
    return undefined;
  }
  return state.entities[resourceType][request ? request.resourceUri : url] as T;
}

export function serializedFieldsToObject<T>(fields: Field[] | [string]): T {
  const object: any = {};

  for (const [key, value] of fields) {
    if (key === UNWRAP && value !== UNSET) {
      return value as T;
    }
    if (value !== UNSET && typeof value !== 'undefined' && value !== null) {
      object[key] = value;
    }
  }

  return object as T;
}

export function serialize<Return>(state: CompatibleStore, subject: Reference, config: SerializeConfig): Return {
  if (!subject.type || !subject.id) {
    throw new Error('Unknown entity');
  }

  if (!config[subject.type as keyof SerializeConfig]) {
    throw new Error(`Serializer not found for ${subject.type}`);
  }

  function flatten(sub: Reference) {
    const generator = config[sub.type as keyof SerializeConfig];
    if (!generator) {
      return UNSET;
    }

    const resource = resolveIfExists(state, sub.id) || (sub.id && sub.type ? sub : null);
    if (!resource) {
      return UNSET;
    }
    const iterator = generator(resource as any, state, { isTopLevel: subject.id === sub.id });
    let current = iterator.next();
    while (!current.done) {
      const requestToHydrate: Reference | Reference[] = current.value as any;
      let next: any = UNSET;

      if (requestToHydrate) {
        if (Array.isArray(requestToHydrate)) {
          const nextList: any[] = [];
          for (const req of requestToHydrate) {
            nextList.push(flatten(req));
          }
          next = nextList;
        } else {
          next = flatten(requestToHydrate);
        }
      }
      current = iterator.next(next);
    }

    if (current.value === UNSET) {
      return UNSET;
    }

    return serializedFieldsToObject(current.value);
  }

  return flatten(subject) as Return;
}
