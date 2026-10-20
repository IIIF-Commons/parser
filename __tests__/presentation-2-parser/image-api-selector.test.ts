import { presentation2to3 } from "../../src/presentation-2";
import type { ContentResourceSelector } from "../../src/presentation-2/types";
import { normalize, serialize, serializeConfigPresentation3 } from "../../src";

const selector = {
  "@context": "http://iiif.io/api/annex/openannotation/context.json",
  "@type": "iiif:ImageApiSelector",
  region: "50,50,100,100",
  size: "200,",
  rotation: "!90",
  quality: "gray",
  format: "png",
} satisfies ContentResourceSelector;

describe("Image API selector fields (#27)", () => {
  test("preserves every image parameter through upgrade, normalization and serialization", () => {
    const annotation = presentation2to3.traverseAnnotation({
      "@id": "https://example.org/annotation",
      "@type": "oa:Annotation",
      motivation: "sc:painting",
      on: {
        "@type": "oa:SpecificResource",
        full: "https://example.org/canvas",
        selector,
      },
      resource: { "@id": "https://example.org/image.png", "@type": "dctypes:Image" },
    } as any);
    const expected = {
      type: "ImageApiSelector",
      region: selector.region,
      size: selector.size,
      rotation: selector.rotation,
      quality: selector.quality,
      format: selector.format,
    };
    expect((annotation.target as any).selector).toEqual(expected);
    const result = normalize(annotation);
    const output = serialize<any>({ ...result, requests: {} }, result.resource, serializeConfigPresentation3);
    expect(output.target.selector).toEqual(expected);
  });

  test("allows selectors that rely on default parameters", () => {
    const defaults = { "@context": selector["@context"], "@type": selector["@type"] } satisfies ContentResourceSelector;
    const annotation = presentation2to3.traverseAnnotation({
      "@id": "https://example.org/defaults",
      "@type": "oa:Annotation",
      on: { "@type": "oa:SpecificResource", full: "https://example.org/canvas", selector: defaults },
      resource: { "@id": "https://example.org/image", "@type": "dctypes:Image" },
    } as any);
    expect(JSON.parse(JSON.stringify((annotation.target as any).selector))).toEqual({ type: "ImageApiSelector" });
  });
});

// Existing consumers can still narrow required region/rotation values with `in`.
function readParameter(input: ContentResourceSelector): string | undefined {
  if (input["@type"] === "iiif:ImageApiSelector") {
    if ("region" in input) {
      const region: string = input.region;
      return region;
    }
    if ("rotation" in input) {
      const rotation: string = input.rotation;
      return rotation;
    }
  }
}

test("preserves existing selector parameter narrowing", () => {
  expect(readParameter(selector)).toBe(selector.region);
});
