import { promises } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { describe, expect } from "vitest";
import { normalize, serialize, serializeConfigPresentation4 } from "../../src/presentation-4";
import { validatePresentation4 } from "../../src/presentation-4/validator";

const { readFile, readdir } = promises;

describe("Presentation 4 smoke tests", async () => {
  const skipThese = [
    // Contains intentionally cyclic references in `partOf` metadata.
    "10-directional-light-rotated.json",
  ];

  const files = await readdir(join(cwd(), "fixtures/presentation-4"));
  const tests = files.filter((item) => item.endsWith(".json") && !skipThese.includes(item)).map((item) => [item]);

  test.each(tests)("Smoke test: ./fixtures/presentation-4/%s", (async (id: string) => {
    const json = await readFile(join(cwd(), "fixtures/presentation-4", `${id}`));
    const jsonString = json.toString();
    const manifest = JSON.parse(jsonString);
    const result = normalize(manifest);

    expect(result.resource.type).toEqual("Manifest");
    expect(result.entities.Manifest[result.resource.id]).toBeTruthy();

    const report = validatePresentation4(manifest, { mode: "tolerant" });
    expect(Array.isArray(report.issues)).toBe(true);

    const reserialized = serialize(
      {
        mapping: result.mapping as any,
        entities: result.entities as any,
        requests: {},
      },
      result.resource,
      serializeConfigPresentation4
    ) as any;

    expect(reserialized).toHaveProperty("type");
    expect(reserialized).toHaveProperty("id");
    expect(reserialized.type).toEqual(manifest.type);
    expect(reserialized.id).toEqual(manifest.id);
    expect(reserialized["@context"]).toEqual("http://iiif.io/api/presentation/4/context.json");
  }) as any);
});
