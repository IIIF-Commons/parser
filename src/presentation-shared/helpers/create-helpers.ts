export type DiscriminatedObject = {
  type?: unknown;
  "@type"?: unknown;
  id?: unknown;
  "@id"?: unknown;
};

export type ResourceSpec = {
  type: string;
  aliases?: readonly string[];
};

export type ResourceSpecs<T extends Record<string, unknown>> = {
  [K in keyof T]: ResourceSpec;
};

/**
 * Runtime-checked identity helpers that preserve the exact input literal type.
 *
 * Useful with `satisfies` to keep narrow literals while ensuring the expected
 * IIIF discriminant and id shape are present at runtime.
 */
export type InferApi<T extends Record<string, unknown>> = {
  [K in keyof T]: <const U extends T[K]>(value: U) => U;
};

/**
 * Runtime assertion helpers that return typed values from unknown input.
 *
 * Throws `TypeError` when the value does not match the expected discriminant
 * or has an invalid `id` / `@id` shape.
 */
export type CastApi<T extends Record<string, unknown>> = {
  [K in keyof T]: (value: unknown) => T[K];
};

type GuardName<K extends string> = `is${Capitalize<K>}`;

export type NarrowApi<T extends Record<string, unknown>> = {
  /**
   * Generic discriminant check for any `type` / `@type` value.
   */
  isType(value: unknown, type: string): boolean;
  /**
   * Build a reusable type guard for a discriminant string.
   */
  byType<TType extends string>(type: TType): (value: unknown) => value is { type: TType } | { "@type": TType };
} & {
  [K in keyof T as GuardName<K & string>]: (value: unknown) => value is T[K];
};

export type PresentationHelpers<T extends Record<string, unknown>> = {
  infer: InferApi<T>;
  cast: CastApi<T>;
  narrow: NarrowApi<T>;
  specs: ResourceSpecs<T>;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function capitalize(value: string): string {
  return value.length > 0 ? `${value.slice(0, 1).toUpperCase()}${value.slice(1)}` : value;
}

function getType(value: DiscriminatedObject): string | undefined {
  if (typeof value.type === "string") {
    return value.type;
  }

  if (typeof value["@type"] === "string") {
    return value["@type"];
  }

  if (Array.isArray(value["@type"])) {
    const firstString = value["@type"].find((entry): entry is string => typeof entry === "string");
    return firstString;
  }

  return undefined;
}

function hasValidIdShape(value: DiscriminatedObject): boolean {
  if (typeof value.id !== "undefined" && typeof value.id !== "string") {
    return false;
  }

  if (typeof value["@id"] !== "undefined" && typeof value["@id"] !== "string") {
    return false;
  }

  return true;
}

function isExpectedType(actualType: string | undefined, expected: ResourceSpec): boolean {
  if (!actualType) {
    return false;
  }

  if (actualType === expected.type) {
    return true;
  }

  return !!expected.aliases?.includes(actualType);
}

function describeExpected(expected: ResourceSpec): string {
  return [expected.type, ...(expected.aliases || [])].join(" | ");
}

function assertDiscriminatedResource(
  value: unknown,
  expected: ResourceSpec,
  label: string
): asserts value is DiscriminatedObject {
  if (!isObject(value)) {
    throw new TypeError(`${label} expected an object value.`);
  }

  if (!hasValidIdShape(value)) {
    throw new TypeError(`${label} expected id/@id to be a string when present.`);
  }

  const actualType = getType(value);
  if (!isExpectedType(actualType, expected)) {
    const received = typeof actualType === "string" ? actualType : "undefined";
    throw new TypeError(`${label} expected type ${describeExpected(expected)} but received ${received}.`);
  }
}

function isDiscriminatedResource(value: unknown, expected: ResourceSpec): boolean {
  if (!isObject(value) || !hasValidIdShape(value)) {
    return false;
  }

  return isExpectedType(getType(value), expected);
}

/**
 * Create version-specific `infer`, `cast`, and `narrow` helper APIs from a
 * discriminant registry.
 */
export function createPresentationHelpers<T extends Record<string, unknown>>(
  specs: ResourceSpecs<T>
): PresentationHelpers<T> {
  const infer = {} as InferApi<T>;
  const cast = {} as CastApi<T>;
  const narrow = {
    isType(value: unknown, type: string): boolean {
      return isDiscriminatedResource(value, { type });
    },
    byType<TType extends string>(type: TType) {
      return (value: unknown): value is { type: TType } | { "@type": TType } =>
        isDiscriminatedResource(value, { type });
    },
  } as NarrowApi<T>;

  for (const key of Object.keys(specs) as Array<keyof T & string>) {
    const expected = specs[key];
    const helperLabel = `infer.${key}`;
    const castLabel = `cast.${key}`;

    infer[key] = (<const TValue extends T[typeof key]>(value: TValue): TValue => {
      assertDiscriminatedResource(value, expected, helperLabel);
      return value;
    }) as InferApi<T>[typeof key];

    cast[key] = ((value: unknown): T[typeof key] => {
      assertDiscriminatedResource(value, expected, castLabel);
      return value as T[typeof key];
    }) as CastApi<T>[typeof key];

    const guardName = `is${capitalize(key)}` as keyof NarrowApi<T>;
    (narrow as Record<string, unknown>)[guardName as string] = ((value: unknown) => {
      return isDiscriminatedResource(value, expected);
    }) as unknown;
  }

  return {
    infer,
    cast,
    narrow,
    specs,
  };
}
