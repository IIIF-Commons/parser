import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { describe, expect, test } from "vitest";
import { normalize, serialize, serializeConfigPresentation3 } from "../../src/presentation-4";

describe("presentation-4 to presentation-3 downgrade serializer", () => {
  test("serializes annotation targets by unwrapping List, compressing SpecificResource, and mapping Timeline/Scene to Canvas", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/iiif/target-manifest",
      type: "Manifest",
      label: { en: ["Target test"] },
      items: [
        {
          id: "https://example.org/iiif/canvas/1",
          type: "Canvas",
          width: 1000,
          height: 1000,
          items: [
            {
              id: "https://example.org/iiif/canvas/1/page/1",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/iiif/canvas/1/page/1/anno/1",
                  type: "Annotation",
                  motivation: ["painting"],
                  body: {
                    id: "https://example.org/iiif/image/1.jpg",
                    type: "Image",
                    format: "image/jpeg",
                  },
                  target: {
                    type: "List",
                    items: [
                      {
                        type: "SpecificResource",
                        source: {
                          id: "https://example.org/iiif/timeline/1",
                          type: "Timeline",
                        },
                        selector: {
                          type: "FragmentSelector",
                          value: "t=0,10",
                        },
                      },
                      {
                        id: "https://example.org/iiif/scene/1",
                        type: "Scene",
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const normalized = normalize(manifest);
    const serialized = serialize<any>(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation3
    );

    expect(serialized.items[0].items[0].items[0].target).toEqual([
      "https://example.org/iiif/timeline/1#t=0,10",
      "https://example.org/iiif/scene/1",
    ]);
  });

  test("downgrades Timeline to Canvas with minimal dimensions", () => {
    const timelineManifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/iiif/timeline-manifest",
      type: "Manifest",
      label: { en: ["Timeline"] },
      items: [
        {
          id: "https://example.org/iiif/timeline-1",
          type: "Timeline",
          duration: 20,
          items: [
            {
              id: "https://example.org/iiif/timeline-1/page",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/iiif/timeline-1/painting",
                  type: "Annotation",
                  motivation: ["painting"],
                  body: [
                    {
                      id: "https://example.org/audio.mp3",
                      type: "Sound",
                      format: "audio/mp3",
                    },
                  ],
                  target: ["https://example.org/iiif/timeline-1"],
                },
              ],
            },
          ],
        },
      ],
    };

    const normalized = normalize(timelineManifest);
    const serialized = serialize<any>(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation3
    );

    expect(serialized["@context"]).toEqual("http://iiif.io/api/presentation/3/context.json");
    expect(serialized.items[0].type).toEqual("Canvas");
    expect(serialized.items[0].width).not.toBeDefined();
    expect(serialized.items[0].height).not.toBeDefined();
    expect(serialized.items[0].duration).toEqual(20);
  });

  test("fails downgrade when Scene is present", () => {
    const fixture = JSON.parse(readFileSync(join(cwd(), "fixtures/presentation-4/01-model-in-scene.json"), "utf8"));
    const normalized = normalize(fixture);

    expect(() =>
      serialize<any>(
        {
          entities: normalized.entities as any,
          mapping: normalized.mapping as any,
          requests: {},
        },
        normalized.resource,
        serializeConfigPresentation3
      )
    ).toThrow(/unsupported/i);
  });

  test("fails downgrade when activating annotations are present", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/iiif/activating-manifest",
      type: "Manifest",
      label: { en: ["Activating"] },
      items: [
        {
          id: "https://example.org/iiif/canvas/1",
          type: "Canvas",
          width: 1000,
          height: 1000,
          items: [
            {
              id: "https://example.org/iiif/canvas/1/page/1",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/iiif/canvas/1/page/1/anno/1",
                  type: "Annotation",
                  motivation: ["activating"],
                  body: [
                    {
                      id: "https://example.org/iiif/image/1.jpg",
                      type: "Image",
                      format: "image/jpeg",
                    },
                  ],
                  target: ["https://example.org/iiif/canvas/1"],
                },
              ],
            },
          ],
        },
      ],
    };

    const normalized = normalize(manifest);

    expect(() =>
      serialize<any>(
        {
          entities: normalized.entities as any,
          mapping: normalized.mapping as any,
          requests: {},
        },
        normalized.resource,
        serializeConfigPresentation3
      )
    ).toThrow(/activating/i);
  });

  test("fails downgrade when content has transform metadata", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/iiif/transform-manifest",
      type: "Manifest",
      label: { en: ["Transform"] },
      items: [
        {
          id: "https://example.org/iiif/canvas/2",
          type: "Canvas",
          width: 1000,
          height: 1000,
          items: [
            {
              id: "https://example.org/iiif/canvas/2/page/1",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/iiif/canvas/2/page/1/anno/1",
                  type: "Annotation",
                  motivation: ["painting"],
                  body: [
                    {
                      id: "https://example.org/iiif/image/2.jpg",
                      type: "Image",
                      format: "image/jpeg",
                      transform: [
                        {
                          type: "RotateTransform",
                          angle: 90,
                        },
                      ],
                    },
                  ],
                  target: ["https://example.org/iiif/canvas/2"],
                },
              ],
            },
          ],
        },
      ],
    };

    const normalized = normalize(manifest);

    expect(() =>
      serialize<any>(
        {
          entities: normalized.entities as any,
          mapping: normalized.mapping as any,
          requests: {},
        },
        normalized.resource,
        serializeConfigPresentation3
      )
    ).toThrow(/transform/i);
  });
});
