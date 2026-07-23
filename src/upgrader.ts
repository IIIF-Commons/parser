import { convertPresentation2 } from "./presentation-2/upgrader";
import type { Collection, Manifest } from "./presentation-3/types";
import { normalize as normalizePresentation4 } from "./presentation-4/normalize";
import { serializeConfigPresentation3 } from "./presentation-4/serialize-presentation-3";
import { serialize as serializePresentation4 } from "./presentation-4/serialize";
import type { ValidationIssue } from "./presentation-4/utilities";

const sceneUnsupportedMessage = "Presentation 4 -> 3 downgrade unsupported: Scene container";

export type Presentation4CompatibilityDiagnostic = ValidationIssue & {
  code: "presentation-4-scene-unsupported";
  severity: "error";
  resourceType: "Scene";
};

export class Presentation4CompatibilityError extends Error {
  readonly diagnostics: readonly Presentation4CompatibilityDiagnostic[];

  constructor(diagnostics: Presentation4CompatibilityDiagnostic[]) {
    super(sceneUnsupportedMessage);
    this.name = "Presentation4CompatibilityError";
    this.diagnostics = diagnostics;
  }
}

function hasPresentation4Context(entity: any): boolean {
  const context = entity?.["@context"];
  return (Array.isArray(context) ? context : [context]).some(
    (value) => typeof value === "string" && value.includes("/presentation/4/")
  );
}

function findScenes(
  value: any,
  path: string,
  diagnostics: Presentation4CompatibilityDiagnostic[],
  seen: WeakSet<object>
): void {
  if (!value || typeof value !== "object" || seen.has(value)) {
    return;
  }
  seen.add(value);

  if (value.type === "Scene" || value["@type"] === "Scene") {
    diagnostics.push({
      code: "presentation-4-scene-unsupported",
      severity: "error",
      message: sceneUnsupportedMessage,
      path,
      resourceType: "Scene",
      resourceId: value.id || value["@id"],
    });
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => findScenes(item, `${path}[${index}]`, diagnostics, seen));
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    findScenes(item, `${path}.${key}`, diagnostics, seen);
  }
}

export function getPresentation3CompatibilityDiagnostics(entity: unknown): Presentation4CompatibilityDiagnostic[] {
  if (!hasPresentation4Context(entity)) {
    return [];
  }

  const diagnostics: Presentation4CompatibilityDiagnostic[] = [];
  findScenes(entity, "$", diagnostics, new WeakSet<object>());
  return diagnostics;
}

export function upgrade(entity: any): Manifest | Collection {
  if (!hasPresentation4Context(entity)) {
    return convertPresentation2(entity);
  }

  const diagnostics = getPresentation3CompatibilityDiagnostics(entity);
  if (diagnostics.length) {
    throw new Presentation4CompatibilityError(diagnostics);
  }

  const normalized = normalizePresentation4(entity);
  return serializePresentation4<Manifest | Collection>(
    {
      entities: normalized.entities,
      mapping: normalized.mapping,
      requests: {},
    },
    normalized.resource,
    serializeConfigPresentation3
  );
}
