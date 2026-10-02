import { describe, expect, test } from "vitest";
import { normalize } from "../../src/presentation-3";

describe("Canvas references", () => {
  test.each([false, true])("marks a partOf Canvas as external when items is present: %s", (hasItems) => {
    const canvasId = "https://example.org/canvas";
    const result = normalize({
      id: "https://example.org/annotations",
      type: "AnnotationPage",
      items: [],
      partOf: [{ id: canvasId, type: "Canvas", width: 2160, height: 3426, ...(hasItems ? { items: [] } : {}) }],
    });

    const canvas = result.entities.Canvas[canvasId] as any;
    expect(canvas["iiif-parser:isExternal"]).toBe(hasItems ? undefined : true);
    expect(canvas.items).toEqual([]);
    expect(canvas.width).toBe(2160);
    expect(canvas.height).toBe(3426);
  });
});
