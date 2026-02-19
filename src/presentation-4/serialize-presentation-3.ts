import { type SerializeConfig, UNSET } from "./serialize";
import { PRESENTATION_3_CONTEXT, sceneComponentTypes } from "./utilities";
import { compressSpecificResource } from "../shared/compress-specific-resource";

const unsupportedSelectorTypes = new Set(["PointSelector", "WktSelector", "AnimationSelector"]);
const unsupportedContainerTypes = new Set(["Scene"]);
const unsupportedContentTypes = new Set([
  "Model",
  "PerspectiveCamera",
  "OrthographicCamera",
  "AmbientLight",
  "DirectionalLight",
  "PointLight",
  "SpotLight",
  "AmbientAudio",
  "PointAudio",
  "SpotAudio",
]);
const sequenceResourceTypes = new Set(["List", "Composite", "Independents"]);

function unsupported(message: string): never {
  throw new Error(`Presentation 4 -> 3 downgrade unsupported: ${message}`);
}

function isEmptySequenceResource(value: any): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const type = value.type || value["@type"];
  if (!type || !sequenceResourceTypes.has(type)) {
    return false;
  }
  return Array.isArray(value.items) && value.items.length === 0;
}

function filterList<T>(value: T[] | T | typeof UNSET | undefined): T[] | undefined {
  if (!value || value === UNSET) {
    return undefined;
  }
  const list = Array.isArray(value) ? value : [value];
  const filtered = list.filter((item) => item !== UNSET && Boolean(item) && !isEmptySequenceResource(item));
  return filtered.length ? filtered : undefined;
}

function preserveObjectOrOmitEmptyList(value: any): any {
  if (!value || value === UNSET) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    return value;
  }
  const filtered = value.filter((item) => item !== UNSET && item !== null && typeof item !== "undefined");
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

function isListWrapper(value: any): boolean {
  if (!isPlainObject(value)) {
    return false;
  }
  const type = value.type || value["@type"];
  return type === "List" && Object.hasOwn(value, "items");
}

function getAnnotationEntries(value: any): any[] | undefined {
  if (!value || value === UNSET) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (isListWrapper(value)) {
    return Array.isArray(value.items) ? value.items : undefined;
  }

  return [value];
}

function remapContainerReferenceToCanvas(value: any): any {
  if (!isPlainObject(value)) {
    return value;
  }

  const type = value.type || value["@type"];
  if (type !== "Timeline" && type !== "Scene") {
    return value;
  }

  if (Object.hasOwn(value, "type")) {
    return { ...value, type: "Canvas" };
  }

  return { ...value, "@type": "Canvas" };
}

function normalizeTargetContainerType(type: string | undefined): string | undefined {
  if (type === "Timeline" || type === "Scene") {
    return "Canvas";
  }
  return type;
}

function compactContainerTargetReference(target: any): any {
  if (!isPlainObject(target)) {
    return target;
  }

  const targetType = normalizeTargetContainerType(target.type || target["@type"]);
  if (!targetType || targetType !== "Canvas") {
    return target;
  }

  const id = stripVaultId(target.id || target["@id"]);
  if (id) {
    return id;
  }

  return { type: "Canvas" };
}

function remapAnnotationTargetToCanvas(target: any): any {
  if (!isPlainObject(target)) {
    return target;
  }

  if (isListWrapper(target)) {
    return {
      ...target,
      items: Array.isArray(target.items) ? target.items.map((item: any) => remapAnnotationTargetToCanvas(item)) : [],
    };
  }

  const type = target.type || target["@type"];
  if (type === "SpecificResource") {
    const source = target.source;
    if (Array.isArray(source)) {
      return {
        ...target,
        source: source.map((item) => remapContainerReferenceToCanvas(item)),
      };
    }
    if (isPlainObject(source)) {
      return {
        ...target,
        source: remapContainerReferenceToCanvas(source),
      };
    }
    return target;
  }

  return remapContainerReferenceToCanvas(target);
}

