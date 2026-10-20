import manifest from "../../fixtures/presentation-2/iiif-multiple-descriptions.json";
import { convertPresentation2, convertLanguageMapping } from "../../src/presentation-2";

describe("mixed Presentation 2 language values (#39)", () => {
  test("retains both descriptions from the official Presentation 2 fixture", () => {
    // Source: https://iiif.io/api/presentation/2.1/example/fixtures/6/manifest.json
    expect(convertPresentation2(structuredClone(manifest)).summary).toEqual({
      none: ["This is one description"],
      en: ["This is another"],
    });
  });

  test("retains repeated languages and untagged values in their original order", () => {
    expect(
      convertLanguageMapping([
        "First",
        { "@value": "English", "@language": "en" },
        "Second",
        { "@value": "Another English", "@language": "en" },
        { "@value": "Untagged" } as any,
      ])
    ).toEqual({ none: ["First", "Second", "Untagged"], en: ["English", "Another English"] });
  });
});
