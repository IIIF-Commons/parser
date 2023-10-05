import { AnnotationCollection, ContentResource, Reference, Selector } from '@iiif/presentation-3';
import {
  AnnotationCollectionNormalized,
  AnnotationNormalized,
  AnnotationPageNormalized,
  CanvasNormalized,
  CollectionNormalized,
  ManifestNormalized,
  RangeNormalized,
  ResourceProviderNormalized,
  ServiceNormalized,
} from '@iiif/presentation-3-normalized';
import { resolveIfExists, UNSET, UNWRAP } from './utilities';

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

export type _ServiceNormalized = ServiceNormalized & { id: string; type: string };

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
  | _ServiceNormalized
  | Selector
  | ResourceProviderNormalized
  | { id?: string; '@id'?: string; type?: string; '@type'?: string; [key: string]: any };

type SerializerContext = {
  isTopLevel?: boolean;
  parent?: any;
  fullResource?: any;
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
  Service?: Serializer<_ServiceNormalized>;
  Selector?: Serializer<Selector>;
  Agent?: Serializer<ResourceProviderNormalized>;
};

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

  function flatten(sub: Reference, parent?: any, depth = 0) {
    const generator = config[sub.type as keyof SerializeConfig];
    if (!generator) {
      return UNSET;
    }
    if (depth > 20) {
      throw new Error('Circular reference: ' + sub.id + ' ' + sub.type);
    }
    const [resource, fullResource] = resolveIfExists(state, sub.type ? sub : sub.id, parent) || (sub.id && sub.type ? sub : null);
    if (!resource) {
      return UNSET;
    }
    const iterator = generator(resource as any, state, {
      parent,
      isTopLevel: subject.id === sub.id,
      fullResource,
    });
    let current = iterator.next();
    while (!current.done) {
      const requestToHydrate: Reference | Reference[] = current.value as any;
      let next: any = UNSET;

      if (requestToHydrate) {
        if (Array.isArray(requestToHydrate)) {
          const nextList: any[] = [];
          for (const req of requestToHydrate) {
            nextList.push(flatten(req, sub, depth + 1));
          }
          next = nextList;
        } else {
          next = flatten(requestToHydrate, sub, depth + 1);
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
