import { normalize, serialize, serializeConfigPresentation3 } from "../../src";
import rangeManifest from "../../fixtures/cookbook/0065-opera-multiple-canvases.json";

const canvasId = "https://example.org/canvas";
const fragment = "xywh=0,1,2,3";

describe("range selectors (#3)", () => {
  test.each([
    `${canvasId}#${fragment}`,
    { id: `${canvasId}#${fragment}`, type: "Canvas" },
    { type: "SpecificResource", source: canvasId, selector: { type: "FragmentSelector", value: fragment } },
    {
      type: "SpecificResource",
      source: { id: canvasId, type: "Canvas" },
      selector: { type: "FragmentSelector", value: fragment },
    },
  ])("keeps a canonical canvas reference for %j", (item) => {
    const result = normalize({ id: "https://example.org/range", type: "Range", items: [structuredClone(item)] });
    const range = (result.entities.Range as any)[result.resource.id];
    expect(range.items[0]).toEqual({
      type: "SpecificResource",
      source: { id: canvasId, type: "Canvas" },
      selector: { type: "FragmentSelector", value: fragment },
    });
    expect((result.entities.Canvas as any)[canvasId]).toBeDefined();
    expect((result.mapping as any)[`${canvasId}#${fragment}`]).toBeUndefined();
    const output = serialize<any>({ ...result, requests: {} }, result.resource, serializeConfigPresentation3);
    expect(output.items).toEqual([{ id: `${canvasId}#${fragment}`, type: "Canvas" }]);
  });

  test("preserves temporal canvas selectors from the opera cookbook manifest", () => {
    const result = normalize(structuredClone(rangeManifest));
    expect(Object.keys(result.entities.Canvas).every((id) => !id.includes("#t="))).toBe(true);
    const output = serialize<any>({ ...result, requests: {} }, result.resource, serializeConfigPresentation3);
    expect(output.structures).toEqual(rangeManifest.structures);
  });
  test("keeps unrelated anchor names intact", () => {
    const id = `${canvasId}#part=2`;
    const result = normalize({ id: "https://example.org/range", type: "Range", items: [id] });
    expect((result.entities.Canvas as any)[id]).toBeDefined();
    expect((result.entities.Range as any)[result.resource.id].items[0].selector).toBeUndefined();
  });
});
