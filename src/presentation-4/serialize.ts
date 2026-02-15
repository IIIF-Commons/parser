export const UNSET = "__$UNSET$__";
export const UNWRAP = "__$UNWRAP$__";

export type Field = [string, any];

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

export type NormalizedEntity = {
  id?: string;
  type?: string;
  "@id"?: string;
  "@type"?: string;
  [key: string]: any;
};

type SerializerContext = {
  isTopLevel?: boolean;
  parent?: any;
  fullResource?: any;
};

export type Serializer<Type extends NormalizedEntity = NormalizedEntity> = (
  entity: Type,
  state: CompatibleStore,
  context: SerializerContext
) => Generator<any, any, any>;

export type SerializeConfig = {
  [type: string]: Serializer | undefined;
};

function resolveResource(
  state: CompatibleStore,
  value: any
): [NormalizedEntity | undefined, NormalizedEntity | undefined] {
  if (!value) {
    return [undefined, undefined];
  }
  if (typeof value === "string") {
    const type = state.mapping[value];
    const store = type ? state.entities[type] : undefined;
    if (!type || !store) {
      return [undefined, undefined];
    }
    const entity = store[value];
    return [entity, entity];
  }

  const id = value.id || value["@id"];
  const type = value.type || value["@type"] || state.mapping[id];
  const store = type ? state.entities[type] : undefined;
  if (!id || !type || !store) {
    return [undefined, undefined];
  }

  const request = state.requests[id];
  const full = store[request?.resourceUri || id];
  return [full, full];
}

export function serializedFieldsToObject<T>(fields: Field[] | [typeof UNWRAP, any]): T {
  if (Array.isArray(fields) && fields[0] === UNWRAP) {
    return fields[1] as T;
  }

  const object: any = {};
  for (const [key, value] of fields as Field[]) {
    if (value !== UNSET && typeof value !== "undefined" && value !== null) {
      object[key] = value;
    }
  }
  return object as T;
}

export function serialize<Return>(
  state: CompatibleStore,
  subject: { id: string; type: string },
  config: SerializeConfig
): Return {
  if (!subject.type || !subject.id) {
    throw new Error("Unknown entity");
  }

  if (!config[subject.type]) {
    throw new Error(`Serializer not found for ${subject.type}`);
  }

  function flatten(sub: { id: string; type: string }, parent?: any, depth = 0): any {
    if (depth > 40) {
      throw new Error(`Circular reference at ${sub.type}(${sub.id})`);
    }

    const generator = config[sub.type];
    if (!generator) {
      return UNSET;
    }

    const [resource, full] = resolveResource(state, sub);
    if (!resource) {
      return UNSET;
    }

    const iterator = generator(resource, state, {
      parent,
      fullResource: full,
      isTopLevel: subject.id === sub.id && subject.type === sub.type,
    });

    let current = iterator.next();
    while (!current.done) {
      const request = current.value;
      let next: any = UNSET;

      if (Array.isArray(request)) {
        next = request.map((item) => {
          if (!item || typeof item !== "object") {
            return item;
          }
          return flatten(item, sub, depth + 1);
        });
      } else if (request && typeof request === "object") {
        next = flatten(request, sub, depth + 1);
      } else if (request && request !== UNSET) {
        next = request;
      }

      current = iterator.next(next);
    }

    if (current.value === UNSET) {
      return UNSET;
    }

    return serializedFieldsToObject(current.value as any);
  }

  return flatten(subject) as Return;
}
