import { describe, expect, test } from "vitest";
import { normalize, serialize, serializeConfigPresentation4 } from "../../../src/presentation-4";
import { expectPresentation4WireClean } from "./assert-presentation-4-wire";

function normalizeAndSerialize(resource: any): any {
  const normalized = normalize(resource);
  return serialize(
    {
      entities: normalized.entities as any,
      mapping: normalized.mapping as any,
      requests: {},
    },
    normalized.resource,
    serializeConfigPresentation4
  );
}

describe("Presentation 4 serialization wire boundary", () => {
  test("retains concrete SpecificResource source types and omits internal state", () => {
    const serialized = normalizeAndSerialize({
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/wire-boundary",
      type: "Manifest",
      label: { en: ["Wire boundary"] },
      items: [
        {
          id: "https://example.org/canvas/1",
          type: "Canvas",
          width: 1000,
          height: 1000,
          items: [
            {
              id: "https://example.org/page/1",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/annotation/image",
                  type: "Annotation",
                  motivation: ["painting"],
                  body: {
                    type: "SpecificResource",
                    source: {
                      id: "https://example.org/image/shared",
                      type: "Image",
                      format: "image/jpeg",
                    },
                  },
                  target: {
                    type: "SpecificResource",
                    source: {
                      id: "https://example.org/canvas/1",
                      type: "Canvas",
                    },
                  },
                },
                {
                  id: "https://example.org/annotation/text-source",
                  type: "Annotation",
                  motivation: ["commenting"],
                  body: {
                    type: "SpecificResource",
                    source: {
                      type: "TextualBody",
                      value: "A source without an authored identifier",
                      language: ["en"],
                    },
                  },
                  target: {
                    id: "https://example.org/canvas/1",
                    type: "Canvas",
                  },
                },
                {
                  id: "https://example.org/annotation/shared-image",
                  type: "Annotation",
                  motivation: ["painting"],
                  body: {
                    id: "https://example.org/image/shared",
                    type: "Image",
                    format: "image/png",
                  },
                  target: {
                    id: "https://example.org/canvas/1",
                    type: "Canvas",
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    const [imageAnnotation, textAnnotation] = serialized.items[0].items[0].items;

    expect(imageAnnotation.body.source).toMatchObject({
      id: "https://example.org/image/shared",
      type: "Image",
    });
    expect(imageAnnotation.target.source).toEqual({
      id: "https://example.org/canvas/1",
      type: "Canvas",
    });
    expect(textAnnotation.body.id).toBeUndefined();
    expect(textAnnotation.body.source).toEqual({
      type: "TextualBody",
      value: "A source without an authored identifier",
      language: ["en"],
    });

    expectPresentation4WireClean(serialized, { rejectAbstractContentResource: true });
  });

  test("keeps one-element language values as arrays", () => {
    const serialized = normalizeAndSerialize({
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/language-array",
      type: "Manifest",
      label: { en: ["Language array"] },
      items: [
        {
          id: "https://example.org/canvas/language",
          type: "Canvas",
          width: 100,
          height: 100,
          items: [
            {
              id: "https://example.org/page/language",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/annotation/language",
                  type: "Annotation",
                  motivation: ["commenting"],
                  body: {
                    type: "TextualBody",
                    value: "Hello",
                    language: ["en"],
                  },
                  target: {
                    id: "https://example.org/canvas/language",
                    type: "Canvas",
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    expect(serialized.items[0].items[0].items[0].body.language).toEqual(["en"]);
    expectPresentation4WireClean(serialized, { rejectAbstractContentResource: true });
  });
});
