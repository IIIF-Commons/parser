import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { describe, expect, test } from "vitest";
import { upgradeToPresentation4 } from "../../src/presentation-4";
import { validatePresentation4 } from "../../src/presentation-4/validator";

describe("presentation-4 validator", () => {
  test("accepts authored v4 fixtures with object/List annotation target and body", () => {
    const fixture = JSON.parse(readFileSync(join(cwd(), "fixtures/presentation-4/01-model-in-scene.json"), "utf8"));

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

  test("rejects array-form annotation body/target in favor of object/List", () => {
    const invalid = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/annotation-array-shape",
      type: "Manifest",
      label: { en: ["annotation array shape"] },
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
                  body: [{ id: "https://example.org/image/1/full/full/0/default.jpg", type: "Image" }],
                  target: [{ id: "https://example.org/canvas/1", type: "Canvas" }],
                },
              ],
            },
          ],
        },
      ],
    };

    const report = validatePresentation4(invalid);

    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === "annotation-body-array-forbidden")).toBe(true);
    expect(report.issues.some((issue) => issue.code === "annotation-target-array-forbidden")).toBe(true);
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

  test("coerces PointSelector.t to instant during validation upgrade pass", () => {
    const fixture = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/point-selector-t",
      type: "Manifest",
      label: { en: ["point selector t"] },
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
                  motivation: ["painting"],
                  body: {
                    id: "https://example.org/image/1.jpg",
                    type: "Image",
                    format: "image/jpeg",
                  },
                  target: {
                    type: "SpecificResource",
                    source: {
                      id: "https://example.org/canvas/1",
                      type: "Canvas",
                    },
                    selector: {
                      type: "PointSelector",
                      x: 10,
                      y: 20,
                      t: 1.25,
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const report = validatePresentation4(fixture);
    expect(report.valid).toBe(true);
    expect(
      report.issues.some((issue) => issue.code === "class-property-not-allowed" && issue.path.endsWith(".t"))
    ).toBe(false);
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

  test("reports class requirement summary stats", () => {
    const fixture = JSON.parse(readFileSync(join(cwd(), "fixtures/presentation-4/01-model-in-scene.json"), "utf8"));
    const report = validatePresentation4(fixture, { mode: "tolerant" });

    expect(report.reporting?.classRequirements?.nodesChecked).toBeGreaterThan(0);
    expect(report.reporting?.classRequirements?.mustChecks).toBeGreaterThan(0);
    expect(report.reporting?.classRequirements?.allowedPropertyChecks).toBeGreaterThan(0);
  });

  test("does not apply class requirements to target references", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/target-ref",
      type: "Manifest",
      label: { en: ["target refs"] },
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
                  motivation: ["painting"],
                  body: {
                    id: "https://example.org/image.jpg",
                    type: "Image",
                    format: "image/jpeg",
                  },
                  target: {
                    id: "https://example.org/canvas/ref",
                    type: "Canvas",
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const report = validatePresentation4(manifest, { mode: "tolerant" });
    const targetClassRequirementIssues = report.issues.filter(
      (item) => item.code.startsWith("class-requirement-") && item.path.includes(".target")
    );
    expect(targetClassRequirementIssues).toEqual([]);
  });

  test("does not apply class requirements to partOf references", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/partof-ref",
      type: "Manifest",
      label: { en: ["partOf refs"] },
      partOf: [
        {
          id: "https://example.org/collection/root",
          type: "Collection",
        },
      ],
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

    const report = validatePresentation4(manifest, { mode: "tolerant" });
    const partOfClassRequirementIssues = report.issues.filter(
      (item) => item.code.startsWith("class-requirement-") && item.path.includes(".partOf")
    );
    expect(partOfClassRequirementIssues).toEqual([]);
  });

  test("does not apply class requirements to annotation paging/reference links", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/paging-ref",
      type: "Manifest",
      label: { en: ["paging refs"] },
      items: [
        {
          id: "https://example.org/canvas/1",
          type: "Canvas",
          width: 1000,
          height: 1000,
          annotations: [
            {
              id: "https://example.org/ap/ref-1",
              type: "AnnotationPage",
              partOf: {
                id: "https://example.org/ac/1",
                type: "AnnotationCollection",
              },
            },
          ],
          items: [
            {
              id: "https://example.org/ap/embedded-1",
              type: "AnnotationPage",
              items: [],
              next: {
                id: "https://example.org/ap/ref-2",
                type: "AnnotationPage",
              },
              prev: {
                id: "https://example.org/ap/ref-0",
                type: "AnnotationPage",
              },
              partOf: {
                id: "https://example.org/ac/1",
                type: "AnnotationCollection",
              },
            },
          ],
        },
      ],
    };

    const report = validatePresentation4(manifest, { mode: "tolerant" });
    const referenceLinkIssues = report.issues.filter((item) => {
      if (!item.code.startsWith("class-requirement-")) {
        return false;
      }
      return (
        item.path.includes(".annotations[0]") ||
        item.path.includes(".next") ||
        item.path.includes(".prev") ||
        item.path.includes(".partOf")
      );
    });
    expect(referenceLinkIssues).toEqual([]);
  });

  test("does not emit annotation page paging should-warnings for embedded canvas pages", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/embedded-annotation-page",
      type: "Manifest",
      label: { en: ["embedded annotation page"] },
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
              items: [],
            },
          ],
        },
      ],
    };

    const report = validatePresentation4(manifest, { mode: "tolerant" });
    expect(
      report.issues.some(
        (item) =>
          item.code === "class-requirement-should" &&
          item.path.startsWith("$.items[0].items[0].") &&
          (item.path.endsWith(".next") || item.path.endsWith(".prev") || item.path.endsWith(".partOf"))
      )
    ).toBe(false);
  });

  test("does not enforce service id/type class requirements for legacy service payloads", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/legacy-service",
      type: "Manifest",
      label: { en: ["legacy service"] },
      items: [
        {
          id: "https://example.org/canvas/1",
          type: "Canvas",
          width: 1000,
          height: 1000,
          service: [
            {
              "@id": "https://example.org/legacy-service",
              profile: "http://iiif.io/api/image/2/level2.json",
            },
          ],
          items: [],
        },
      ],
    };

    const report = validatePresentation4(manifest, { mode: "tolerant" });

    expect(
      report.issues.some(
        (item) =>
          item.code === "class-requirement-must" &&
          (item.path === "$.items[0].service[0].id" || item.path === "$.items[0].service[0].type")
      )
    ).toBe(false);
  });

  test("reports must/may/must-not class requirement violations", () => {
    const invalid = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/collection/invalid-rules",
      type: "Collection",
      items: [
        {
          id: "https://example.org/manifest/1",
          type: "Manifest",
          items: [],
        },
      ],
    };

    const report = validatePresentation4(invalid, { mode: "tolerant" });

    expect(report.valid).toBe(false);
    expect(report.issues.some((item) => item.code === "class-requirement-must")).toBe(true);
    expect(report.issues.some((item) => item.code === "collection-item-manifest-forbidden")).toBe(true);
  });

  test("reports container fragment ids, unknown properties, and annotation bodyValue usage", () => {
    const invalid = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/rule-detail",
      type: "Manifest",
      label: { en: ["rule detail"] },
      items: [
        {
          id: "https://example.org/canvas/1#xywh=0,0,100,100",
          type: "Canvas",
          width: 1000,
          height: 1000,
          foo: "bar",
          items: [
            {
              id: "https://example.org/canvas/1/page/1",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/canvas/1/page/1/anno/1",
                  type: "Annotation",
                  motivation: ["commenting"],
                  target: {
                    id: "https://example.org/canvas/1",
                    type: "Canvas",
                  },
                  bodyValue: "invalid body value",
                },
              ],
            },
          ],
        },
      ],
    };

    const report = validatePresentation4(invalid, { mode: "tolerant" });
    expect(report.issues.some((item) => item.code === "container-id-fragment-forbidden")).toBe(true);
    expect(report.issues.some((item) => item.code === "class-requirement-property-not-listed")).toBe(true);
    expect(report.issues.some((item) => item.code === "annotation-body-value-forbidden")).toBe(true);
  });
});
