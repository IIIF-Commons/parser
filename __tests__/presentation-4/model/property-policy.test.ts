import { describe, expect, expectTypeOf, test } from "vitest";
import { normalize, serialize, serializeConfigPresentation4 } from "../../../src/presentation-4";
import type { CanvasNormalized } from "../../../src/presentation-4-normalized";
import type { Canvas, Quantity } from "../../../src/presentation-4/types";
import { validateAuthoredPresentation4 } from "../../../src/presentation-4/validator";
import { expectPresentation4WireClean } from "../serialization/assert-presentation-4-wire";

function serializeNormalized(normalized: ReturnType<typeof normalize>): any {
  return serialize(
    {
      entities: normalized.entities as any,
      mapping: normalized.mapping as any,
      requests: {},
    },
    normalized.resource,
    serializeConfigPresentation4
  );
}

function normalizeAndSerialize(resource: any): any {
  return serializeNormalized(normalize(resource));
}

describe("Presentation 4 model property policy", () => {
  test("preserves supported scalar, linking, interaction, and Quantity properties", () => {
    const manifest = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/property-policy",
      type: "Manifest",
      label: { en: ["Property policy"] },
      canonical: "https://canonical.example.org/manifest/property-policy",
      via: ["https://source.example.org/manifest/property-policy"],
      items: [
        {
          id: "https://example.org/canvas/property-policy",
          type: "Canvas",
          label: { en: ["Canvas"] },
          height: 100,
          width: 200,
          duration: 30,
          interactionMode: ["orbit"],
          spatialScale: {
            type: "Quantity",
            quantityValue: 0.001,
            unit: "m",
          },
          temporalScale: {
            type: "Quantity",
            quantityValue: 2,
            unit: "s",
          },
          placeholderContainer: {
            id: "https://example.org/canvas/placeholder",
            type: "Canvas",
            label: { en: ["Placeholder"] },
            height: 50,
            width: 100,
          },
          items: [
            {
              id: "https://example.org/page/property-policy",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/annotation/property-policy",
                  type: "Annotation",
                  motivation: ["supplementing"],
                  provides: ["closedCaptions"],
                  scope: [{ id: "https://example.org/camera/1", type: "PerspectiveCamera" }],
                  exclude: ["audio", "lights"],
                  body: {
                    id: "https://example.org/captions.vtt",
                    type: "Text",
                    format: "text/vtt",
                    fileSize: 412,
                    canonical: "https://canonical.example.org/captions.vtt",
                    via: ["https://source.example.org/captions.vtt"],
                  },
                  target: {
                    id: "https://example.org/canvas/property-policy",
                    type: "Canvas",
                  },
                },
              ],
            },
          ],
        },
      ],
      structures: [
        {
          id: "https://example.org/range/property-policy",
          type: "Range",
          label: { en: ["Range"] },
          items: [{ id: "https://example.org/canvas/property-policy", type: "Canvas" }],
          supplementary: {
            id: "https://example.org/annotation-collection/property-policy",
            type: "AnnotationCollection",
          },
        },
      ],
    };

    const normalized = normalize(manifest);
    const normalizedCanvas = normalized.entities.Canvas["https://example.org/canvas/property-policy"]!;
    const serialized = serializeNormalized(normalized);
    const canvas = serialized.items[0];
    const annotation = canvas.items[0].items[0];

    expect(normalizedCanvas.placeholderContainer).toEqual({
      id: "https://example.org/canvas/placeholder",
      type: "Canvas",
    });
    expect(normalizedCanvas).not.toHaveProperty("placeholderCanvas");
    expect(normalizedCanvas).not.toHaveProperty("accompanyingCanvas");
    expect(serialized).toMatchObject({
      canonical: manifest.canonical,
      via: manifest.via,
    });
    expect(canvas).toMatchObject({
      interactionMode: ["orbit"],
      spatialScale: { type: "Quantity", quantityValue: 0.001, unit: "m" },
      temporalScale: { type: "Quantity", quantityValue: 2, unit: "s" },
      placeholderContainer: {
        id: "https://example.org/canvas/placeholder",
        type: "Canvas",
      },
    });
    expect(canvas).not.toHaveProperty("placeholderCanvas");
    expect(canvas).not.toHaveProperty("accompanyingCanvas");
    expect(annotation).toMatchObject({
      provides: ["closedCaptions"],
      scope: [{ id: "https://example.org/camera/1", type: "PerspectiveCamera" }],
      exclude: ["audio", "lights"],
      body: {
        fileSize: 412,
        canonical: "https://canonical.example.org/captions.vtt",
        via: ["https://source.example.org/captions.vtt"],
      },
    });
    expect(serialized.structures[0].supplementary).toEqual({
      id: "https://example.org/annotation-collection/property-policy",
      type: "AnnotationCollection",
    });
    expect(Array.isArray(serialized.structures[0].supplementary)).toBe(false);

    const report = validateAuthoredPresentation4(serialized);
    expect(report.valid, JSON.stringify(report.issues, null, 2)).toBe(true);
    expectPresentation4WireClean(serialized, { rejectAbstractContentResource: true });
  });

  test("retains an AnnotationCollection total of zero", () => {
    const serialized = normalizeAndSerialize({
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/annotation-collection/empty",
      type: "AnnotationCollection",
      label: { en: ["Empty annotations"] },
      items: [],
      total: 0,
    });

    expect(serialized.total).toBe(0);
  });

  test("strict validation rejects the former property shapes", () => {
    const resource = {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest/invalid-property-policy",
      type: "Manifest",
      label: { en: ["Invalid property policy"] },
      items: [
        {
          id: "https://example.org/canvas/invalid-property-policy",
          type: "Canvas",
          height: 100,
          width: 100,
          spatialScale: { type: "Quantity", value: 2, unit: "m" },
          items: [
            {
              id: "https://example.org/canvas/nested",
              type: "Canvas",
              height: 10,
              width: 10,
            },
          ],
          annotations: [
            {
              id: "https://example.org/page/invalid-property-policy",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/annotation/invalid-property-policy",
                  type: "Annotation",
                  motivation: ["painting"],
                  exclude: ["Audio"],
                  target: {
                    id: "https://example.org/canvas/invalid-property-policy",
                    type: "Canvas",
                  },
                },
              ],
            },
          ],
        },
      ],
      structures: [
        {
          id: "https://example.org/range/invalid-property-policy",
          type: "Range",
          items: [{ id: "https://example.org/canvas/invalid-property-policy", type: "Canvas" }],
          supplementary: [
            {
              id: "https://example.org/annotation-collection/invalid-property-policy",
              type: "AnnotationCollection",
            },
          ],
        },
      ],
    };

    const report = validateAuthoredPresentation4(resource);

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "container-item-annotation-page" }),
        expect.objectContaining({ code: "class-requirement-must", path: expect.stringMatching(/quantityValue$/) }),
        expect.objectContaining({ code: "annotation-exclude-values" }),
        expect.objectContaining({ code: "range-supplementary-annotation-collection" }),
      ])
    );
  });
});

const validQuantity = {
  type: "Quantity",
  quantityValue: 0.5,
  unit: "relative",
} satisfies Quantity;

void validQuantity;

const canvasWithNestedContainer = {
  id: "https://example.org/canvas/type-policy",
  type: "Canvas",
  height: 100,
  width: 100,
  items: [
    // @ts-expect-error Container.items only accepts Annotation Pages.
    { id: "https://example.org/canvas/nested-type-policy", type: "Canvas", height: 10, width: 10 },
  ],
} satisfies Canvas;

void canvasWithNestedContainer;

// @ts-expect-error Quantity uses quantityValue, not value.
const invalidQuantity: Quantity = {
  type: "Quantity",
  value: 1,
  unit: "m",
};

void invalidQuantity;

expectTypeOf<"placeholderCanvas" extends keyof CanvasNormalized ? true : false>().toEqualTypeOf<false>();
expectTypeOf<"accompanyingCanvas" extends keyof CanvasNormalized ? true : false>().toEqualTypeOf<false>();
