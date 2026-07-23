import { describe, expect, test } from "vitest";
import {
  createSerializeConfigPresentation4,
  normalize,
  serialize,
  serializeConfigPresentation4,
  upgradePresentation3To4,
} from "../../../src/presentation-4";

const aggregateTypes = ["Choice", "Composite", "List", "Independents"] as const;

function serializeNormalized(input: any, config = serializeConfigPresentation4) {
  const normalized = normalize(input);
  return serialize<any>(
    {
      entities: normalized.entities as any,
      mapping: normalized.mapping as any,
      requests: {},
    },
    normalized.resource,
    config
  );
}

function annotationManifest(annotation: any) {
  return {
    "@context": "http://iiif.io/api/presentation/4/context.json",
    id: "https://example.org/manifest",
    type: "Manifest",
    label: { en: ["Aggregate semantics"] },
    items: [
      {
        id: "https://example.org/canvas",
        type: "Canvas",
        width: 100,
        height: 100,
        items: [
          {
            id: "https://example.org/page",
            type: "AnnotationPage",
            items: [annotation],
          },
        ],
      },
    ],
  };
}

describe("Presentation 4 Annotation aggregates", () => {
  test("upgrades legacy direct arrays with multiple values to Independents", () => {
    const legacyManifest = annotationManifest({
      id: "https://example.org/annotation",
      type: "Annotation",
      motivation: "painting",
      body: [
        {
          id: "https://example.org/image/1",
          type: "Image",
        },
        {
          id: "https://example.org/image/2",
          type: "Image",
        },
      ],
      target: ["https://example.org/canvas", "https://example.org/canvas#xywh=0,0,10,10"],
    });
    legacyManifest["@context"] = "http://iiif.io/api/presentation/3/context.json";

    const upgraded = upgradePresentation3To4(legacyManifest) as any;
    const annotation = upgraded.items[0].items[0].items[0];

    expect(annotation.body).toMatchObject({
      type: "Independents",
      items: [
        { id: "https://example.org/image/1", type: "Image" },
        { id: "https://example.org/image/2", type: "Image" },
      ],
    });
    expect(annotation.target).toMatchObject({
      type: "Independents",
      items: [
        { id: "https://example.org/canvas", type: "Canvas" },
        { id: "https://example.org/canvas#xywh=0,0,10,10", type: "Canvas" },
      ],
    });
  });

  test("unwraps a legacy direct array when it contains one value", () => {
    const legacyManifest = annotationManifest({
      id: "https://example.org/annotation/single",
      type: "Annotation",
      motivation: "painting",
      body: [{ id: "https://example.org/image", type: "Image" }],
      target: ["https://example.org/canvas"],
    });
    legacyManifest["@context"] = "http://iiif.io/api/presentation/3/context.json";

    const upgraded = upgradePresentation3To4(legacyManifest) as any;
    const annotation = upgraded.items[0].items[0].items[0];

    expect(annotation.body).toEqual({ id: "https://example.org/image", type: "Image" });
    expect(annotation.target).toEqual({ id: "https://example.org/canvas", type: "Canvas" });
  });

  test.each(aggregateTypes)("preserves authored %s bodies and targets through normalize/serialize", (type) => {
    const serialized = serializeNormalized(
      annotationManifest({
        id: `https://example.org/annotation/${type}`,
        type: "Annotation",
        motivation: ["painting"],
        body: {
          type,
          items: [{ id: "https://example.org/image/1", type: "Image" }],
        },
        target: {
          type,
          items: [{ id: "https://example.org/canvas", type: "Canvas" }],
        },
      })
    );
    const annotation = serialized.items[0].items[0].items[0];

    expect(annotation.body.type).toBe(type);
    expect(annotation.body.items).toHaveLength(1);
    expect(annotation.target.type).toBe(type);
    expect(annotation.target.items).toHaveLength(1);
  });

  test("keeps the legacy array serializer option valid while emitting valid Presentation 4 objects", () => {
    const manifest = annotationManifest({
      id: "https://example.org/annotation",
      type: "Annotation",
      motivation: ["painting"],
      body: { id: "https://example.org/image", type: "Image" },
      target: { id: "https://example.org/canvas", type: "Canvas" },
    });
    const normalized = normalize(manifest);
    const annotation = normalized.entities.Annotation["https://example.org/annotation"] as any;
    annotation.body = [annotation.body, annotation.body];
    annotation.target = [annotation.target, annotation.target];

    const serialized = serialize<any>(
      { entities: normalized.entities as any, mapping: normalized.mapping as any, requests: {} },
      normalized.resource,
      createSerializeConfigPresentation4({ annotationBodyTargetMode: "array" })
    );
    const serializedAnnotation = serialized.items[0].items[0].items[0];

    expect(serializedAnnotation.body.type).toBe("List");
    expect(serializedAnnotation.body.items).toHaveLength(2);
    expect(serializedAnnotation.target.type).toBe("List");
    expect(serializedAnnotation.target.items).toHaveLength(2);
  });
});
