import { convertPresentation2 } from "../presentation-2";
import {
  deepClone,
  ensureArray,
  getType,
  PRESENTATION_4_CONTEXT,
  setType,
  setId,
  getId,
  isPlainObject,
} from "./utilities";

const containerTypes = new Set(["Timeline", "Canvas", "Scene"]);
type TypeLookup = Record<string, string>;

function hasPresentation4Context(resource: any): boolean {
  if (!resource || typeof resource !== "object") {
    return false;
  }
  const context = resource["@context"];
  if (typeof context === "string") {
    return context.includes("/presentation/4/");
  }
  if (Array.isArray(context)) {
    return context.some((item) => typeof item === "string" && item.includes("/presentation/4/"));
  }
  return false;
}

function toIdAndType(resource: any) {
  if (!resource || typeof resource !== "object") {
    return;
  }

  if (typeof resource["@id"] === "string" && typeof resource.id !== "string") {
    setId(resource, resource["@id"]);
  }

  const atType = resource["@type"];
  if (typeof atType === "string" && typeof resource.type !== "string") {
    setType(resource, atType);
  }
}

function inferTypeById(id: string | undefined, typeLookup: TypeLookup, fallbackType: string): string {
  if (!id) {
    return fallbackType;
  }
  const directMatch = typeLookup[id];
  if (typeof directMatch === "string") {
    return directMatch;
  }
  const fragmentIndex = id.indexOf("#");
  if (fragmentIndex !== -1) {
    const withoutFragment = id.slice(0, fragmentIndex);
    const fragmentMatch = typeLookup[withoutFragment];
    if (typeof fragmentMatch === "string") {
      return fragmentMatch;
    }
  }
  return fallbackType;
}

function collectKnownTypes(resource: any, typeLookup: TypeLookup = {}): TypeLookup {
  if (Array.isArray(resource)) {
    for (const item of resource) {
      collectKnownTypes(item, typeLookup);
    }
    return typeLookup;
  }

  if (!isPlainObject(resource)) {
    return typeLookup;
  }

  toIdAndType(resource);

  const id = getId(resource);
  const type = getType(resource);
  if (id && type && !typeLookup[id]) {
    typeLookup[id] = type;
  }

  for (const value of Object.values(resource)) {
    if (value && typeof value === "object") {
      collectKnownTypes(value, typeLookup);
    }
  }

  return typeLookup;
}

function coerceSpecificResourceSource(source: any, typeLookup: TypeLookup, fallbackType: string): any {
  if (Array.isArray(source)) {
    const coerced = source.map((item) => coerceSpecificResourceSource(item, typeLookup, fallbackType));
    return coerced.length === 1 ? coerced[0] : coerced;
  }
  if (typeof source === "string") {
    return {
      id: source,
      type: inferTypeById(source, typeLookup, fallbackType),
    };
  }
  if (!isPlainObject(source)) {
    return source;
  }

  toIdAndType(source);
  const sourceId = getId(source);
  if (sourceId && !getType(source)) {
    setType(source, inferTypeById(sourceId, typeLookup, fallbackType));
  }
  return source;
}

function coerceAnnotationTarget(target: any, typeLookup: TypeLookup, fallbackType: string): any {
  if (typeof target === "string") {
    return {
      id: target,
      type: inferTypeById(target, typeLookup, fallbackType),
    };
  }

  if (!isPlainObject(target)) {
    return target;
  }

  toIdAndType(target);
  const targetType = getType(target);

  if (!targetType && (target.source || target.selector || target.transform || target.action)) {
    setType(target, "SpecificResource");
  }

  if (getType(target) === "SpecificResource") {
    if (typeof target.source !== "undefined") {
      target.source = coerceSpecificResourceSource(target.source, typeLookup, fallbackType);
    } else {
      const targetId = getId(target);
      if (targetId) {
        target.source = {
          id: targetId,
          type: inferTypeById(targetId, typeLookup, fallbackType),
        };
      }
    }
    return target;
  }

  const targetId = getId(target);
  if (targetId && !getType(target)) {
    setType(target, inferTypeById(targetId, typeLookup, fallbackType));
  }
  return target;
}

function coerceAnnotation(annotation: any, typeLookup: TypeLookup, fallbackTargetType: string) {
  annotation.motivation = ensureArray(annotation.motivation);
  annotation.body = ensureArray(annotation.body);
  annotation.target = ensureArray(annotation.target).map((target: any) =>
    coerceAnnotationTarget(target, typeLookup, fallbackTargetType)
  );

  if (annotation.bodyValue && annotation.body.length === 0) {
    annotation.body = [
      {
        type: "TextualBody",
        value: annotation.bodyValue,
        language: annotation.language,
      },
    ];
    delete annotation.bodyValue;
  }
}

function coerceV4Shape(
  resource: any,
  typeLookup: TypeLookup,
  isTopLevel = false,
  containerTypeHint: string = "Canvas"
): any {
  if (Array.isArray(resource)) {
    return resource.map((item) => coerceV4Shape(item, typeLookup, false, containerTypeHint));
  }

  if (!isPlainObject(resource)) {
    return resource;
  }

  if (!isTopLevel && "@context" in resource) {
    delete resource["@context"];
  }

  toIdAndType(resource);
  const type = getType(resource);
  const currentContainerType = type && containerTypes.has(type) ? type : containerTypeHint;

  if (resource.placeholderCanvas && !resource.placeholderContainer) {
    resource.placeholderContainer = resource.placeholderCanvas;
    delete resource.placeholderCanvas;
  }
  if (resource.accompanyingCanvas && !resource.accompanyingContainer) {
    resource.accompanyingContainer = resource.accompanyingCanvas;
    delete resource.accompanyingCanvas;
  }

  if (type === "Annotation") {
    coerceAnnotation(resource, typeLookup, currentContainerType);
  }

  for (const [key, value] of Object.entries(resource)) {
    if (value && typeof value === "object") {
      resource[key] = coerceV4Shape(value, typeLookup, false, currentContainerType);
    }
  }

  if (isTopLevel && (type === "Manifest" || type === "Collection")) {
    resource["@context"] = PRESENTATION_4_CONTEXT;
  }

  return resource;
}

export function upgradePresentation3To4(entity: any): any {
  const clone = deepClone(entity);
  const typeLookup = collectKnownTypes(clone);
  return coerceV4Shape(clone, typeLookup, true);
}

export function upgradeToPresentation4(entity: any): any {
  const upgraded = convertPresentation2(deepClone(entity));
  const typeLookup = collectKnownTypes(upgraded);
  if (hasPresentation4Context(upgraded)) {
    return coerceV4Shape(upgraded, typeLookup, true);
  }
  return coerceV4Shape(upgraded, typeLookup, true);
}
