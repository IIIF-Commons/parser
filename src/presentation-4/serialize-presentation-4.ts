import { type SerializeConfig, UNSET, UNWRAP } from "./serialize";
import { PRESENTATION_4_CONTEXT } from "./utilities";

export type AnnotationBodyTargetMode = "array" | "object";

export type SerializePresentation4Options = {
  annotationBodyTargetMode?: AnnotationBodyTargetMode;
};

const sequenceResourceTypes = new Set(["List", "Composite", "Independents"]);

function filterList<T>(value: T[] | typeof UNSET): T[] | undefined {
  if (value === UNSET) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    return undefined;
  }
  const filtered = value.filter((item) => item !== UNSET) as T[];
  return filtered.length ? filtered : undefined;
}

function compactList<T>(value: T[] | T | null | undefined): T[] | undefined {
  if (value === null || typeof value === "undefined") {
    return undefined;
  }
  const list = Array.isArray(value) ? value : [value];
  const filtered = list.filter((item) => item !== null && typeof item !== "undefined") as T[];
  return filtered.length ? filtered : undefined;
}

function preserveObjectOrOmitEmptyList(value: any): any {
  if (value === UNSET || value === null || typeof value === "undefined") {
    return undefined;
  }
  if (!Array.isArray(value)) {
    return value;
  }
  const filtered = value.filter((item) => item !== UNSET && item !== null && typeof item !== "undefined");
  return filtered.length ? filtered : undefined;
}

function serializeLanguage(language: unknown): string | string[] | undefined {
  if (!Array.isArray(language) || language.length === 0) {
    return undefined;
  }
  return language.length === 1 ? language[0] : language;
}

function isEmptySequenceResource(value: any): boolean {
  if (!isPlainObject(value)) {
    return false;
  }
  const type = value.type || value["@type"];
  if (!type || !sequenceResourceTypes.has(type)) {
    return false;
  }
  return Array.isArray(value.items) && value.items.length === 0;
}

function annotationList<T>(value: T[] | T | typeof UNSET | undefined): T[] | undefined {
  if (value === UNSET || value === null || typeof value === "undefined") {
    return undefined;
  }
  const list = Array.isArray(value) ? value : [value];
  const filtered = list.filter(
    (item) => item !== UNSET && item !== null && typeof item !== "undefined" && !isEmptySequenceResource(item)
  ) as T[];
  return filtered.length ? filtered : undefined;
}

function normalizeAnnotationTarget(target: any): any {
  if (!target || typeof target !== "object" || Array.isArray(target)) {
    return target;
  }
  const type = target.type || target["@type"];
  if (type !== "Annotation") {
    return target;
  }
  const id = stripVaultId(target.id || target["@id"]);
  return id ? { id, type: "Annotation" } : { type: "Annotation" };
}

