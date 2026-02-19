import { describe, expect, test } from "vitest";
import { HAS_PART, normalize, PART_OF } from "../../src/presentation-4";

describe("presentation-4 hasPart parity", () => {
  test("records framing metadata when the same resource diverges by parent context", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/has-part",
      type: "Manifest",
      label: { en: ["has part parity"] },
      items: [
        {
          id: "https://example.org/canvas/1",
          type: "Canvas",
          width: 1000,
          height: 1000,
          thumbnail: [
            {
              id: "https://example.org/image/shared.jpg",
              type: "Image",
              format: "image/jpeg",
            },
          ],
        },
        {
          id: "https://example.org/canvas/2",
          type: "Canvas",
          width: 1000,
          height: 1000,
          thumbnail: [
            {
              id: "https://example.org/image/shared.jpg",
              type: "Image",
              format: "image/jpeg",
              width: 6000,
            },
          ],
        },
      ],
    };

    const result = normalize(manifest as any);
    const image = result.entities.ContentResource["https://example.org/image/shared.jpg"] as any;

    expect(image).toBeTruthy();
    expect(Array.isArray(image[HAS_PART])).toBe(true);

    const partOf = (image[HAS_PART] as any[]).map((item) => item[PART_OF]);
    expect(partOf).toContain("https://example.org/canvas/1");
    expect(partOf).toContain("https://example.org/canvas/2");
  });
});
