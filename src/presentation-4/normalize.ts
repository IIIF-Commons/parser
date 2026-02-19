import {
  emptyAgent as legacyEmptyAgent,
  emptyAnnotationPage as legacyEmptyAnnotationPage,
  emptyCanvas as legacyEmptyCanvas,
  emptyCollection as legacyEmptyCollection,
  emptyManifest as legacyEmptyManifest,
  emptyRange as legacyEmptyRange,
} from "../presentation-3/empty-types";
import type {
  NormalizedEntity as NormalizedEntityV4,
  Presentation4Entities,
  Presentation4NormalizeResult,
} from "../presentation-4-normalized/types";
import {
  emptyAgent,
  emptyAnnotation,
  emptyAnnotationCollection,
  emptyAnnotationPage,
  emptyCanvas,
  emptyCollection,
  emptyContentResource,
  emptyManifest,
  emptyRange,
  emptyScene,
  emptySpecificResource,
  emptyTimeline,
} from "./empty-types";
import { type TraversalContext, Traverse } from "./traverse";
import { upgradeToPresentation4 } from "./upgrade";
import {
  createValidationReport,
  EMPTY,
  getId,
  getType,
  HAS_PART,
  identifyResourceType,
  mintDeterministicId,
  PART_OF,
  PRESENTATION_3_CONTEXT,
  PRESENTATION_4_CONTEXT,
  type ValidationIssue,
  WILDCARD,
} from "./utilities";

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
  Agent: {},
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
    Agent: {},
  };
}

function mergeEntity(
  existing: any,
  incoming: any,
  context?: { parent?: any; isTopLevel?: boolean; legacyMode?: boolean }
): NormalizedEntityV4 {
  if (!incoming) {
    return existing;
  }

  if (Array.isArray(existing)) {
    if (!Array.isArray(incoming)) {
      throw new Error("Cannot merge array with non-array");
    }

    const merged = [...existing];
    for (const item of incoming) {
      if (item === null || typeof item === "undefined") {
        continue;
      }
      if (Array.isArray(item)) {
        merged.push(item);
      } else if (typeof item === "object" && item.id && item.type) {
        const existingIdx = merged.findIndex((e) => e && e.id === item.id && e.type === item.type);
        if (existingIdx >= 0) {
          merged[existingIdx] = mergeEntity(merged[existingIdx], item);
        } else {
          merged.push(item);
        }
      } else if (existing.indexOf(item) === -1) {
        merged.push(item);
      }
    }
    return merged as any;
  }

  if (existing && typeof existing === "object") {
    if (Array.isArray(incoming) || typeof incoming !== "object") {
      throw new Error("Cannot merge object with non-object");
    }

    const merged = { ...existing };
    const added: string[] = [];
    const unchanged: string[] = [];
    const existingKeys = Object.keys(existing).filter((key) => key !== HAS_PART && key !== "id" && key !== "type");
    const previouslyChangedValues: any = {};
    const incomingChangedValues: any = {};

    for (const [key, val] of Object.entries(incoming)) {
      if (key === HAS_PART || key === "id" || key === "type") {
        continue;
      }
      const currentVal = merged[key];
      if (currentVal === val) {
        unchanged.push(key);
      } else if (currentVal === EMPTY || !currentVal) {
        added.push(key);
        merged[key] = val;
      } else {
        if (currentVal && val) {
          previouslyChangedValues[key] = currentVal;
          incomingChangedValues[key] = val;
        }
        merged[key] = mergeEntity(currentVal, val);
        if (merged[key] === previouslyChangedValues[key]) {
          unchanged.push(key);
          delete previouslyChangedValues[key];
        }
      }
    }

    if (context && ((context.parent && context.parent.id) || context.isTopLevel)) {
      const newHasPart: any[] = [];
      const part: any = {};
      if (context.parent) {
        part[PART_OF] = context.parent.id;
      } else if (context.isTopLevel) {
        part[PART_OF] = existing.id;
      }

      if (merged[HAS_PART] && merged[HAS_PART].length) {
        const noExplicit = !(merged[HAS_PART] || []).find((r: any) => r["@explicit"]);
        const changedKeys = Object.keys(incomingChangedValues);
        const hasDiverged = context.legacyMode
          ? added.length > 0 || unchanged.length !== existingKeys.length
          : added.length > 0 || changedKeys.length > 0;
        if (noExplicit && hasDiverged) {
          for (const item of merged[HAS_PART]) {
            const first = { ...item };
            const previouslyChangedKeys = Object.keys(previouslyChangedValues);
            first["@explicit"] = true;
            for (const addedProperty of existingKeys) {
              if (addedProperty !== HAS_PART) {
                first[addedProperty] = WILDCARD;
              }
            }
            for (const changedKey of previouslyChangedKeys) {
              first[changedKey] = previouslyChangedValues[changedKey];
            }
            newHasPart.push(first);
          }
        } else {
          newHasPart.push(...merged[HAS_PART]);
        }

        if (hasDiverged) {
          part["@explicit"] = true;
          for (const addedProperty of added) {
            part[addedProperty] = WILDCARD;
          }
          for (const unchangedValue of unchanged) {
            part[unchangedValue] = WILDCARD;
          }
          for (const changedKey of changedKeys) {
            part[changedKey] = incomingChangedValues[changedKey];
          }
        }
      }

      part.id = merged.id;
      part.type = merged.type;
      newHasPart.push(part);
      const seenFramingKeys = new Set<string>();
      merged[HAS_PART] = newHasPart.filter((item: any) => {
        const key = `${item?.[PART_OF] || ""}|${item?.id || ""}|${item?.type || ""}|${item?.["@explicit"] ? 1 : 0}`;
        if (seenFramingKeys.has(key)) {
          return false;
        }
        seenFramingKeys.add(key);
        return true;
      });
    }

    return merged;
  }

  if (existing) {
    return existing;
  }
  return incoming;
}

