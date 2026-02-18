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

  test("serializes annotation body/target as objects by default", () => {
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
    expect(Array.isArray(serializedAnnotation.body)).toBe(false);
    expect(Array.isArray(serializedAnnotation.target)).toBe(false);
    expect(serializedAnnotation.body.type).toBeTruthy();
    expect(serializedAnnotation.target.type).toBeTruthy();
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

  test("preserves TextualBody value/language through normalize+serialize", () => {
    const fixture = JSON.parse(readFileSync(join(cwd(), "fixtures/cookbook/0489-multimedia-canvas.json"), "utf8"));
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

    const annotation = serialized.items[0].items[0].items.find(
      (item: any) => item.id === "https://iiif.io/api/cookbook/recipe/0489-multimedia-canvas/annotation/p0005-text"
    );
    expect(annotation).toBeTruthy();
    expect(annotation.body.type).toBe("TextualBody");
    expect(annotation.body.value).toContain("In 10 seconds");
    expect(annotation.body.language).toBe("en");
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

  test("serializes manifest start container as a reference object", () => {
    const fixture = JSON.parse(readFileSync(join(cwd(), "fixtures/presentation-3/start-canvas.json"), "utf8"));
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

    expect(serialized.start).toEqual({
      id: "https://iiif.io/api/cookbook/recipe/0202-start-canvas/canvas/p2",
      type: "Canvas",
    });
    expect(serialized.start.items).toBeUndefined();
  });

  test("serializes range start container as a reference object", () => {
    const fixture = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/range-start",
      type: "Manifest",
      label: { en: ["Range start"] },
      items: [
        {
          id: "https://example.org/canvas/1",
          type: "Canvas",
          width: 1000,
          height: 1000,
          items: [],
        },
      ],
      structures: [
        {
          id: "https://example.org/range/1",
          type: "Range",
          start: {
            id: "https://example.org/canvas/1",
            type: "Canvas",
          },
        },
      ],
    };
    const normalized = normalize(fixture as any);

    const serialized = serialize<any>(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation4
    );

    expect(serialized.structures[0].start).toEqual({
      id: "https://example.org/canvas/1",
      type: "Canvas",
    });
    expect(serialized.structures[0].start.items).toBeUndefined();
  });

  test("serializes manifest start specific resource with source reference only", () => {
    const fixture = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/start-specific-resource",
      type: "Manifest",
      label: { en: ["Start specific resource"] },
      start: {
        id: "https://example.org/manifest/start-specific-resource/segment/1",
        type: "SpecificResource",
        source: {
          id: "https://example.org/canvas/1",
          type: "Canvas",
          width: 1000,
          height: 1000,
          items: [],
        },
        selector: {
          type: "PointSelector",
          x: 10,
          y: 20,
        },
      },
      items: [
        {
          id: "https://example.org/canvas/1",
          type: "Canvas",
          width: 1000,
          height: 1000,
          items: [],
        },
      ],
    };
    const normalized = normalize(fixture as any);

    const serialized = serialize<any>(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation4
    );

    expect(serialized.start.type).toBe("SpecificResource");
    expect(serialized.start.source).toEqual({
      id: "https://example.org/canvas/1",
      type: "Canvas",
    });
    expect(serialized.start.source.items).toBeUndefined();
  });
});
