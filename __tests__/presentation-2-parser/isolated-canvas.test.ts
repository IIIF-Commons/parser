import canvas from "../../fixtures/presentation-2/tpen-isolated-canvas.json";
import { normalize } from "../../src";
import { upgrade } from "../../src/upgrader";
import { convertPresentation2, presentation2to3 } from "../../src/presentation-2";

describe("isolated Presentation 2 canvases (#53)", () => {
  test("upgrades the context-free TPEN canvas through the public entrypoints", () => {
    // Source: https://t-pen.org/TPEN/canvas/13250383
    for (const convert of [convertPresentation2, upgrade]) {
      const result = convert(structuredClone(canvas)) as any;
      expect(result).toMatchObject({
        id: canvas["@id"],
        type: "Canvas",
        label: { none: [canvas.label] },
        width: 666,
        height: 1000,
      });
      expect(result.annotations[0].type).toBe("AnnotationPage");
      expect(normalize(result).resource).toEqual({ id: canvas["@id"], type: "Canvas" });
    }
  });

  test("preserves already upgraded resources", () => {
    const result = presentation2to3.traverseCanvas(structuredClone(canvas) as any);
    expect(convertPresentation2(result)).toBe(result);
  });
});
