import { describe, expect, test } from "vitest";
import { normalize } from "../../src/presentation-4";

function expectArrayFields(resource: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    expect(Array.isArray(resource[key]), `${key} should default to array`).toBe(true);
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

    const normalizedCanvas = result.entities.Canvas["https://example.org/canvas/1"] as Record<string, unknown>;
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

    const normalizedAnnotation = result.entities.Annotation["https://example.org/canvas/1/annotation/1"] as Record<
      string,
      unknown
    >;
    expectArrayFields(normalizedAnnotation, [
      "motivation",
      "body",
      "target",
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

    const normalizedContentResource = result.entities.ContentResource[
      "https://example.org/image/1/full/max/0/default.jpg"
    ] as Record<string, unknown>;
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

    const normalizedRange = result.entities.Range["https://example.org/range/1"] as Record<string, unknown>;
    expectArrayFields(normalizedRange, [
      "items",
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

    const normalizedService = result.entities.Service["https://example.org/image/1"] as Record<string, unknown>;
    expectArrayFields(normalizedService, ["service"]);
    expect(normalizedService.profile).toBe("level1");

    const target = (normalizedAnnotation.target as Array<Record<string, unknown>>)[0]!;
    const selector = Array.isArray(target.selector) ? target.selector[0] : target.selector;
    const selectorEntity = result.entities.Selector[(selector as Record<string, unknown>).id as string] as Record<
      string,
      unknown
    >;
    expectArrayFields(selectorEntity, ["selectors"]);
  });
});
