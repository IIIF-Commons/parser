import { describe, expect, test } from "vitest";
import { normalize, serialize, serializeConfigPresentation3 } from "../../../src";
import { upgrade } from "../../../src/upgrader";
import sceneManifest from "./fixtures/scene-manifest.json";
import timelineManifest from "./fixtures/timeline-manifest.json";

const presentation3Context = "http://iiif.io/api/presentation/3/context.json";
const timelineId = "https://example.org/iiif/presentation-4/timeline/1";

describe("default Presentation 3 compatibility", () => {
  test("projects a Presentation 4 Timeline to a Presentation 3 Canvas", () => {
    const projected = upgrade(timelineManifest) as any;

    expect(projected["@context"]).toBe(presentation3Context);
    expect(projected.items[0]).toMatchObject({
      id: timelineId,
      type: "Canvas",
      duration: 30,
    });
    expect(projected.items[0].width).toBeUndefined();
    expect(projected.items[0].height).toBeUndefined();
    expect(projected.items[0].items[0].items[0].target).toBe(timelineId);
  });

  test("normalizes Presentation 4 through the ordinary Presentation 3 API", () => {
    const normalized = normalize(timelineManifest);
    const serialized = serialize<any>(
      {
        entities: normalized.entities,
        mapping: normalized.mapping,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation3
    );

    expect((normalized.mapping as Record<string, string>)[timelineId]).toBe("Canvas");
    expect(normalized.resource).toEqual({
      id: timelineManifest.id,
      type: "Manifest",
    });
    expect(serialized["@context"]).toBe(presentation3Context);
    expect(serialized.items[0]).toMatchObject({
      id: timelineId,
      type: "Canvas",
      duration: 30,
    });
    expect(JSON.stringify(serialized)).not.toContain("__$UNSET$__");
  });

  test("rejects Presentation 4 Scene resources with an explicit diagnostic", () => {
    expect(() => upgrade(sceneManifest)).toThrow(
      "Presentation 4 -> 3 downgrade unsupported: Scene container"
    );
    expect(() => normalize(sceneManifest)).toThrow(
      "Presentation 4 -> 3 downgrade unsupported: Scene container"
    );
  });

  test("does not silently rewrite a Scene reference as a Canvas", () => {
    const manifest = structuredClone(timelineManifest) as any;
    manifest.items[0].items[0].items[0].target = {
      id: "https://example.org/iiif/presentation-4/scene/external",
      type: "Scene",
    };

    expect(() => upgrade(manifest)).toThrow(
      "Presentation 4 -> 3 downgrade unsupported: Scene container"
    );
  });

  test("preserves the existing Presentation 3 upgrader path", () => {
    const manifest = {
      "@context": presentation3Context,
      id: "https://example.org/iiif/presentation-3/manifest",
      type: "Manifest",
      label: { en: ["Presentation 3"] },
      items: [],
    };

    expect(upgrade(manifest)).toBe(manifest);
  });
});
