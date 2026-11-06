import { describe, expect, test } from "vitest";
import { normalize, serialize, serializeConfigPresentation4 } from "../../src/presentation-4";

const canvasId = "https://example.org/canvas";
const pageId = "https://example.org/annotations";
const annotationId = `${pageId}/annotation`;
const selector = { type: "FragmentSelector", value: "xywh=0,0,200,20" };

function annotationPage(version: 3 | 4, target: unknown) {
  return {
    "@context": `http://iiif.io/api/presentation/${version}/context.json`,
    id: pageId,
    type: "AnnotationPage",
    items: [
      {
        id: annotationId,
        type: "Annotation",
        motivation: "supplementing",
        body: { type: "TextualBody", value: "Page transcript", format: "text/plain" },
        target,
      },
    ],
  };
}

function serializeResult(result: ReturnType<typeof normalize>) {
  return serialize(
    { entities: result.entities, mapping: result.mapping, requests: {} },
    result.resource,
    serializeConfigPresentation4
  ) as any;
}

describe.each([3, 4] as const)("Canvas references from Presentation %s", (version) => {
  test.each([
    ["fragment string", () => `${canvasId}#${selector.value}`],
    ["SpecificResource", () => ({ type: "SpecificResource", source: { id: canvasId, type: "Canvas" }, selector })],
    ["plain reference", () => ({ id: canvasId, type: "Canvas" })],
  ] as const)("keeps a %s annotation target inline without importing empty Canvas defaults", (kind, target) => {
    const result = normalize(annotationPage(version, target()));
    const annotation = result.entities.Annotation[annotationId] as any;

    expect(result.entities.Canvas).toEqual({});
    expect(result.mapping[canvasId]).toBeUndefined();
    expect(annotation.target.source || annotation.target).toEqual({ id: canvasId, type: "Canvas" });
    const output = serializeResult(result);
    expect(output.items[0].target.source || output.items[0].target).toEqual({ id: canvasId, type: "Canvas" });
    if (kind !== "plain reference") {
      expect(annotation.target.selector[0]).toMatchObject(selector);
      expect(output.items[0].target.selector[0]).toMatchObject(selector);
    }
  });

  test("does not import Canvas defaults from targets inside an Independents resource", () => {
    const result = normalize(
      annotationPage(version, {
        type: "Independents",
        items: [
          { type: "SpecificResource", source: { id: canvasId, type: "Canvas" }, selector },
          `${canvasId}/other#xywh=10,20,30,40`,
        ],
      })
    );
    const target = (result.entities.Annotation[annotationId] as any).target;

    expect(result.entities.Canvas).toEqual({});
    expect(target.items.map((item: any) => item.source)).toEqual([
      { id: canvasId, type: "Canvas" },
      { id: `${canvasId}/other`, type: "Canvas" },
    ]);
  });

  test("retains the loaded Canvas metadata and frames when its embedded annotation targets it", () => {
    const manifestId = "https://example.org/manifest";
    const result = normalize({
      "@context": `http://iiif.io/api/presentation/${version}/context.json`,
      id: manifestId,
      type: "Manifest",
      items: [
        {
          id: canvasId,
          type: "Canvas",
          width: 200,
          height: 300,
          label: { en: ["Page 1"] },
          thumbnail: [{ id: "https://example.org/thumb.jpg", type: "Image" }],
          items: [],
          annotations: [annotationPage(version, `${canvasId}#${selector.value}`)],
        },
      ],
    });
    const canvas = result.entities.Canvas[canvasId] as any;

    expect(canvas).toMatchObject({
      width: 200,
      height: 300,
      label: { en: ["Page 1"] },
      thumbnail: [{ id: "https://example.org/thumb.jpg" }],
      items: [],
    });
    expect(canvas["iiif-parser:hasPart"].map((frame: any) => frame["iiif-parser:partOf"])).toEqual([manifestId]);
    expect(canvas["iiif-parser:isExternal"]).not.toBe(true);

    // Importing this later must contribute no Canvas update to a consumer's store.
    const external = normalize(annotationPage(version, `${canvasId}#${selector.value}`));
    expect(external.entities.Canvas[canvasId]).toBeUndefined();
  });

  test("keeps explicit empty fields and dimensions on a complete Canvas update", () => {
    const result = normalize({
      "@context": `http://iiif.io/api/presentation/${version}/context.json`,
      id: "https://example.org/updated-manifest",
      type: "Manifest",
      items: [{ id: canvasId, type: "Canvas", label: null, thumbnail: [], items: [], width: 900, height: 600 }],
    });
    const canvas = result.entities.Canvas[canvasId] as any;

    expect(canvas).toMatchObject({ label: null, thumbnail: [], items: [], width: 900, height: 600 });
    expect(canvas["iiif-parser:isExternal"]).not.toBe(true);
  });
});

test.each([false, true])("marks a legacy Canvas partOf reference as external (items present: %s)", (hasItems) => {
  const result = normalize({
    ...annotationPage(3, `${canvasId}#${selector.value}`),
    partOf: [{ id: canvasId, type: "Canvas", width: 200, height: 300, ...(hasItems ? { items: [] } : {}) }],
  });
  const canvas = result.entities.Canvas[canvasId] as any;

  expect(canvas["iiif-parser:isExternal"]).toBe(hasItems ? undefined : true);
  expect(canvas).toMatchObject({ items: [], width: 200, height: 300 });
});
