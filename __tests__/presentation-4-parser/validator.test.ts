import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { describe, expect, test } from "vitest";
import { upgradeToPresentation4, validatePresentation4 } from "../../src/presentation-4";

describe("presentation-4 validator", () => {
  test("accepts authored v4 fixtures with object/List annotation target and body", () => {
    const fixture = JSON.parse(readFileSync(join(cwd(), "fixtures/presentation-4/01-model-in-scene.json"), "utf8"));
    const annotation = fixture.items[0].items[0].items[0];
    annotation.body = annotation.body[0];
    annotation.target = annotation.target[0];

    const report = validatePresentation4(fixture);

    expect(report.valid).toBe(true);
    expect(report.stats.errors).toBe(0);
  });

  test("accepts the same fixture after v4 coercion", () => {
    const fixture = JSON.parse(readFileSync(join(cwd(), "fixtures/presentation-4/01-model-in-scene.json"), "utf8"));
    const coerced = upgradeToPresentation4(fixture);
    const report = validatePresentation4(coerced);

    expect(report.valid).toBe(true);
    expect(report.stats.errors).toBe(0);
  });

  test("reports structural validation issues", () => {
    const invalid = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/invalid",
      type: "Manifest",
      label: { en: ["invalid"] },
      items: [
        {
          id: "https://example.org/canvas/1",
          type: "Canvas",
          width: 0,
          height: -10,
          items: [],
        },
      ],
    };

    const report = validatePresentation4(invalid);

    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === "canvas-width-required")).toBe(true);
    expect(report.issues.some((issue) => issue.code === "canvas-height-required")).toBe(true);
  });

  test("throws in strict mode when errors are present", () => {
    const invalid = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/invalid-2",
      type: "Manifest",
      label: { en: ["invalid"] },
      items: [],
    };

    expect(() => validatePresentation4(invalid, { mode: "strict" })).toThrow();
  });

  test("reports activating annotation body errors", () => {
    const invalid = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/activating-invalid",
      type: "Manifest",
      label: { en: ["invalid activating"] },
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
                  id: "https://example.org/canvas/1/page/1/anno/1",
                  type: "Annotation",
                  motivation: ["activating"],
                  body: [
                    {
                      id: "https://example.org/bodies/plain-text",
                      type: "Text",
                      value: "not a specific resource",
                    },
                  ],
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
    };

    const report = validatePresentation4(invalid, { mode: "tolerant" });
    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === "activating-body-specific-resource")).toBe(true);
  });

  test("reports selector and quantity-shape issues", () => {
    const invalid = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/selector-invalid",
      type: "Manifest",
      label: { en: ["invalid selector"] },
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
                  body: [
                    {
                      id: "https://example.org/content/model.glb",
                      type: "Model",
                      format: "model/gltf-binary",
                      spatialScale: {
                        type: "Text",
                        value: "wrong",
                      },
                    },
                  ],
                  target: {
                    type: "SpecificResource",
                    source: "https://example.org/scene/1",
                    selector: [
                      {
                        type: "Spatial",
                        value: "0,0,100,100",
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

    const report = validatePresentation4(invalid, { mode: "tolerant" });
    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === "selector-type-invalid")).toBe(true);
    expect(report.issues.some((issue) => issue.code === "spatial-scale-quantity")).toBe(true);
  });

  test("reports target object type/id requirements", () => {
    const invalid = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/target-shape",
      type: "Manifest",
      label: { en: ["target shape"] },
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
                  id: "https://example.org/canvas/1/page/1/anno/1",
                  type: "Annotation",
                  motivation: ["painting"],
                  body: [
                    {
                      id: "https://example.org/image.jpg",
                      type: "Image",
                      format: "image/jpeg",
                    },
                  ],
                  target: {
                    type: "List",
                    items: [
                      {
                        id: "https://example.org/canvas/1",
                      },
                      "https://example.org/canvas/1#xywh=0,0,100,100",
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const report = validatePresentation4(invalid, { mode: "tolerant" });
    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === "annotation-target-type-required")).toBe(true);
    expect(report.issues.some((issue) => issue.code === "annotation-target-entry-object")).toBe(true);
  });

  test("does not require canvas dimensions on annotation target specific resource source references", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/source-ref",
      type: "Manifest",
      label: { en: ["source ref"] },
      items: [
        {
          id: "https://example.org/scene/1",
          type: "Scene",
          items: [
            {
              id: "https://example.org/scene/1/page/1",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/scene/1/anno/1",
                  type: "Annotation",
                  motivation: ["painting"],
                  body: {
                    id: "https://example.org/model.glb",
                    type: "Model",
                    format: "model/gltf-binary",
                  },
                  target: {
                    type: "SpecificResource",
                    source: {
                      id: "https://example.org/canvas/ref-only",
                      type: "Canvas",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const report = validatePresentation4(manifest, { mode: "tolerant" });
    expect(report.issues.some((issue) => issue.code === "canvas-height-required")).toBe(false);
    expect(report.issues.some((issue) => issue.code === "canvas-width-required")).toBe(false);
  });

  test("does not require target on annotation references used as annotation targets", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/annotation-target-reference",
      type: "Manifest",
      label: { en: ["annotation target reference"] },
      items: [
        {
          id: "https://example.org/canvas/1",
          type: "Canvas",
          width: 1000,
          height: 1000,
          annotations: [
            {
              id: "https://example.org/canvas/1/page/1",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/canvas/1/anno/1",
                  type: "Annotation",
                  motivation: ["commenting"],
                  body: {
                    type: "TextualBody",
                    value: "points to another annotation",
                  },
                  target: {
                    type: "List",
                    items: [
                      {
                        id: "https://example.org/canvas/1/anno/2",
                        type: "Annotation",
                      },
                    ],
                  },
                },
              ],
            },
          ],
          items: [],
        },
      ],
    };

    const report = validatePresentation4(manifest, { mode: "tolerant" });
    expect(report.issues.some((issue) => issue.code === "annotation-target-required")).toBe(false);
  });

  test("does not require timeline duration on annotation target specific resource source references", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/timeline-source-ref",
      type: "Manifest",
      label: { en: ["timeline source ref"] },
      items: [
        {
          id: "https://example.org/scene/1",
          type: "Scene",
          items: [
            {
              id: "https://example.org/scene/1/page/1",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/scene/1/anno/1",
                  type: "Annotation",
                  motivation: ["painting"],
                  body: {
                    id: "https://example.org/model.glb",
                    type: "Model",
                    format: "model/gltf-binary",
                  },
                  target: {
                    type: "SpecificResource",
                    source: {
                      id: "https://example.org/timeline/ref-only",
                      type: "Timeline",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const report = validatePresentation4(manifest, { mode: "tolerant" });
    expect(report.issues.some((issue) => issue.code === "timeline-duration-required")).toBe(false);
  });
});
