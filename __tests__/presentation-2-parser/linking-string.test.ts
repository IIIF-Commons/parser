import manifest from "../../fixtures/presentation-2/iiif-string-seealso.json";
import { convertPresentation2, presentation2to3 } from "../../src/presentation-2";

describe("Presentation 2 linking strings (#40)", () => {
  test("retains the seeAlso URI from the official Presentation 2 fixture", () => {
    // Source: https://iiif.io/api/presentation/2.1/example/fixtures/8/manifest.json
    expect(convertPresentation2(structuredClone(manifest)).seeAlso).toEqual([
      { id: manifest.seeAlso, type: "unknown" },
    ]);
  });

  test("handles mixed links without losing object metadata", () => {
    const result = presentation2to3.traverseManifest({
      "@id": "https://example.org/manifest",
      "@type": "sc:Manifest",
      seeAlso: [
        "https://example.org/metadata",
        {
          "@id": "https://example.org/data.json",
          format: "application/json",
          label: "Data",
        },
      ],
      rendering: "https://example.org/book.pdf",
    } as any);
    expect(result.seeAlso).toEqual([
      { id: "https://example.org/metadata", type: "unknown" },
      { id: "https://example.org/data.json", type: "Dataset", format: "application/json", label: { none: ["Data"] } },
    ]);
    expect(result.rendering).toEqual([{ id: "https://example.org/book.pdf", type: "unknown" }]);
  });
});
