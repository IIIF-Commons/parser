import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { describe, expect, test } from "vitest";
import { Traverse } from "../../src/presentation-4";

describe("presentation-4 traverse", () => {
  test("dispatches callbacks across mixed resource types", () => {
    const fixture = JSON.parse(
      readFileSync(join(cwd(), "fixtures/presentation-4/21-scene-within-canvas.json"), "utf8")
    );

    const seen = {
      manifest: 0,
      scene: 0,
      canvas: 0,
      range: 0,
      annotationPage: 0,
      annotation: 0,
      selector: 0,
      contentResource: 0,
    };

    const traverse = new Traverse({
      manifest: [() => void (seen.manifest += 1)],
      scene: [() => void (seen.scene += 1)],
      canvas: [() => void (seen.canvas += 1)],
      range: [() => void (seen.range += 1)],
      annotationPage: [() => void (seen.annotationPage += 1)],
      annotation: [() => void (seen.annotation += 1)],
      selector: [() => void (seen.selector += 1)],
      contentResource: [() => void (seen.contentResource += 1)],
    });

    traverse.traverseUnknown(fixture, { path: "$" });

    expect(seen.manifest).toBeGreaterThan(0);
    expect(seen.scene).toBeGreaterThan(0);
    expect(seen.canvas).toBeGreaterThan(0);
    expect(seen.range).toBeGreaterThan(0);
    expect(seen.annotationPage).toBeGreaterThan(0);
    expect(seen.annotation).toBeGreaterThan(0);
    expect(seen.selector).toBeGreaterThan(0);
    expect(seen.contentResource).toBeGreaterThan(0);
  });
});
