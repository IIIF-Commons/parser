import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { describe, expect, test } from "vitest";
import { Traverse } from "../../src/presentation-4";

describe("presentation-4 traverse", () => {
  test("dispatches callbacks across mixed resource types", () => {
    const fixture = JSON.parse(
      readFileSync(join(cwd(), "fixtures/presentation-4/21-scene-within-canvas.json"), "utf8")
    );

    const seen = {
      manifest: 0,
      scene: 0,
      canvas: 0,
      range: 0,
      annotationPage: 0,
      annotation: 0,
      selector: 0,
      contentResource: 0,
    };

    const traverse = new Traverse({
      manifest: [
        () => {
          seen.manifest += 1;
        },
      ],
      scene: [
        () => {
          seen.scene += 1;
        },
      ],
      canvas: [
        () => {
          seen.canvas += 1;
        },
      ],
      range: [
        () => {
          seen.range += 1;
        },
      ],
      annotationPage: [
        () => {
          seen.annotationPage += 1;
        },
      ],
      annotation: [
        () => {
          seen.annotation += 1;
        },
      ],
      selector: [
        () => {
          seen.selector += 1;
        },
      ],
      contentResource: [
        () => {
          seen.contentResource += 1;
        },
      ],
    });

    traverse.traverseUnknown(fixture, { path: "$" });

    expect(seen.manifest).toBeGreaterThan(0);
    expect(seen.scene).toBeGreaterThan(0);
    expect(seen.canvas).toBeGreaterThan(0);
    expect(seen.range).toBeGreaterThan(0);
    expect(seen.annotationPage).toBeGreaterThan(0);
    expect(seen.annotation).toBeGreaterThan(0);
    expect(seen.selector).toBeGreaterThan(0);
    expect(seen.contentResource).toBeGreaterThan(0);
  });

  test("traverses selector on implicit specific resource annotation target", () => {
    let selectorCount = 0;
    const traverse = new Traverse({
      selector: [
        () => {
          selectorCount += 1;
        },
      ],
    });

    const annotation = {
      id: "https://example.org/anno/1",
      type: "Annotation",
      motivation: ["painting"],
      target: [
        {
          source: {
            id: "https://example.org/canvas/1",
            type: "Canvas",
          },
          selector: {
            type: "FragmentSelector",
            value: "xywh=10,20,30,40",
          },
        },
      ],
    };

    const traversed = traverse.traverseAnnotation(annotation, undefined, "$.annotation");
    const target = traversed.target[0];

    expect(target.type).toBe("SpecificResource");
    expect(target.selector[0].type).toBe("FragmentSelector");
    expect(selectorCount).toBe(1);
  });

  test("accepts List-wrapped annotation body and target values", () => {
    const traverse = new Traverse();
    const annotation = {
      id: "https://example.org/anno/list-wrapper",
      type: "Annotation",
      motivation: ["painting"],
      body: {
        type: "List",
        items: [
          {
            id: "https://example.org/body/1",
            type: "Image",
            format: "image/jpeg",
          },
        ],
      },
      target: {
        type: "List",
        items: ["https://example.org/canvas/1#xywh=1,2,3,4"],
      },
    };

    const traversed = traverse.traverseAnnotation(annotation, undefined, "$.annotation");
    expect(Array.isArray(traversed.body)).toBe(true);
    expect(Array.isArray(traversed.target)).toBe(true);
    expect(traversed.body).toHaveLength(1);
    expect(traversed.target).toHaveLength(1);
    expect(traversed.target[0].type).toBe("SpecificResource");
    expect(traversed.target[0].selector[0].type).toBe("FragmentSelector");
  });

  test("coerces PointSelector.t to PointSelector.instant by default", () => {
    const traverse = new Traverse();
    const selector = {
      type: "PointSelector",
      x: 1,
      y: 2,
      t: 3.5,
    };

    const traversed = traverse.traverseSelector(selector, undefined, "$.selector");
    expect(traversed.instant).toBe(3.5);
    expect(Object.hasOwn(traversed, "t")).toBe(false);
  });

  test("can disable PointSelector.t coercion via traverse option", () => {
    const traverse = new Traverse(
      {},
      {
        coerceLegacyPointSelectorTime: false,
      }
    );
    const selector = {
      type: "PointSelector",
      x: 1,
      y: 2,
      t: 3.5,
    };

    const traversed = traverse.traverseSelector(selector, undefined, "$.selector");
    expect(traversed.t).toBe(3.5);
    expect(Object.hasOwn(traversed, "instant")).toBe(false);
  });

  test("normalizes paging first/last string references to typed objects", () => {
    const traverse = new Traverse();
    const annotationCollection = {
      id: "https://example.org/annotation-collection/1",
      type: "AnnotationCollection",
      first: "https://example.org/annotation-collection/1/page/1",
      last: "https://example.org/annotation-collection/1/page/2",
      items: [],
    };

    const traversedAnnotationCollection = traverse.traverseAnnotationCollection(
      annotationCollection,
      undefined,
      "$.annotationCollection"
    );

    expect(traversedAnnotationCollection.first).toEqual({
      id: "https://example.org/annotation-collection/1/page/1",
      type: "AnnotationPage",
    });
    expect(traversedAnnotationCollection.last).toEqual({
      id: "https://example.org/annotation-collection/1/page/2",
      type: "AnnotationPage",
    });

    const collection = {
      id: "https://example.org/collection/1",
      type: "Collection",
      first: "https://example.org/collection/1/page/1",
      last: "https://example.org/collection/1/page/2",
      items: [],
    };

    const traversedCollection = traverse.traverseCollection(collection, undefined, "$.collection");
    expect(traversedCollection.first).toEqual({
      id: "https://example.org/collection/1/page/1",
      type: "CollectionPage",
    });
    expect(traversedCollection.last).toEqual({
      id: "https://example.org/collection/1/page/2",
      type: "CollectionPage",
    });
  });
});
