import { Traverse, TraversalContext } from "./traverse";
import {
  ValidationIssue,
  createValidationReport,
  getId,
  getType,
  identifyResourceType,
  mintDeterministicId,
  PRESENTATION_3_CONTEXT,
  PRESENTATION_4_CONTEXT,
} from "./utilities";
import { upgradeToPresentation4 } from "./upgrade";
import type {
  NormalizedEntityV4,
  Presentation4Entities,
  Presentation4NormalizeResult,
} from "../presentation-4-normalized/types";

export type NormalizeResult = Presentation4NormalizeResult;

export const defaultEntities: Presentation4Entities = {
  Collection: {},
  Manifest: {},
  Timeline: {},
  Canvas: {},
  Scene: {},
  AnnotationPage: {},
  AnnotationCollection: {},
  Annotation: {},
  ContentResource: {},
  Range: {},
  Service: {},
  Selector: {},
  Agent: {},
  Quantity: {},
  Transform: {},
};

export function getDefaultEntities(): Presentation4Entities {
  return {
    Collection: {},
    Manifest: {},
    Timeline: {},
    Canvas: {},
    Scene: {},
    AnnotationPage: {},
    AnnotationCollection: {},
    Annotation: {},
    ContentResource: {},
    Range: {},
    Service: {},
    Selector: {},
    Agent: {},
    Quantity: {},
    Transform: {},
  };
}

function mergeEntity(
  existing: NormalizedEntityV4 | Record<string, unknown> | undefined,
  incoming: Record<string, unknown>
): NormalizedEntityV4 {
  if (!existing) {
    return incoming;
  }

  const merged: NormalizedEntityV4 = { ...existing };
  for (const [key, value] of Object.entries(incoming)) {
    if (typeof value === "undefined") {
      continue;
    }

    const current = merged[key];
    if (Array.isArray(current) && Array.isArray(value)) {
      const dedupe = new Map<string, any>();
      for (const item of current) {
        const hash =
          typeof item === "object" && item && item.id ? `${item.id}:${item.type || ""}` : JSON.stringify(item);
        dedupe.set(hash, item);
      }
      for (const item of value) {
        const hash =
          typeof item === "object" && item && item.id ? `${item.id}:${item.type || ""}` : JSON.stringify(item);
        if (!dedupe.has(hash)) {
          dedupe.set(hash, item);
        }
      }
      merged[key] = Array.from(dedupe.values());
      continue;
    }

    if (
      current &&
      typeof current === "object" &&
      value &&
      typeof value === "object" &&
      !Array.isArray(current) &&
      !Array.isArray(value)
    ) {
      merged[key] = mergeEntity(current as Record<string, unknown>, value as Record<string, unknown>);
      continue;
    }

    if (typeof current === "undefined" || current === null || current === "") {
      merged[key] = value;
      continue;
    }
  }
  return merged;
}

function detectSourceVersion(input: any): 2 | 3 | 4 | "unknown" {
  if (!input || typeof input !== "object") {
    return "unknown";
  }

  const context = input["@context"];
  const contexts = Array.isArray(context) ? context : [context];
  for (const item of contexts) {
    if (typeof item !== "string") {
      continue;
    }
    if (item.includes("/presentation/4/")) {
      return 4;
    }
    if (item === PRESENTATION_3_CONTEXT || item.includes("/presentation/3/")) {
      return 3;
    }
    if (item.includes("/presentation/2/") || item.includes("shared-canvas.org/ns/context.json")) {
      return 2;
    }
  }

  const type = input["@type"];
  if (type === "sc:Manifest" || type === "sc:Collection") {
    return 2;
  }
  return "unknown";
}

function normalizeEntityReference(resource: any, type: string): any {
  if (typeof resource === "string") {
    return { id: resource, type };
  }
  return resource;
}

function mapTypeToStore(type: string): keyof Presentation4Entities {
  switch (type) {
    case "Collection":
      return "Collection";
    case "Manifest":
      return "Manifest";
    case "Timeline":
      return "Timeline";
    case "Canvas":
      return "Canvas";
    case "Scene":
      return "Scene";
    case "AnnotationPage":
      return "AnnotationPage";
    case "AnnotationCollection":
      return "AnnotationCollection";
    case "Annotation":
      return "Annotation";
    case "Range":
      return "Range";
    case "Service":
      return "Service";
    case "Agent":
      return "Agent";
    case "Selector":
      return "Selector";
    case "Quantity":
      return "Quantity";
    case "Transform":
      return "Transform";
    default:
      return "ContentResource";
  }
}