function mergeEntities(
  existing: NormalizedEntityV4,
  incoming: Record<string, unknown>,
  context?: { parent?: any; isTopLevel?: boolean; legacyMode?: boolean }
): NormalizedEntityV4 {
  if (typeof existing === "string") {
    return existing as any;
  }

  if (incoming.id !== (existing as any).id) {
    throw new Error(
      `Can only merge entities with identical identifiers! ${incoming.type || "unknown"}(${incoming.id}) => ${
        (existing as any).type || "unknown"
      }(${(existing as any).id})`
    );
  }

  return mergeEntity({ ...existing }, incoming, context);
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
    case "Agent":
      return "Agent";
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

function ensureDefaultFields<T, R>(defaultResource: R) {
  return (resource: T): R => {
    return {
      ...defaultResource,
      ...resource,
    };
  };
}

const emptyAnnotationDefaults = {
  ...emptyAnnotation,
  body: undefined,
  target: undefined,
};

function addFlagForExternalResource<T extends { items?: unknown }>(resource: T): T {
  if (resource && typeof resource === "object" && typeof resource.items === "undefined") {
    (resource as any)["iiif-parser:isExternal"] = true;
  }
  return resource;
}

function isAnnotationTargetContext(context: TraversalContext): boolean {
  return context.path.includes(".target");
}

function skipOnAnnotationTarget<T extends (resource: any, context: TraversalContext) => any>(traversal: T): T {
  return (((resource: any, context: TraversalContext) => {
    if (isAnnotationTargetContext(context)) {
      return resource;
    }
    return traversal(resource, context);
  }) as unknown) as T;
}

function ensureRangeSupplementaryArray<T extends { supplementary?: unknown }>(resource: T): T {
  if (resource && typeof resource === "object") {
    const supplementary = (resource as any).supplementary;
    (resource as any).supplementary = Array.isArray(supplementary)
      ? supplementary
      : supplementary
        ? [supplementary]
        : [];
  }
  return resource;
}

function recordType(mapping: NormalizeResult["mapping"]) {
  return (forcedType?: string) => (resource: any, _context: TraversalContext) => {
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

function recordEntity(entities: Presentation4Entities, options: { legacyMode?: boolean } = {}) {
  const { legacyMode = false } = options;

  return (forcedType?: string) => (resource: any, context: TraversalContext) => {
    if (!resource || typeof resource !== "object") {
      return resource;
    }
    const id = getId(resource);
    if (!id) {
      return resource;
    }

    const inferredType = forcedType || identifyResourceType(resource);
    const storeType = mapTypeToStore(inferredType);
    if (Object.hasOwn(resource, "language")) {
      if (typeof resource.language === "string") {
        resource.language = [resource.language];
      } else if (Array.isArray(resource.language)) {
        resource.language = resource.language.filter((item: unknown): item is string => typeof item === "string");
      } else if (resource.language == null) {
        resource.language = [];
      }
    } else if (storeType === "ContentResource") {
      resource.language = [];
    }

    const current = entities[storeType][id];
    const mergeContext = {
      parent: context.parent,
      isTopLevel: context.path === "$",
      legacyMode,
    };
    entities[storeType][id] = current
      ? mergeEntities(current as any, resource, mergeContext)
      : mergeEntities({ id, type: getType(resource) || inferredType } as any, resource, mergeContext);

    return {
      id,
      type: storeType === "ContentResource" ? "ContentResource" : getType(resource) || inferredType,
    };
  };
}

export function normalize(input: unknown): NormalizeResult {
  const sourceVersion = detectSourceVersion(input as any);
  const isLegacySource = sourceVersion === 2 || sourceVersion === 3;
  const diagnostics: ValidationIssue[] = [];
  const originalContext = input && typeof input === "object" ? (input as any)["@context"] : undefined;
  const upgraded = upgradeToPresentation4(input);

  if (upgraded && typeof upgraded === "object") {
    if (isLegacySource) {
      upgraded["@context"] = sourceVersion === 2 ? PRESENTATION_3_CONTEXT : originalContext || PRESENTATION_3_CONTEXT;
    } else if (!upgraded["@context"]) {
      upgraded["@context"] = PRESENTATION_4_CONTEXT;
    }
  }

  const entities = getDefaultEntities();
  const mapping: NormalizeResult["mapping"] = {};

  const record = recordEntity(entities, { legacyMode: isLegacySource });
  const map = recordType(mapping);
  const shouldCoerceContainerTargets = isLegacySource;

  const contentResourceTraversals: Array<(resource: any, context: TraversalContext) => any> = [
    withId("ContentResource", diagnostics),
  ];
  if (!isLegacySource) {
    contentResourceTraversals.push(ensureDefaultFields(emptyContentResource));
  }
  contentResourceTraversals.push(
    skipOnAnnotationTarget(map("ContentResource")),
    skipOnAnnotationTarget(record("ContentResource"))
  );

  const specificResourceTraversals: Array<(resource: any, context: TraversalContext) => any> = [
    withId("SpecificResource", diagnostics),
    ensureDefaultFields(emptySpecificResource),
    skipOnAnnotationTarget(map("SpecificResource")),
    skipOnAnnotationTarget(record("SpecificResource")),
  ];

  const traversal = new Traverse(
    {
      collection: [
        ...(isLegacySource ? [addFlagForExternalResource] : []),
        withId("Collection", diagnostics),
        ensureDefaultFields((isLegacySource ? legacyEmptyCollection : emptyCollection) as any),
        map("Collection"),
        record("Collection"),
      ],
      manifest: [
        ...(isLegacySource ? [addFlagForExternalResource] : []),
        withId("Manifest", diagnostics),
        ensureDefaultFields((isLegacySource ? legacyEmptyManifest : emptyManifest) as any),
        map("Manifest"),
        record("Manifest"),
      ],
      timeline: [
        withId("Timeline", diagnostics),
        ensureDefaultFields(emptyTimeline),
        map("Timeline"),
        record("Timeline"),
      ],
      canvas: [
        withId("Canvas", diagnostics),
        ensureDefaultFields((isLegacySource ? legacyEmptyCanvas : emptyCanvas) as any),
        map("Canvas"),
        record("Canvas"),
      ],
      scene: [withId("Scene", diagnostics), ensureDefaultFields(emptyScene), map("Scene"), record("Scene")],
      annotationCollection: [
        withId("AnnotationCollection", diagnostics),
        ensureDefaultFields(emptyAnnotationCollection),
        map("AnnotationCollection"),
        record("AnnotationCollection"),
      ],
      annotationPage: [
        ...(isLegacySource ? [addFlagForExternalResource] : []),
        withId("AnnotationPage", diagnostics),
        ensureDefaultFields((isLegacySource ? legacyEmptyAnnotationPage : emptyAnnotationPage) as any),
        map("AnnotationPage"),
        record("AnnotationPage"),
      ],
      annotation: [
        withId("Annotation", diagnostics),
        ensureDefaultFields(emptyAnnotationDefaults),
        map("Annotation"),
        record("Annotation"),
      ],
      contentResource: contentResourceTraversals,
      range: [
        withId("Range", diagnostics),
        ensureDefaultFields((isLegacySource ? legacyEmptyRange : emptyRange) as any),
        ensureRangeSupplementaryArray,
        map("Range"),
        record("Range"),
      ],
      agent: [
        withId("Agent", diagnostics),
        ensureDefaultFields((isLegacySource ? legacyEmptyAgent : emptyAgent) as any),
        map("Agent"),
        record("Agent"),
      ],
      specificResource: specificResourceTraversals,
    },
    {
      coerceContainerTargetsToSpecificResources: shouldCoerceContainerTargets,
      legacyPresentation3Behavior: isLegacySource,
    }
  );

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
    resource: { id: resourceId, type: mapTypeToStore(resourceType) },
    diagnostics: report.issues,
    sourceVersion,
  };
}
