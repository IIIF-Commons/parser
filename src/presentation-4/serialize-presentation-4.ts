import { type SerializeConfig, UNSET } from "./serialize";
import { PRESENTATION_4_CONTEXT } from "./utilities";

export type AnnotationBodyTargetMode = "array" | "object";

export type SerializePresentation4Options = {
  annotationBodyTargetMode?: AnnotationBodyTargetMode;
};

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

function annotationList<T>(value: T[] | T | typeof UNSET | undefined): T[] | undefined {
  if (value === UNSET || value === null || typeof value === "undefined") {
    return undefined;
  }
  const list = Array.isArray(value) ? value : [value];
  const filtered = list.filter((item) => item !== UNSET && item !== null && typeof item !== "undefined") as T[];
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
    const specificResource = {
      ...start,
      type: "SpecificResource",
    } as Record<string, any>;

    if (id) {
      specificResource.id = id;
    } else {
      delete specificResource.id;
    }
    delete specificResource["@id"];
    delete specificResource["@type"];

    if (specificResource.source) {
      if (typeof specificResource.source === "string") {
        specificResource.source = stripVaultId(specificResource.source) || specificResource.source;
      } else if (isPlainObject(specificResource.source)) {
        const sourceId = stripVaultId(specificResource.source.id || specificResource.source["@id"]);
        const sourceType = specificResource.source.type || specificResource.source["@type"] || "Canvas";
        if (sourceId) {
          specificResource.source = { id: sourceId, type: sourceType };
        }
      }
    }

    return specificResource;
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
    Collection: function* (entity, _state, { isTopLevel }) {
      return [
        ...(isTopLevel ? [["@context", PRESENTATION_4_CONTEXT]] : []),
        ...baseProperties(entity),
        ...(yield* withLinkedProperties(entity)),
        ["start", serializeStartValue(entity.start)],
        ["items", filterList(yield entity.items)],
        ["first", entity.first],
        ["last", entity.last],
        ["total", entity.total],
      ];
    },

    Manifest: function* (entity, _state, { isTopLevel }) {
      return [
        ...(isTopLevel ? [["@context", PRESENTATION_4_CONTEXT]] : []),
        ...(yield* serializeContainer(entity, true)),
        ["start", serializeStartValue(entity.start)],
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
        ["total", entity.total],
      ];
    },

    Annotation: function* (entity) {
      return [
        ...baseProperties(entity),
        ...(yield* withLinkedProperties(entity)),
        ["motivation", entity.motivation?.length ? entity.motivation : undefined],
        ["body", serializeAnnotationValue(yield entity.body, annotationBodyTargetMode)],
        [
          "target",
          serializeAnnotationValue(entity.target, annotationBodyTargetMode, (target) =>
            normalizeAnnotationTarget(target)
          ),
        ],
        ["timeMode", entity.timeMode],
        ["exclude", entity.exclude?.length ? entity.exclude : undefined],
        ["position", entity.position ? yield entity.position : undefined],
      ];
    },

    Range: function* (entity) {
      return [
        ...baseProperties(entity),
        ...(yield* withLinkedProperties(entity)),
        ["items", filterList(yield entity.items)],
        ["start", serializeStartValue(entity.start)],
        ["supplementary", entity.supplementary ? yield entity.supplementary : undefined],
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
      return [
        ...baseProperties(entity),
        ...(yield* withLinkedProperties(entity)),
        ["value", entity.value ?? undefined],
        ["language", entity.language?.length ? entity.language : undefined],
        ["items", entity.items ? filterList(yield entity.items) : undefined],
        ["source", entity.source ? yield entity.source : undefined],
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
