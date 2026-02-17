import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { describe, expect, test } from "vitest";
import {
  createSerializeConfigPresentation4,
  normalize,
  serialize,
  serializeConfigPresentation4,
} from "../../src/presentation-4";

describe("presentation-4 serializer", () => {
  test("serializes normalized v4 back to a v4 manifest", () => {
    const fixture = JSON.parse(readFileSync(join(cwd(), "fixtures/presentation-4/01-model-in-scene.json"), "utf8"));
    const normalized = normalize(fixture);

    const serialized = serialize<any>(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation4
    );

    expect(serialized["@context"]).toEqual("http://iiif.io/api/presentation/4/context.json");
    expect(serialized.type).toEqual("Manifest");
    expect(Array.isArray(serialized.items)).toBe(true);
  });

  test("serializes non-strict annotation body/target values as lists", () => {
    const fixture = JSON.parse(readFileSync(join(cwd(), "fixtures/presentation-4/01-model-in-scene.json"), "utf8"));
    const normalized = normalize(fixture);
    const annotationId = "https://example.org/iiif/3d/anno1";
    const annotation = normalized.entities.Annotation[annotationId] as any;

    annotation.body = annotation.body[0];
    annotation.target = annotation.target[0];

    const serialized = serialize<any>(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation4
    );

    const serializedAnnotation = serialized.items[0].items[0].items[0];
    expect(Array.isArray(serializedAnnotation.body)).toBe(true);
    expect(Array.isArray(serializedAnnotation.target)).toBe(true);
  });

  test("optionally serializes annotation body/target as object with List wrapper for multiples", () => {
    const fixture = JSON.parse(readFileSync(join(cwd(), "fixtures/presentation-4/01-model-in-scene.json"), "utf8"));
    const normalized = normalize(fixture);
    const annotationId = "https://example.org/iiif/3d/anno1";
    const annotation = normalized.entities.Annotation[annotationId] as any;

    annotation.body = [annotation.body[0], annotation.body[0]];
    annotation.target = [annotation.target[0], annotation.target[0]];

    const serialized = serialize<any>(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      createSerializeConfigPresentation4({
        annotationBodyTargetMode: "object",
      })
    );

    const serializedAnnotation = serialized.items[0].items[0].items[0];
    expect(serializedAnnotation.body.type).toBe("List");
    expect(Array.isArray(serializedAnnotation.body.items)).toBe(true);
    expect(serializedAnnotation.body.items).toHaveLength(2);
    expect(serializedAnnotation.target.type).toBe("List");
    expect(Array.isArray(serializedAnnotation.target.items)).toBe(true);
    expect(serializedAnnotation.target.items).toHaveLength(2);
  });

  test("does not serialize default left-to-right viewingDirection on Collection in partOf", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/manifest/part-of-collection",
      type: "Manifest",
      label: { en: ["Part of collection"] },
      items: [
        {
          id: "https://example.org/canvas/1",
          type: "Canvas",
          height: 1000,
          width: 1000,
          items: [
            {
              id: "https://example.org/canvas/1/page/1",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/canvas/1/annotation/1",
                  type: "Annotation",
                  motivation: "painting",
                  body: {
                    id: "https://example.org/image/1.jpg",
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
      partOf: [{ id: "https://example.org/collection/1", type: "Collection" }],
    };

    const normalized = normalize(manifest as any);

    const serialized = serialize<any>(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation4
    );

    const partOfCollection = serialized.partOf[0];
    expect(partOfCollection.type).toBe("Collection");
    expect(partOfCollection.viewingDirection).toBeUndefined();
  });
});
