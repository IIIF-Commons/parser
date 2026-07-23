import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { validateAuthoredPresentation4, validatePresentation4 } from "../../../src/presentation-4/validator";

const goldDirectory = join(import.meta.dirname, "../fixtures/gold");
const goldFixtures = readdirSync(goldDirectory)
  .filter((file) => file.endsWith(".json"))
  .sort();

describe("Presentation 4 authored validation", () => {
  test.each(goldFixtures)("accepts gold fixture %s without changing it", (file) => {
    const input = JSON.parse(readFileSync(join(goldDirectory, file), "utf8"));
    const before = structuredClone(input);

    const report = validateAuthoredPresentation4(input);

    expect(report.valid, JSON.stringify(report.issues, null, 2)).toBe(true);
    expect(report.stats.errors).toBe(0);
    expect(input).toEqual(before);
  });

  test("accepts Manifest and Collection references in Collection Page items", () => {
    const input = JSON.parse(readFileSync(join(goldDirectory, "collection-page.json"), "utf8"));

    const report = validateAuthoredPresentation4(input);

    expect(report.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "class-requirement-must",
          path: expect.stringMatching(/items\[\d+\]\.items$/),
        }),
      ])
    );
  });

  test("rejects input that only becomes Presentation 4 after upgrading", () => {
    const presentation3 = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/iiif/manifest/v3",
      type: "Manifest",
      label: { en: ["Presentation 3"] },
      items: [
        {
          id: "https://example.org/iiif/canvas/v3",
          type: "Canvas",
          height: 100,
          width: 100,
          items: [],
        },
      ],
    };

    const authoredReport = validateAuthoredPresentation4(presentation3);
    const compatibilityReport = validatePresentation4(presentation3);

    expect(authoredReport.valid).toBe(false);
    expect(authoredReport.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "presentation-4-context-required" })])
    );
    expect(compatibilityReport.issues).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "presentation-4-context-required" })])
    );
  });

  test("rejects direct body and target arrays instead of repairing them", () => {
    const input = JSON.parse(readFileSync(join(goldDirectory, "manifest-canvas.json"), "utf8"));
    const annotation = input.items[0].items[0].items[0];
    annotation.body = [annotation.body];
    annotation.target = [annotation.target];

    const report = validateAuthoredPresentation4(input);

    expect(report.valid).toBe(false);
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "annotation-body-array-forbidden" }),
        expect.objectContaining({ code: "annotation-target-array-forbidden" }),
      ])
    );
  });

  test.each(["Choice", "Composite", "List", "Independents"])(
    "requires non-empty items on %s annotation aggregates",
    (type) => {
      const input = JSON.parse(readFileSync(join(goldDirectory, "manifest-canvas.json"), "utf8"));
      input.items[0].items[0].items[0].body = { type, items: [] };

      const report = validateAuthoredPresentation4(input);

      expect(report.valid).toBe(false);
      expect(report.issues).toEqual(
        expect.arrayContaining([expect.objectContaining({ code: "annotation-body-aggregate-items-empty" })])
      );
    }
  );

  test("throws with the authored report in strict mode", () => {
    expect(() =>
      validateAuthoredPresentation4(
        {
          id: "https://example.org/iiif/manifest/no-context",
          type: "Manifest",
          label: { en: ["No context"] },
          items: [],
        },
        { mode: "strict" }
      )
    ).toThrow(/presentation-4-context-required/);
  });
});