function isPlainObject(value: any): boolean {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function resolveContentResourceReference(state: any, value: any): any {
  if (Array.isArray(value)) {
    return value.map((item) => resolveContentResourceReference(state, item));
  }
  if (!isPlainObject(value)) {
    return value;
  }

  const id = value.id || value["@id"];
  if (!id) {
    return value;
  }

  const explicitType = value.type || value["@type"];
  const mappedType = state?.mapping?.[id];
  if (explicitType !== "ContentResource" && mappedType !== "ContentResource") {
    return value;
  }

  return state?.entities?.ContentResource?.[id] || value;
}

function serializeSpecificResourceSource(source: any): any {
  if (Array.isArray(source)) {
    const serialized = source
      .map((sourceItem) => serializeSpecificResourceSource(sourceItem))
      .filter((sourceItem) => sourceItem !== null && typeof sourceItem !== "undefined");
    if (!serialized.length) {
      return undefined;
    }
    if (serialized.length === 1) {
      return serialized[0];
    }
    return serialized;
  }

  if (typeof source === "string") {
    return stripVaultId(source) || source;
  }

  if (!isPlainObject(source)) {
    return source;
  }

  const sourceId = stripVaultId(source.id || source["@id"]);
  const sourceType = source.type || source["@type"];
  if (!sourceId && !sourceType) {
    return source;
  }

  const sourceReference: Record<string, any> = {};
  if (sourceId) {
    sourceReference.id = sourceId;
  }
  if (sourceType) {
    sourceReference.type = sourceType;
  }
  return sourceReference;
}

function serializeSpecificResource(resource: any): any {
  if (!isPlainObject(resource)) {
    return resource;
  }

  const type = resource.type || resource["@type"];
  if (type !== "SpecificResource") {
    return resource;
  }

  const specificResource = {
    ...resource,
    type: "SpecificResource",
  } as Record<string, any>;

  const id = stripVaultId(specificResource.id || specificResource["@id"]);
  if (id) {
    specificResource.id = id;
  } else {
    delete specificResource.id;
  }
  delete specificResource["@id"];
  delete specificResource["@type"];

  if (typeof specificResource.source !== "undefined") {
    const serializedSource = serializeSpecificResourceSource(specificResource.source);
    if (typeof serializedSource === "undefined") {
      delete specificResource.source;
    } else {
      specificResource.source = serializedSource;
    }
  }

  if (isPlainObject(specificResource.position)) {
    specificResource.position = serializeSpecificResource(specificResource.position);
  }

  if (isPlainObject(specificResource.lookAt)) {
    specificResource.lookAt = serializeSpecificResource(specificResource.lookAt);
  }

  const selector = compactList(specificResource.selector);
  if (selector) {
    specificResource.selector = selector;
  } else {
    delete specificResource.selector;
  }

  const transform = compactList(specificResource.transform);
  if (transform) {
    specificResource.transform = transform;
  } else {
    delete specificResource.transform;
  }

  const action = compactList(specificResource.action);
  if (action) {
    specificResource.action = action;
  } else {
    delete specificResource.action;
  }

  return specificResource;
}

function serializeStartValue(start: any): any {
  if (start === UNSET || start === null || typeof start === "undefined") {
    return undefined;
  }

  if (typeof start === "string") {
    const id = stripVaultId(start);
    return id ? { id, type: "Canvas" } : undefined;
  }

  if (!isPlainObject(start)) {
    return undefined;
  }

  const id = stripVaultId(start.id || start["@id"]);
  const type = start.type || start["@type"];
  if (!type) {
    return undefined;
  }

  if (type === "SpecificResource") {
    return serializeSpecificResource(start);
  }

  const containerReference: Record<string, any> = {
    type,
  };
  if (id) {
    containerReference.id = id;
  }
  if (typeof start.partOf !== "undefined") {
    containerReference.partOf = start.partOf;
  }
  return containerReference;
}

function stripVaultId(id?: string) {
  if (!id) {
    return undefined;
  }
  return id.startsWith("vault://") ? undefined : id;
}

function asObjectOrList(items: any[]): any {
  if (items.length === 1) {
    const first = items[0];
    if (first && typeof first === "object" && !Array.isArray(first)) {
      return first;
    }
  }
  return {
    type: "List",
    items,
  };
}

function serializeAnnotationValue(
  value: any[] | any | typeof UNSET | undefined,
  mode: AnnotationBodyTargetMode,
  normalizeItem?: (item: any) => any
): any {
  const items = annotationList(value);
  if (!items || !items.length) {
    return undefined;
  }

  const normalizedItems = normalizeItem ? items.map((item) => normalizeItem(item)) : items;
  if (mode === "array") {
    return normalizedItems;
  }
  return asObjectOrList(normalizedItems);
}

function serializeRangeItems(items: any[] | undefined): any[] | undefined {
  if (!Array.isArray(items)) {
    return undefined;
  }

  const normalizedItems = items
    .map((item) => {
      if (item === UNSET || item === null || typeof item === "undefined") {
        return undefined;
      }
      if (isPlainObject(item) && (item.type || item["@type"]) === "SpecificResource") {
        return serializeSpecificResource(item);
      }
      return item;
    })
    .filter((item) => item !== undefined);

  return normalizedItems.length ? normalizedItems : undefined;
}

function baseProperties(entity: any) {
  return [
    ["id", stripVaultId(entity.id)],
    ["type", entity.type],
    ["label", entity.label],
    ["metadata", entity.metadata?.length ? entity.metadata : undefined],
    ["summary", entity.summary],
    ["requiredStatement", entity.requiredStatement],
    ["rights", entity.rights],
    ["navDate", entity.navDate],
    ["navPlace", entity.navPlace],
    ["behavior", entity.behavior?.length ? entity.behavior : undefined],
    ["profile", entity.profile],
    ["format", entity.format],
    ["height", entity.height],
    ["width", entity.width],
    ["duration", entity.duration],
    ["spatialScale", entity.spatialScale],
    ["temporalScale", entity.temporalScale],
    ["backgroundColor", entity.backgroundColor],
    ["viewingDirection", entity.viewingDirection !== "left-to-right" ? entity.viewingDirection : undefined],
    ["timeMode", entity.timeMode],
    ["services", filterList(entity.services)],
    ["service", filterList(entity.service)],
  ] as Array<[string, any]>;
}

function* withLinkedProperties(entity: any): Generator<any, Array<[string, any]>, any> {
  return [
    ["thumbnail", filterList(yield entity.thumbnail)],
    ["provider", filterList(yield entity.provider)],
    ["seeAlso", filterList(yield entity.seeAlso)],
    ["service", filterList(entity.service)],
    ["services", filterList(entity.services)],
    ["homepage", filterList(yield entity.homepage)],
    ["rendering", filterList(yield entity.rendering)],
    ["partOf", filterList(yield entity.partOf)],
    ["placeholderContainer", entity.placeholderContainer ? yield entity.placeholderContainer : undefined],
    ["accompanyingContainer", entity.accompanyingContainer ? yield entity.accompanyingContainer : undefined],
    ["annotations", filterList(yield entity.annotations)],
  ];
}

function* serializeContainer(entity: any, includeStructures = false): Generator<any, any, any> {
  return [
    ...baseProperties(entity),
    ...(yield* withLinkedProperties(entity)),
    ["items", filterList(yield entity.items)],
    ...(includeStructures ? [["structures", filterList(yield entity.structures)]] : []),
  ];
}

export function createSerializeConfigPresentation4(options: SerializePresentation4Options = {}): SerializeConfig {
  const annotationBodyTargetMode = options.annotationBodyTargetMode || "object";

  return {
    Collection: function* (entity, state, { isTopLevel }) {
      return [
        ...(isTopLevel ? [["@context", PRESENTATION_4_CONTEXT]] : []),
        ...baseProperties(entity),
        ...(yield* withLinkedProperties(entity)),
        ["start", serializeStartValue(resolveContentResourceReference(state, entity.start))],
        ["items", filterList(yield entity.items)],
        ["first", entity.first],
        ["last", entity.last],
        ["total", entity.total],
      ];
    },

    Manifest: function* (entity, state, { isTopLevel }) {
      return [
        ...(isTopLevel ? [["@context", PRESENTATION_4_CONTEXT]] : []),
        ...(yield* serializeContainer(entity, true)),
        ["start", serializeStartValue(resolveContentResourceReference(state, entity.start))],
      ];
    },

    Timeline: function* (entity) {
      return yield* serializeContainer(entity);
    },

    Canvas: function* (entity) {
      return yield* serializeContainer(entity);
    },

    Scene: function* (entity) {
      return yield* serializeContainer(entity);
    },

    AnnotationPage: function* (entity) {
      return [
        ...baseProperties(entity),
        ...(yield* withLinkedProperties(entity)),
        ["items", filterList(yield entity.items)],
      ];
    },

    AnnotationCollection: function* (entity) {
      return [
        ...baseProperties(entity),
        ...(yield* withLinkedProperties(entity)),
        ["items", filterList(yield entity.items)],
        ["first", entity.first],
        ["last", entity.last],
        ["total", typeof entity.total === "number" && entity.total > 0 ? entity.total : undefined],
      ];
    },

    Annotation: function* (entity, state) {
      return [
        ...baseProperties(entity),
        ...(yield* withLinkedProperties(entity)),
        ["motivation", entity.motivation?.length ? entity.motivation : undefined],
        ["body", serializeAnnotationValue(yield entity.body, annotationBodyTargetMode, serializeSpecificResource)],
        [
          "target",
          serializeAnnotationValue(
            resolveContentResourceReference(state, entity.target),
            annotationBodyTargetMode,
            (target) => serializeSpecificResource(normalizeAnnotationTarget(target))
          ),
        ],
        ["timeMode", entity.timeMode],
        ["exclude", entity.exclude?.length ? entity.exclude : undefined],
        ["position", entity.position ? yield entity.position : undefined],
      ];
    },

    Range: function* (entity, state) {
      return [
        ...baseProperties(entity),
        ...(yield* withLinkedProperties(entity)),
        ["items", serializeRangeItems(resolveContentResourceReference(state, entity.items))],
        ["start", serializeStartValue(resolveContentResourceReference(state, entity.start))],
        ["supplementary", filterList(yield entity.supplementary)],
      ];
    },

    Agent: function* (entity) {
      return [
        ["id", stripVaultId(entity.id)],
        ["type", entity.type || "Agent"],
        ["label", entity.label],
        ...(yield* withLinkedProperties(entity)),
      ];
    },

    ContentResource: function* (entity) {
      if (entity.type === "SpecificResource") {
        return [UNWRAP, serializeSpecificResource(entity)];
      }

      return [
        ...baseProperties(entity),
        ...(yield* withLinkedProperties(entity)),
        ["value", entity.value ?? undefined],
        ["language", serializeLanguage(entity.language)],
        ["items", entity.items ? filterList(yield entity.items) : undefined],
        ["source", entity.source ? preserveObjectOrOmitEmptyList(yield entity.source) : undefined],
        ["selector", entity.selector ? filterList(yield entity.selector) : undefined],
        ["transform", entity.transform ? filterList(yield entity.transform) : undefined],
        ["action", entity.action?.length ? entity.action : undefined],
        ["lookAt", entity.lookAt ? yield entity.lookAt : undefined],
        ["position", entity.position ? yield entity.position : undefined],
        ["provides", entity.provides?.length ? entity.provides : undefined],
        ["quantityValue", entity.quantityValue],
        ["unit", entity.unit],
      ];
    },
  };
}

export const serializeConfigPresentation4 = createSerializeConfigPresentation4();