function normalizeSpecificResourceTargetForCompression(target: any, state: any): any {
  if (!isPlainObject(target)) {
    return target;
  }

  const specificTarget: Record<string, any> = {
    ...target,
    type: "SpecificResource",
  };
  delete specificTarget.id;
  delete specificTarget["@id"];
  delete specificTarget["@type"];

  if (Array.isArray(specificTarget.selector)) {
    const selectors = specificTarget.selector.filter(
      (selector: any) => selector !== null && typeof selector !== "undefined"
    );
    if (selectors.length === 1) {
      specificTarget.selector = selectors[0];
    } else if (selectors.length === 0) {
      delete specificTarget.selector;
    }
  }

  if (Array.isArray(specificTarget.transform) && specificTarget.transform.length === 0) {
    delete specificTarget.transform;
  }
  if (Array.isArray(specificTarget.action) && specificTarget.action.length === 0) {
    delete specificTarget.action;
  }

  if (Array.isArray(specificTarget.source)) {
    specificTarget.source = specificTarget.source[0];
  }

  if (typeof specificTarget.source === "string") {
    const sourceId = specificTarget.source;
    const mappedType = normalizeTargetContainerType(state?.mapping?.[sourceId]) || "Canvas";
    specificTarget.source = {
      id: sourceId,
      type: mappedType,
    };
  } else if (isPlainObject(specificTarget.source)) {
    const sourceType = normalizeTargetContainerType(specificTarget.source.type || specificTarget.source["@type"]);
    specificTarget.source = {
      ...specificTarget.source,
      ...(sourceType ? { type: sourceType } : {}),
    };
  }

  return specificTarget;
}

function serializeAnnotationTarget(target: any, state: any): any {
  const normalizedTarget = normalizeAnnotationTarget(remapAnnotationTargetToCanvas(target));
  const targetType = normalizedTarget?.type || normalizedTarget?.["@type"];

  if (targetType === "Canvas") {
    return compactContainerTargetReference(normalizedTarget);
  }

  if (targetType !== "SpecificResource") {
    return normalizedTarget;
  }

  return compressSpecificResource(normalizeSpecificResourceTargetForCompression(normalizedTarget, state) as any, {
    allowString: true,
    allowSourceString: true,
    allowedStringType: "Canvas",
  });
}

