import { convertPresentation2 } from "./presentation-2/upgrader";
import type { Collection, Manifest } from "./presentation-3/types";
import { normalize as normalizePresentation4 } from "./presentation-4/normalize";
import { serializeConfigPresentation3 } from "./presentation-4/serialize-presentation-3";
import { serialize as serializePresentation4 } from "./presentation-4/serialize";

function hasPresentation4Context(entity: any): boolean {
  const context = entity?.["@context"];
  return (Array.isArray(context) ? context : [context]).some(
    (value) => typeof value === "string" && value.includes("/presentation/4/")
  );
}

function containsScene(value: any, seen = new WeakSet<object>()): boolean {
  if (!value || typeof value !== "object" || seen.has(value)) {
    return false;
  }
  seen.add(value);
  if (value.type === "Scene" || value["@type"] === "Scene") {
    return true;
  }
  return Object.values(value).some((item) => containsScene(item, seen));
}

export function upgrade(entity: any): Manifest | Collection {
  if (!hasPresentation4Context(entity)) {
    return convertPresentation2(entity);
  }
  if (containsScene(entity)) {
    throw new Error("Presentation 4 -> 3 downgrade unsupported: Scene container");
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
