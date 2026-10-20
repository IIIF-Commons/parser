import { expandTargetToSpecificResource } from "../../src/shared/expand-target";

const id = "https://example.org/canvas";

describe("annotation target hints (#29)", () => {
  test.each([[[id]], { type: "Choice", items: [id] }, { type: "List", items: [id] }])(
    "keeps the configured source type when choosing the first target in %j",
    (input) => {
      expect(expandTargetToSpecificResource(input as any, { typeHint: "Canvas" }).source).toEqual({
        id,
        type: "Canvas",
      });
    }
  );

  test("uses the known source type for fragment targets", () => {
    const result = expandTargetToSpecificResource(`${id}#t=10,20`, { typeMap: { [id]: "Canvas" } });
    expect(result.source).toEqual({ id, type: "Canvas" });
    expect(result.selector).toEqual({ type: "FragmentSelector", value: "t=10,20" });
  });

  test("normalizes a canvas's manifest membership", () => {
    expect(
      expandTargetToSpecificResource({
        type: "SpecificResource",
        source: { id, type: "Canvas", partOf: "https://example.org/manifest" },
        selector: { type: "FragmentSelector", value: "xywh=1,2,3,4" },
      } as any)
    ).toMatchObject({
      source: { id, type: "Canvas", partOf: [{ id: "https://example.org/manifest", type: "Manifest" }] },
    });
  });
});
