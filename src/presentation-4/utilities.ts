export const EMPTY_ARRAY = Object.freeze([]) as readonly never[];
export const EMPTY_OBJECT = Object.freeze({}) as Readonly<Record<string, never>>;
export const PRESENTATION_4_CONTEXT = "http://iiif.io/api/presentation/4/context.json";
export const PRESENTATION_3_CONTEXT = "http://iiif.io/api/presentation/3/context.json";
export const WILDCARD = Object.freeze({});
export const HAS_PART = "iiif-parser:hasPart";
export const PART_OF = "iiif-parser:partOf";
export const EMPTY = Object.freeze([]);

export type ValidationSeverity = "error" | "warning" | "info";

export type ValidationIssue = {
  code: string;
  severity: ValidationSeverity;
  message: string;
  path: string;
  resourceType?: string;
  resourceId?: string;
  specRef?: string;
};

export type ValidationReport = {
  valid: boolean;
  issues: ValidationIssue[];
  stats: {
    errors: number;
    warnings: number;
    info: number;
  };
  reporting?: {
    classRequirements?: {
      nodesChecked: number;
      mustChecks: number;
      shouldChecks: number;
      allowedPropertyChecks: number;
      mustNotChecks: number;
    };
  };
};

export function createValidationReport(
  issues: ValidationIssue[],
  reporting?: ValidationReport["reporting"]
): ValidationReport {
  const stats = {
    errors: issues.filter((issue) => issue.severity === "error").length,
    warnings: issues.filter((issue) => issue.severity === "warning").length,
    info: issues.filter((issue) => issue.severity === "info").length,
  };

  return {
    valid: stats.errors === 0,
    issues,
    stats,
    reporting,
  };
}

export function isWildcard(object: any) {
  if (object === WILDCARD || (object && typeof object === "object" && Object.keys(object).length === 0)) {
    return true;
  }
  for (const i in object) {
    return false;
  }
  return true;
}

export function isPlainObject(value: unknown): value is Record<string, any> {
  return !!value && Object.prototype.toString.call(value) === "[object Object]";
}

export function deepClone<T>(value: T): T {
  if (typeof structuredClone !== "undefined") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

export function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === null || typeof value === "undefined") {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

export function ensureStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  if (typeof value === "string") {
    return [value];
  }
  return [];
}

export function getId(resource: any): string | undefined {
  if (!resource || typeof resource !== "object") {
    return undefined;
  }
  if (typeof resource.id === "string") {
    return resource.id;
  }
  if (typeof resource["@id"] === "string") {
    return resource["@id"];
  }
  return undefined;
}

export function getType(resource: any): string | undefined {
  if (!resource || typeof resource !== "object") {
    return undefined;
  }
  if (typeof resource.type === "string") {
    return resource.type;
  }
  if (typeof resource["@type"] === "string") {
    return resource["@type"];
  }
  if (Array.isArray(resource["@type"])) {
    return resource["@type"].find((type: unknown) => typeof type === "string");
  }
  return undefined;
}

export function setId(resource: Record<string, any>, id: string) {
  resource.id = id;
  delete resource["@id"];
}

export function setType(resource: Record<string, any>, type: string) {
  resource.type = type;
  delete resource["@type"];
}

export function isSpecificResource(resource: any): boolean {
  return getType(resource) === "SpecificResource";
}

export function isSelector(resource: any): boolean {
  const type = getType(resource);
  return !!type && type.endsWith("Selector");
}

export function isQuantity(resource: any): boolean {
  return getType(resource) === "Quantity";
}

export function isServiceLike(resource: any): boolean {
  if (!resource || typeof resource !== "object") {
    return false;
  }
  const type = getType(resource);
  if (type && type.includes("Service")) {
    return true;
  }
  return typeof resource.profile === "string" || Array.isArray(resource.service);
}

export function hashString(input: string): string {
  let hash = 5381;
  let index = input.length;
  while (index) {
    hash = (hash * 33) ^ input.charCodeAt(--index);
  }
  const hex = (hash >>> 0).toString(16);
  return hex.length % 2 === 1 ? `0${hex}` : hex;
}

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    const keys = Object.keys(object).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(object[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function mintDeterministicId(resource: unknown, type: string, path = "$"): string {
  const fingerprint = stableStringify({ type, path, resource });
  return `vault://iiif-parser/v4/${type}/${hashString(fingerprint)}`;
}

export const containerTypes = new Set(["Timeline", "Canvas", "Scene"]);
export const structuralTypes = new Set(["Collection", "Manifest", "Range"]);
export const annotationTypes = new Set(["Annotation", "AnnotationPage", "AnnotationCollection"]);
export const sceneComponentTypes = new Set([
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
export const transformTypes = new Set(["RotateTransform", "ScaleTransform", "TranslateTransform"]);
export const contentTypes = new Set([
  "Image",
  "Audio",
  "Sound",
  "Video",
  "Model",
  "Text",
  "TextualBody",
  "Dataset",
  "Choice",
]);

export function identifyResourceType(resource: any, typeHint?: string): string {
  if (Array.isArray(resource)) {
    if (typeHint) {
      return typeHint;
    }
    throw new Error("Resource type is not known");
  }

  if (!resource || typeof resource !== "object") {
    if (typeHint) {
      return typeHint;
    }
    throw new Error("Resource must be an object");
  }

  const type = getType(resource);
  if (type) {
    if (containerTypes.has(type)) {
      return type;
    }
    if (structuralTypes.has(type)) {
      return type;
    }
    if (annotationTypes.has(type)) {
      return type;
    }
    if (type === "SpecificResource") {
      return "SpecificResource";
    }
    if (type === "Agent") {
      return "Agent";
    }
    if (type === "Quantity") {
      return "Quantity";
    }
    if (type.endsWith("Selector")) {
      return "Selector";
    }
    if (transformTypes.has(type)) {
      return "Transform";
    }
    if (type.includes("Service") || type === "Service") {
      return "Service";
    }
    if (sceneComponentTypes.has(type) || contentTypes.has(type)) {
      return "ContentResource";
    }
    return "ContentResource";
  }

  if (isServiceLike(resource)) {
    return "Service";
  }

  if (typeHint) {
    return typeHint;
  }

  throw new Error("Resource type is not known");
}
