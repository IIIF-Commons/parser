import { describe, expect, test } from "vitest";
import { normalize } from "../../src/presentation-4";

function expectArrayFields(resource: object, keys: string[]) {
  for (const key of keys) {
    expect(Array.isArray((resource as any)[key]), `${key} should default to array`).toBe(true);
  }
}

describe("presentation-4 normalized defaults", () => {
  test("applies array defaults across normalized entities", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/defaults",
      type: "Manifest",
      label: { en: ["defaults"] },
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
                  body: [
                    {
                      id: "https://example.org/image/1/full/max/0/default.jpg",
                      type: "Image",
                      format: "image/jpeg",
                      service: [
                        {
                          id: "https://example.org/image/1",
                          type: "ImageService3",
                          profile: "level1",
                        },
                      ],
                    },
                  ],
                  target: ["https://example.org/canvas/1#xywh=10,20,30,40"],
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
          label: { en: ["r1"] },
        },
      ],
    };

    const result = normalize(manifest as any);

    const normalizedManifest = result.entities.Manifest["https://example.org/manifest/defaults"] as Record<
      string,
      unknown
    >;
    expectArrayFields(normalizedManifest, [
      "items",
      "structures",
      "metadata",
      "provider",
      "thumbnail",
      "behavior",
      "seeAlso",
      "service",
      "services",
      "homepage",
      "rendering",
      "partOf",
      "annotations",
    ]);

    const normalizedCanvas = result.entities.Canvas["https://example.org/canvas/1"]!;
    expectArrayFields(normalizedCanvas, [
      "items",
      "annotations",
      "metadata",
      "provider",
      "thumbnail",
      "behavior",
      "seeAlso",
      "service",
      "services",
      "homepage",
      "rendering",
      "partOf",
    ]);

    const normalizedAnnotation = result.entities.Annotation["https://example.org/canvas/1/annotation/1"]!;
    expectArrayFields(normalizedAnnotation, [
      "motivation",
      "metadata",
      "provider",
      "thumbnail",
      "behavior",
      "seeAlso",
      "service",
      "services",
      "homepage",
      "rendering",
      "partOf",
      "annotations",
    ]);
    expect(typeof (normalizedAnnotation as any).body).toBe("object");
    expect(Array.isArray((normalizedAnnotation as any).body)).toBe(false);
    expect(typeof (normalizedAnnotation as any).target).toBe("object");
    expect(Array.isArray((normalizedAnnotation as any).target)).toBe(false);

    const normalizedContentResource =
      result.entities.ContentResource["https://example.org/image/1/full/max/0/default.jpg"]!;
    expectArrayFields(normalizedContentResource, [
      "metadata",
      "provider",
      "thumbnail",
      "behavior",
      "seeAlso",
      "service",
      "services",
      "homepage",
      "rendering",
      "partOf",
      "annotations",
      "language",
      "items",
      "selector",
      "transform",
      "action",
      "provides",
    ]);

    const normalizedRange = result.entities.Range["https://example.org/range/1"]!;
    expectArrayFields(normalizedRange, [
      "items",
      "supplementary",
      "metadata",
      "provider",
      "thumbnail",
      "behavior",
      "seeAlso",
      "service",
      "services",
      "homepage",
      "rendering",
      "partOf",
      "annotations",
    ]);
    expect((normalizedRange.items as unknown[]).length).toBe(0);

    const normalizedTargetEntity = result.entities.ContentResource[(normalizedAnnotation as any).target.id] as any;
    expect(normalizedTargetEntity).toBeTruthy();
    expectArrayFields(normalizedTargetEntity, ["selector", "transform"]);
    expect(Array.isArray(normalizedTargetEntity.source)).toBe(false);
  });

  test("applies canonical defaults for legacy-upgraded resources", () => {
    const legacyManifest = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/manifest/legacy-defaults",
      type: "Manifest",
      label: { en: ["legacy defaults"] },
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
        },
      ],
    };

    const result = normalize(legacyManifest as any);
    const annotation = result.entities.Annotation["https://example.org/canvas/1/annotation/1"] as any;
    const range = result.entities.Range["https://example.org/range/1"] as any;
    const target = result.entities.ContentResource[annotation.target.id] as any;

    expect(annotation.body).toBeNull();
    expect(Array.isArray(range.supplementary)).toBe(true);
    expectArrayFields(target, ["selector", "transform"]);
    expect(Array.isArray(target.source)).toBe(false);
  });

  test("wraps multiple body/target values in minted List resources", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/list-wrapper",
      type: "Manifest",
      label: { en: ["list wrapper"] },
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
                  body: [
                    { id: "https://example.org/image/1.jpg", type: "Image", format: "image/jpeg" },
                    { id: "https://example.org/image/2.jpg", type: "Image", format: "image/jpeg" },
                  ],
                  target: ["https://example.org/canvas/1#xywh=0,0,10,10", "https://example.org/canvas/1"],
                },
              ],
            },
          ],
        },
      ],
    };

    const normalized = normalize(manifest as any);
    const annotation = normalized.entities.Annotation["https://example.org/canvas/1/annotation/1"] as any;
    const body = normalized.entities.ContentResource[annotation.body.id] as any;
    const target = normalized.entities.ContentResource[annotation.target.id] as any;

    expect(annotation.body.id.startsWith("vault://iiif-parser/v4/ContentResource/")).toBe(true);
    expect(annotation.target.id.startsWith("vault://iiif-parser/v4/ContentResource/")).toBe(true);
    expect(body.type).toBe("List");
    expect(target.type).toBe("List");
    expect(Array.isArray(body.items)).toBe(true);
    expect(Array.isArray(target.items)).toBe(true);
    expect(body.items).toHaveLength(2);
    expect(target.items).toHaveLength(2);
  });

  test("defaults annotation collection paging fields", () => {
    const annotationCollection = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/annotation-collection/1",
      type: "AnnotationCollection",
      items: [],
    };

    const result = normalize(annotationCollection as any);
    const normalized = result.entities.AnnotationCollection["https://example.org/annotation-collection/1"] as any;

    expect(normalized.first).toBeNull();
    expect(normalized.last).toBeNull();
    expect(normalized.total).toBe(0);
  });
});