function withId(
  type: string,
  diagnostics: ValidationIssue[],
  pathPrefix = "$"
): (resource: any, context: TraversalContext) => any {
  return (resource, context) => {
    if (!resource || typeof resource !== "object") {
      return normalizeEntityReference(resource, type);
    }
    const id = getId(resource);
    if (!id) {
      const mintedId = mintDeterministicId(resource, type, context.path || pathPrefix);
      resource.id = mintedId;
      diagnostics.push({
        code: "minted-id",
        severity: "warning",
        message: `Missing id minted for ${type}`,
        path: context.path || pathPrefix,
        resourceType: type,
        resourceId: mintedId,
      });
    }
    if (!getType(resource)) {
      resource.type = type;
    }
    return resource;
  };
}

function recordType(mapping: NormalizeResult["mapping"]) {
  return (forcedType?: string) => (resource: any) => {
    if (!resource || typeof resource !== "object") {
      return resource;
    }
    const id = getId(resource);
    if (!id) {
      return resource;
    }
    const inferredType = forcedType || identifyResourceType(resource);
    mapping[id] = mapTypeToStore(inferredType);
    return resource;
  };
}

function recordEntity(entities: Presentation4Entities) {
  return (forcedType?: string) => (resource: any) => {
    if (!resource || typeof resource !== "object") {
      return resource;
    }
    const id = getId(resource);
    if (!id) {
      return resource;
    }

    const inferredType = forcedType || identifyResourceType(resource);
    const storeType = mapTypeToStore(inferredType);
    const current = entities[storeType][id];
    entities[storeType][id] = current ? mergeEntity(current, resource) : resource;

    return {
      id,
      type: storeType === "ContentResource" ? "ContentResource" : getType(resource) || inferredType,
    };
  };
}

export function normalize(input: unknown): NormalizeResult {
  const sourceVersion = detectSourceVersion(input as any);
  const diagnostics: ValidationIssue[] = [];
  const upgraded = upgradeToPresentation4(input);

  if (upgraded && typeof upgraded === "object" && !upgraded["@context"]) {
    upgraded["@context"] = PRESENTATION_4_CONTEXT;
  }

  const entities = getDefaultEntities();
  const mapping: NormalizeResult["mapping"] = {};

  const record = recordEntity(entities);
  const map = recordType(mapping);

  const traversal = new Traverse({
    collection: [withId("Collection", diagnostics), map("Collection"), record("Collection")],
    manifest: [withId("Manifest", diagnostics), map("Manifest"), record("Manifest")],
    timeline: [withId("Timeline", diagnostics), map("Timeline"), record("Timeline")],
    canvas: [withId("Canvas", diagnostics), map("Canvas"), record("Canvas")],
    scene: [withId("Scene", diagnostics), map("Scene"), record("Scene")],
    annotationCollection: [
      withId("AnnotationCollection", diagnostics),
      map("AnnotationCollection"),
      record("AnnotationCollection"),
    ],
    annotationPage: [withId("AnnotationPage", diagnostics), map("AnnotationPage"), record("AnnotationPage")],
    annotation: [withId("Annotation", diagnostics), map("Annotation"), record("Annotation")],
    contentResource: [withId("ContentResource", diagnostics), map("ContentResource"), record("ContentResource")],
    range: [withId("Range", diagnostics), map("Range"), record("Range")],
    service: [withId("Service", diagnostics), map("Service"), record("Service")],
    selector: [withId("Selector", diagnostics), map("Selector"), record("Selector")],
    quantity: [withId("Quantity", diagnostics), map("Quantity"), record("Quantity")],
    transform: [withId("Transform", diagnostics), map("Transform"), record("Transform")],
    agent: [withId("Agent", diagnostics), map("Agent"), record("Agent")],
    specificResource: [withId("SpecificResource", diagnostics)],
  });

  const resource = traversal.traverseUnknown(upgraded, { path: "$" });
  const resourceId = getId(resource);
  const resourceType = getType(resource);

  if (!resourceId || !resourceType) {
    throw new Error("Top level resource did not resolve to an id/type pair");
  }

  const report = createValidationReport(diagnostics);

  return {
    entities,
    mapping,
    resource: { id: resourceId, type: resourceType },
    diagnostics: report.issues,
    sourceVersion,
  };
}