function resolveContentResourceReference(state: any, value: any): any {
  if (Array.isArray(value)) {
    return value.map((item) => resolveContentResourceReference(state, item));
  }
  if (!value || typeof value !== "object") {
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

function asSingleOrArray<T>(items: T[] | undefined): T[] | T | undefined {
  if (!items || items.length === 0) {
    return undefined;
  }
  if (items.length === 1) {
    return items[0];
  }
  return items;
}

function stripVaultId(id?: string) {
  if (!id) {
    return undefined;
  }
  return id.startsWith("vault://") ? undefined : id;
}

function ensureNoV4OnlyBehavior(entity: any) {
  if (unsupportedContainerTypes.has(entity.type)) {
    unsupported(`container type ${entity.type}`);
  }
  if (entity.transform && entity.transform.length) {
    unsupported("SpecificResource.transform");
  }
  if (entity.action && entity.action.length) {
    unsupported("SpecificResource.action");
  }
  if (entity.exclude && entity.exclude.length) {
    unsupported("Annotation.exclude");
  }
  if (entity.position) {
    unsupported("position");
  }
  if (Array.isArray(entity.motivation) && entity.motivation.includes("activating")) {
    unsupported("Annotation motivation activating");
  }
}

function ensureNo3dContent(entity: any) {
  const type = entity.type;
  if (unsupportedContentTypes.has(type) || sceneComponentTypes.has(type)) {
    unsupported(`content type ${type}`);
  }
}

function* linkedProperties(entity: any): Generator<any, any, any> {
  if (
    entity.placeholderContainer &&
    entity.placeholderContainer.type &&
    entity.placeholderContainer.type !== "Canvas"
  ) {
    unsupported(`placeholderContainer type ${entity.placeholderContainer.type}`);
  }
  if (
    entity.accompanyingContainer &&
    entity.accompanyingContainer.type &&
    entity.accompanyingContainer.type !== "Canvas"
  ) {
    unsupported(`accompanyingContainer type ${entity.accompanyingContainer.type}`);
  }

  return [
    ["thumbnail", filterList(yield entity.thumbnail)],
    ["provider", filterList(yield entity.provider)],
    ["seeAlso", filterList(yield entity.seeAlso)],
    ["service", filterList(entity.service)],
    ["services", filterList(entity.services)],
    ["homepage", filterList(yield entity.homepage)],
    ["rendering", filterList(yield entity.rendering)],
    ["partOf", filterList(yield entity.partOf)],
    ["placeholderCanvas", entity.placeholderContainer ? yield entity.placeholderContainer : undefined],
    ["accompanyingCanvas", entity.accompanyingContainer ? yield entity.accompanyingContainer : undefined],
    ["annotations", filterList(yield entity.annotations)],
  ];
}

function commonProperties(entity: any) {
  ensureNoV4OnlyBehavior(entity);
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
    ["viewingDirection", entity.viewingDirection],
    ["format", entity.format],
    ["height", entity.height],
    ["width", entity.width],
    ["duration", entity.duration],
  ] as Array<[string, any]>;
}

export const serializeConfigPresentation3: SerializeConfig = {
  Collection: function* (entity, _state, { isTopLevel }) {
    return [
      ...(isTopLevel ? [["@context", PRESENTATION_3_CONTEXT]] : []),
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ["items", filterList(yield entity.items)],
      ["first", entity.first],
      ["last", entity.last],
      ["total", entity.total],
    ];
  },

  Manifest: function* (entity, _state, { isTopLevel }) {
    return [
      ...(isTopLevel ? [["@context", PRESENTATION_3_CONTEXT]] : []),
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ["items", filterList(yield entity.items)],
      ["structures", filterList(yield entity.structures)],
      ["start", entity.start ? yield entity.start : undefined],
    ];
  },

  Timeline: function* (entity) {
    return [
      ["id", stripVaultId(entity.id)],
      ["type", "Canvas"],
      ["label", entity.label],
      ["width", UNSET],
      ["height", UNSET],
      ["duration", entity.duration],
      ...(yield* linkedProperties(entity)),
      ["items", filterList(yield entity.items)],
    ];
  },

  Canvas: function* (entity) {
    return [
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ["items", filterList(yield entity.items)],
    ];
  },

  Scene: function* (_entity) {
    unsupported("Scene container");
  },

  AnnotationPage: function* (entity) {
    return [
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ["items", filterList(yield entity.items)],
    ];
  },

  AnnotationCollection: function* (entity) {
    return [
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ["items", filterList(yield entity.items)],
      ["first", entity.first],
      ["last", entity.last],
      ["total", typeof entity.total === "number" && entity.total > 0 ? entity.total : undefined],
    ];
  },

  Annotation: function* (entity, state) {
    const annotationTargets = getAnnotationEntries(resolveContentResourceReference(state, entity.target));
    const serializedTargets = annotationTargets
      ?.map((target) => serializeAnnotationTarget(target, state))
      .filter((target) => target !== null && typeof target !== "undefined");

    ensureNoV4OnlyBehavior(entity);
    return [
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ["motivation", asSingleOrArray(entity.motivation)],
      ["body", asSingleOrArray(filterList(yield entity.body))],
      ["target", asSingleOrArray(serializedTargets)],
      ["timeMode", entity.timeMode],
    ];
  },

  Range: function* (entity) {
    return [
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ["items", filterList(yield entity.items)],
      ["start", entity.start ? yield entity.start : undefined],
      ["supplementary", filterList(yield entity.supplementary)],
    ];
  },

  Agent: function* (entity) {
    return [
      ["id", stripVaultId(entity.id)],
      ["type", entity.type || "Agent"],
      ["label", entity.label],
      ...(yield* linkedProperties(entity)),
    ];
  },

  Selector: function* (entity) {
    if (typeof entity.type === "string" && unsupportedSelectorTypes.has(entity.type)) {
      unsupported(`selector type ${entity.type}`);
    }
    return [
      ["id", stripVaultId(entity.id)],
      ["type", entity.type],
      ["value", entity.value],
      ["refinedBy", entity.refinedBy ? yield entity.refinedBy : undefined],
    ];
  },

  Quantity: function* (_entity) {
    unsupported("Quantity");
  },

  Transform: function* (_entity) {
    unsupported("Transform");
  },

  ContentResource: function* (entity) {
    ensureNoV4OnlyBehavior(entity);
    ensureNo3dContent(entity);
    return [
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ["items", entity.items ? filterList(yield entity.items) : undefined],
      ["source", entity.source ? preserveObjectOrOmitEmptyList(yield entity.source) : undefined],
      ["selector", entity.selector ? asSingleOrArray(filterList(yield entity.selector)) : undefined],
    ];
  },
};
