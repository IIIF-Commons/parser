/**
 * Presentation API 4.0 - Serialization Utilities
 *
 * This module will provide the core serialization logic for IIIF Presentation 4.0 resources.
 * It will be used by both the native v4 serializer and the v4→v3 downgrade serializer.
 *
 * For now, this is a stub to scaffold the implementation.
 */

export type Field = any[];

export type CompatibleStore<T extends string = string> = {
  requests: {
    [url: string]: { resourceUri?: string } & any;
  };
  entities: {
    [type in T]: {
      [id: string]: any;
    };
  };
  mapping: {
    [id: string]: T;
  };
};

export type NormalizedEntity = { id?: string; type?: string; [key: string]: any };

export type SerializerContext = {
  isTopLevel?: boolean;
  parent?: any;
  fullResource?: any;
};

export type Serializer<Type extends NormalizedEntity> = (
  entity: Type,
  state: any,
  context: SerializerContext
) => Generator<any, any, any>;

export type SerializeConfig = {
  [type: string]: Serializer<any> | undefined;
};

/**
 * Converts a list of serialized fields to a plain JS object.
 * This is a stub for now and will be expanded for v4-specific logic.
 */
export function serializedFieldsToObject<T>(fields: Field[] | [string]): T {
  const object: any = {};
  for (const [key, value] of fields) {
    if (typeof key !== "undefined" && typeof value !== "undefined" && value !== null) {
      object[key] = value;
    }
  }
  return object as T;
}

/**
 * Main serialization entrypoint for Presentation 4.0.
 * This is a stub and will be implemented with v4 logic.
 */
export function serialize<Return>(
  state: CompatibleStore,
  subject: { id: string; type: string },
  config: SerializeConfig
): Return {
  // TODO: Implement v4 serialization logic
  throw new Error("serialize() not yet implemented for Presentation 4.0");
}
