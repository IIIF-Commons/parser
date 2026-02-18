import { describe, expect, test } from "vitest";
import { normalize, serialize, serializeConfigPresentation4 } from "../../src/presentation-4";

describe("presentation-4 specific resource parity", () => {
  test("coerces start, range items, and annotation target for v3 input and keeps selectors", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/manifest/p3-upgrade",
      type: "Manifest",
      label: { en: ["p3 specific resource parity"] },
      start: "https://example.org/canvas/1#t=5,15",
      items: [
        {
          id: "https://example.org/canvas/1",
          type: "Canvas",
          width: 1000,
          height: 1000,
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
                  target: "https://example.org/canvas/1#xywh=10,20,30,40",
                },
              ],
            },
          ],
        },
      ],
      structures: [
        {
          id: "https://example.org/range/1",
          type: "Range",
          items: ["https://example.org/canvas/1#t=0,10"],
        },
      ],
    };

    const result = normalize(manifest as any);
    const normalizedManifest = result.entities.Manifest["https://example.org/manifest/p3-upgrade"] as any;
    const normalizedRange = result.entities.Range["https://example.org/range/1"] as any;
    const normalizedAnnotation = result.entities.Annotation["https://example.org/canvas/1/annotation/1"] as any;
    const normalizedStart = result.entities.ContentResource[normalizedManifest.start.id] as any;
    const normalizedRangeItem = result.entities.ContentResource[normalizedRange.items[0].id] as any;
    const normalizedTarget = result.entities.ContentResource[normalizedAnnotation.target.id] as any;
    const startSelector = normalizedStart.selector[0];
    const rangeSelector = normalizedRangeItem.selector[0];
    const targetSelector = normalizedTarget.selector[0];

    expect(normalizedManifest.start.type).toBe("ContentResource");
    expect(normalizedManifest.start.id.startsWith("vault://iiif-parser/v4/SpecificResource/")).toBe(true);
    expect(normalizedStart.source.id).toBe("https://example.org/canvas/1");
    expect(startSelector.type).toBe("FragmentSelector");
    expect(startSelector.value).toBe("t=5,15");

    expect(normalizedRange.items[0].type).toBe("ContentResource");
    expect(normalizedRange.items[0].id.startsWith("vault://iiif-parser/v4/SpecificResource/")).toBe(true);
    expect(normalizedRangeItem.source.id).toBe("https://example.org/canvas/1");
    expect(rangeSelector.type).toBe("FragmentSelector");
    expect(rangeSelector.value).toBe("t=0,10");

    expect(normalizedAnnotation.target.type).toBe("ContentResource");
    expect(normalizedAnnotation.target.id.startsWith("vault://iiif-parser/v4/SpecificResource/")).toBe(true);
    expect(normalizedTarget.source.id).toBe("https://example.org/canvas/1");
    expect(targetSelector.type).toBe("FragmentSelector");
    expect(targetSelector.value).toBe("xywh=10,20,30,40");

    expect(targetSelector).toMatchInlineSnapshot(`
      {
        "type": "FragmentSelector",
        "value": "xywh=10,20,30,40",
      }
    `);

    const serialized = serialize<any>(
      {
        entities: result.entities as any,
        mapping: result.mapping as any,
        requests: {},
      },
      result.resource,
      serializeConfigPresentation4
    );

    expect(serialized.start.type).toBe("SpecificResource");
    expect(serialized.start.id).toBeUndefined();
    expect(serialized.structures[0].items[0].type).toBe("SpecificResource");
    expect(serialized.structures[0].items[0].id).toBeUndefined();
    expect(serialized.items[0].items[0].items[0].target.type).toBe("SpecificResource");
    expect(serialized.items[0].items[0].items[0].target.id).toBeUndefined();
  });

  test("preserves selector through normalize and serialize for native p4 fragment targets", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/p4-fragment-target",
      type: "Manifest",
      label: { en: ["native p4 selector parity"] },
      items: [
        {
          id: "https://example.org/canvas/1",
          type: "Canvas",
          width: 1000,
          height: 1000,
          items: [
            {
              id: "https://example.org/canvas/1/page/1",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/canvas/1/annotation/1",
                  type: "Annotation",
                  motivation: ["commenting"],
                  body: [
                    {
                      type: "Text",
                      id: "https://example.org/body/1",
                      format: "text/plain",
                    },
                  ],
                  target: ["https://example.org/canvas/1#xywh=11,22,33,44"],
                },
              ],
            },
          ],
        },
      ],
    };

    const normalized = normalize(manifest as any);
    const annotation = normalized.entities.Annotation["https://example.org/canvas/1/annotation/1"] as any;
    const target = normalized.entities.ContentResource[annotation.target.id] as any;
    const targetSelector = target.selector[0];

    expect(annotation.target.type).toBe("ContentResource");
    expect(target.source.id).toBe("https://example.org/canvas/1");
    expect(targetSelector.type).toBe("FragmentSelector");
    expect(targetSelector.value).toBe("xywh=11,22,33,44");

    const serialized = serialize<any>(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation4
    );
    const serializedTarget = serialized.items[0].items[0].items[0].target;
    const serializedSelector = Array.isArray(serializedTarget.selector)
      ? serializedTarget.selector[0]
      : serializedTarget.selector;

    expect(serializedTarget.type).toBe("SpecificResource");
    expect(serializedTarget.source.id).toBe("https://example.org/canvas/1");
    expect(serializedSelector.type).toBe("FragmentSelector");
    expect(serializedSelector.value).toBe("xywh=11,22,33,44");
  });

  test("keeps only the first SpecificResource.source entry when source is an array", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/first-source-only",
      type: "Manifest",
      label: { en: ["source array normalization"] },
      items: [
        {
          id: "https://example.org/canvas/1",
          type: "Canvas",
          width: 1000,
          height: 1000,
          items: [
            {
              id: "https://example.org/canvas/1/page/1",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/canvas/1/annotation/1",
                  type: "Annotation",
                  motivation: ["painting"],
                  body: {
                    id: "https://example.org/image/1.jpg",
                    type: "Image",
                    format: "image/jpeg",
                  },
                  target: {
                    id: "https://example.org/canvas/1/sr/1",
                    type: "SpecificResource",
                    source: [
                      { id: "https://example.org/canvas/1", type: "Canvas" },
                      { id: "https://example.org/canvas/2", type: "Canvas" },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const normalized = normalize(manifest as any);
    const annotation = normalized.entities.Annotation["https://example.org/canvas/1/annotation/1"] as any;
    const target = normalized.entities.ContentResource[annotation.target.id] as any;

    expect(target.source.id).toBe("https://example.org/canvas/1");
    expect(target.source.type).toBe("Canvas");
    expect(Array.isArray(target.source)).toBe(false);
  });
});
