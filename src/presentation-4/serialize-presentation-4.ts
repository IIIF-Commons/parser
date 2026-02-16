import { type SerializeConfig, UNSET } from "./serialize";
import { PRESENTATION_4_CONTEXT } from "./utilities";

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

function inlineList<T>(value: T[] | T | undefined): T[] | undefined {
  if (!value) {
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

function stripVaultId(id?: string) {
  if (!id) {
    return undefined;
  }
  return id.startsWith("vault://") ? undefined : id;
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
    ["viewingDirection", entity.viewingDirection],
    ["timeMode", entity.timeMode],
    ["services", undefined],
  ] as Array<[string, any]>;
}

function* withLinkedProperties(entity: any): Generator<any, Array<[string, any]>, any> {
  return [
    ["thumbnail", filterList(yield entity.thumbnail)],
    ["provider", filterList(yield entity.provider)],
    ["seeAlso", filterList(yield entity.seeAlso)],
    ["service", filterList(yield entity.service)],
    ["services", filterList(yield entity.services)],
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

export const serializeConfigPresentation4: SerializeConfig = {
  Collection: function* (entity, _state, { isTopLevel }) {
    return [
      ...(isTopLevel ? [["@context", PRESENTATION_4_CONTEXT]] : []),
      ...baseProperties(entity),
      ...(yield* withLinkedProperties(entity)),
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
      ["start", entity.start ? yield entity.start : undefined],
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
      ["body", filterList(yield entity.body)],
      ["target", inlineList(entity.target)?.map((target) => normalizeAnnotationTarget(target))],
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
      ["start", entity.start ? yield entity.start : undefined],
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

  Service: function* (entity) {
    return [
      ["id", stripVaultId(entity.id)],
      ["type", entity.type],
      ["profile", entity.profile],
      ["service", filterList(yield entity.service)],
    ];
  },

  Selector: function* (entity) {
    return [
      ["id", stripVaultId(entity.id)],
      ["type", entity.type],
      ["value", entity.value],
      ["x", entity.x],
      ["y", entity.y],
      ["z", entity.z],
      ["instant", entity.instant],
      ["region", entity.region],
      ["size", entity.size],
      ["rotation", entity.rotation],
      ["quality", entity.quality],
      ["format", entity.format],
      ["version", entity.version],
      ["refinedBy", entity.refinedBy ? yield entity.refinedBy : undefined],
    ];
  },

  Quantity: function* (entity) {
    return [
      ["id", stripVaultId(entity.id)],
      ["type", entity.type || "Quantity"],
      ["quantityValue", entity.quantityValue],
      ["unit", entity.unit],
      ["label", entity.label],
    ];
  },

  Transform: function* (entity) {
    return [
      ["id", stripVaultId(entity.id)],
      ["type", entity.type],
      ["x", entity.x],
      ["y", entity.y],
      ["z", entity.z],
    ];
  },

  ContentResource: function* (entity) {
    return [
      ...baseProperties(entity),
      ...(yield* withLinkedProperties(entity)),
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
