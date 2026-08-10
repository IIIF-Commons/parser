import { describe, expect, test } from "vitest";
import { validateAuthoredPresentation3 } from "../../src/presentation-3/validator";

function manifest() {
  return {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: "https://example.org/manifest",
    type: "Manifest",
    label: { en: ["Example"] },
    items: [
      {
        id: "https://example.org/canvas/1",
        type: "Canvas",
        label: { en: ["Page 1"] },
        width: 1000,
        height: 800,
        items: [
          {
            id: "https://example.org/page/1",
            type: "AnnotationPage",
            items: [
              {
                id: "https://example.org/annotation/1",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://example.org/image.jpg",
                  type: "Image",
                  format: "image/jpeg",
                },
                target: "https://example.org/canvas/1",
              },
            ],
          },
        ],
      },
    ],
  };
}

describe("Presentation 3 authored validation", () => {
  test("accepts a Presentation 3 manifest without modifying it", () => {
    const input = manifest();
    const before = structuredClone(input);

    const report = validateAuthoredPresentation3(input);

    expect(report.valid, JSON.stringify(report.issues, null, 2)).toBe(true);
    expect(report.stats.errors).toBe(0);
    expect(input).toEqual(before);
  });

  test("reports context, required property and structural errors", () => {
    const input = manifest();
    input["@context"] = "http://iiif.io/api/presentation/4/context.json";
    delete (input as Partial<typeof input>).label;
    input.items = [{ ...input.items[0]!, type: "Range" }] as typeof input.items;

    const report = validateAuthoredPresentation3(input);

    expect(report.valid).toBe(false);
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "presentation-3-context-required", path: "$.@context" }),
        expect.objectContaining({ code: "class-requirement-must", path: "$.label" }),
        expect.objectContaining({ code: "presentation-3-item-type", path: "$.items[0]" }),
      ])
    );
  });

  test("strict mode throws with the validation report attached", () => {
    expect(() => validateAuthoredPresentation3(null, { mode: "strict" })).toThrow("presentation-3-document-object");
  });
});
