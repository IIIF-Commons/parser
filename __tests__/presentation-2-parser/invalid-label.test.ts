import collection from "../../fixtures/presentation-2/leipzig-invalid-label-collection.json";
import { convertPresentation2, presentation2to3 } from "../../src/presentation-2";

describe("Presentation 2 @label compatibility (#43)", () => {
  test("retains the Leipzig collection's manifest labels", () => {
    // Source: https://iiif.ub.uni-leipzig.de/static/collections/misc/cdvost2018.json
    const result = convertPresentation2(structuredClone(collection)) as any;
    expect(result.items).toHaveLength(collection.manifests.length);
    result.items.forEach((item: any, index: number) => {
      expect(item.label).toEqual({ none: [collection.manifests[index]!["@label"]] });
    });
  });

  test("preserves empty-label behavior and falls back to @label", () => {
    const input = { "@id": "https://example.org/canvas", "@type": "sc:Canvas", label: "" };
    expect(presentation2to3.traverseCanvas({ ...input } as any).label).toBeUndefined();
    expect(presentation2to3.traverseCanvas({ ...input, "@label": "Fallback" } as any).label).toEqual({
      none: ["Fallback"],
    });
  });

  test("prefers label when both spellings are supplied", () => {
    expect(
      presentation2to3.traverseCanvas({
        "@id": "https://example.org/canvas",
        "@type": "sc:Canvas",
        label: "Correct",
        "@label": "Fallback",
      } as any).label
    ).toEqual({ none: ["Correct"] });
  });
});
