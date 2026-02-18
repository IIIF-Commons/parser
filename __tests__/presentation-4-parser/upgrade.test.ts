import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { describe, expect, test } from "vitest";
import { upgradePresentation3To4, upgradeToPresentation4, validatePresentation4 } from "../../src/presentation-4";

const PRESENTATION_4_CONTEXT = "http://iiif.io/api/presentation/4/context.json";

describe("presentation-4 upgrade", () => {
  test("upgrades v3 shape to v4 annotation object/List shape and container naming", () => {
    const v3Manifest = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/manifest/v3",
      type: "Manifest",
      label: { en: ["v3"] },
      items: [
        {
          id: "https://example.org/canvas/1",
          type: "Canvas",
          width: 1000,
          height: 1000,
          placeholderCanvas: {
            id: "https://example.org/placeholder",
            type: "Canvas",
            width: 100,
            height: 100,
          },
          items: [
            {
              id: "https://example.org/page/1",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/anno/1",
                  type: "Annotation",
                  motivation: "painting",
                  body: {
                    id: "https://example.org/image.jpg",
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
    };

    const upgraded = upgradePresentation3To4(v3Manifest) as any;

    expect(upgraded["@context"]).toEqual(PRESENTATION_4_CONTEXT);
    expect(upgraded.items[0].placeholderContainer).toBeTruthy();
    expect(upgraded.items[0].placeholderCanvas).toBeUndefined();

    const annotation = upgraded.items[0].items[0].items[0];
    expect(Array.isArray(annotation.motivation)).toBe(true);
    expect(annotation.body.type).toBe("Image");
    expect(annotation.target).toEqual({
      id: "https://example.org/canvas/1",
      type: "Canvas",
    });
  });

  test("upgrades v2 content through v3 into v4 context", () => {
    const v2Manifest = JSON.parse(
      readFileSync(join(cwd(), "fixtures/presentation-2/iiif-fixture-manifest.json"), "utf8")
    );

    const upgraded = upgradeToPresentation4(v2Manifest) as any;

    expect(upgraded["@context"]).toEqual(PRESENTATION_4_CONTEXT);
    expect(upgraded.type).toEqual("Manifest");
    expect(Array.isArray(upgraded.items)).toBe(true);
  });

  test("keeps v4 resources as v4 while coercing legacy annotation fields", () => {
    const v4Manifest = JSON.parse(readFileSync(join(cwd(), "fixtures/presentation-4/01-model-in-scene.json"), "utf8"));
    const upgraded = upgradeToPresentation4(v4Manifest) as any;
    expect(upgraded["@context"]).toEqual(PRESENTATION_4_CONTEXT);
    expect(upgraded.type).toEqual("Manifest");
  });

  test("infers target type for missing-type target objects and fragments", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/v4-targets",
      type: "Manifest",
      label: { en: ["v4 targets"] },
      items: [
        {
          id: "https://example.org/scene/1",
          type: "Scene",
          items: [
            {
              id: "https://example.org/scene/1/page",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/scene/1/anno/1",
                  type: "Annotation",
                  motivation: ["painting"],
                  body: {
                    id: "https://example.org/model/1.glb",
                    type: "Model",
                  },
                  target: {
                    type: "List",
                    items: [
                      "https://example.org/scene/1#t=0,10",
                      {
                        id: "https://example.org/scene/1/page",
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

    const upgraded = upgradeToPresentation4(manifest) as any;
    const targets = upgraded.items[0].items[0].items[0].target.items;
    expect(targets[0]).toEqual({
      id: "https://example.org/scene/1#t=0,10",
      type: "Scene",
    });
    expect(targets[1]).toEqual({
      id: "https://example.org/scene/1/page",
      type: "AnnotationPage",
    });
  });

  test("converts duration-only audio canvases with Choice body to Timeline", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/manifest/audio-choice",
      type: "Manifest",
      label: { en: ["audio choice"] },
      items: [
        {
          id: "https://example.org/canvas/1",
          type: "Canvas",
          width: 0,
          height: 0,
          duration: 123.45,
          items: [
            {
              id: "https://example.org/canvas/1/page/1",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/canvas/1/anno/1",
                  type: "Annotation",
                  motivation: "painting",
                  body: {
                    type: "Choice",
                    items: [
                      {
                        id: "https://example.org/audio/1.mpd",
                        type: "Audio",
                        format: "application/dash+xml",
                      },
                      {
                        id: "https://example.org/audio/1.m3u8",
                        type: "Audio",
                        format: "application/vnd.apple.mpegurl",
                      },
                    ],
                  },
                  target: "https://example.org/canvas/1#t=0,123.45",
                },
              ],
            },
          ],
        },
      ],
    };

    const upgraded = upgradePresentation3To4(manifest) as any;
    expect(upgraded.items[0].type).toBe("Timeline");

    const report = validatePresentation4(manifest, { mode: "tolerant" });
    expect(report.issues.some((issue) => issue.code === "canvas-width-required")).toBe(false);
    expect(report.issues.some((issue) => issue.code === "canvas-height-required")).toBe(false);
  });

  test("removes width and height from annotation pages during v3 to v4 upgrade", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/manifest/annotation-page-dimensions",
      type: "Manifest",
      label: { en: ["annotation page dimensions"] },
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
              width: 640,
              height: 480,
              items: [],
            },
          ],
          annotations: [
            {
              id: "https://example.org/canvas/1/page/2",
              type: "AnnotationPage",
              width: 320,
              height: 240,
              items: [],
            },
          ],
        },
      ],
    };

    const upgraded = upgradePresentation3To4(manifest) as any;
    expect(upgraded.items[0].items[0].width).toBeUndefined();
    expect(upgraded.items[0].items[0].height).toBeUndefined();
    expect(upgraded.items[0].annotations[0].width).toBeUndefined();
    expect(upgraded.items[0].annotations[0].height).toBeUndefined();
  });

  test("coerces PointSelector.t to instant during upgrade", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/manifest/selector-time",
      type: "Manifest",
      label: { en: ["selector time"] },
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
                  id: "https://example.org/canvas/1/anno/1",
                  type: "Annotation",
                  motivation: "painting",
                  body: {
                    id: "https://example.org/image/1",
                    type: "Image",
                  },
                  target: {
                    type: "SpecificResource",
                    source: "https://example.org/canvas/1",
                    selector: {
                      type: "PointSelector",
                      x: 1,
                      y: 2,
                      t: 4.5,
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const upgraded = upgradePresentation3To4(manifest) as any;
    const selector = upgraded.items[0].items[0].items[0].target.selector;

    expect(selector.instant).toBe(4.5);
    expect(Object.hasOwn(selector, "t")).toBe(false);
  });
});
