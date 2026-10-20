import { normalize, serialize, serializeConfigPresentation2 } from "../../src";
import annotationList from "../../fixtures/presentation-2/iiif-fixture-annotation-list.json";
import manifest from "../../fixtures/presentation-2/iiif-fixture-manifest.json";
import selectedImage from "../../fixtures/regressions/p2-image-selector-body.json";

function asPresentation2(input: any): any {
  const result = normalize(structuredClone(input));
  return serialize({ ...result, requests: {} }, result.resource, serializeConfigPresentation2);
}

describe("Presentation 2 Open Annotation serialization (#49)", () => {
  test("preserves text, motivations and selectors in the official annotation list", () => {
    const output = asPresentation2(annotationList);
    expect(output["@type"]).toBe("sc:AnnotationList");
    expect(Array.isArray(output.resources)).toBe(true);
    expect(output.resources).toHaveLength(2);
    expect(output.resources[0].resource).toMatchObject({
      "@type": "cnt:ContentAsText",
      chars: "Top of First Page to Display",
    });
    expect(output.resources[0].on).toBe(`${(annotationList as any).resources[0].on.full["@id"]}#xywh=225,70,750,150`);
    expect(output.resources[1].motivation).toEqual(["oa:tagging", "oa:commenting"]);
    expect(output.resources[1].resource.map((body: any) => body.chars)).toEqual(
      (annotationList as any).resources[1].resource.map((body: any) => body.chars)
    );
    expect(output.resources[1].on).toMatchObject({
      "@type": "oa:SpecificResource",
      selector: { "@type": "oa:Choice" },
    });
    expect(JSON.stringify(output)).not.toContain("vault://");
  });

  test("serializes painting pages as flat images arrays and external lists as otherContent", () => {
    const input = structuredClone(manifest) as any;
    input.sequences[0].canvases[0].otherContent = [
      { "@id": "https://example.org/comments", "@type": "sc:AnnotationList" },
    ];
    const output = asPresentation2(input);
    const canvas = output.sequences[0].canvases[0];
    expect(Array.isArray(canvas.images)).toBe(true);
    expect(Array.isArray(canvas.images[0])).toBe(false);
    expect(canvas.images[0]["@type"]).toBe("oa:Annotation");
    expect(canvas.otherContent[0]["@id"]).toBe("https://example.org/comments");
    expect(canvas.annotations).toBeUndefined();
  });

  test("converts selected image bodies and all image selector parameters", () => {
    const output = asPresentation2(selectedImage);
    expect(output.resource).toMatchObject({
      "@type": "oa:SpecificResource",
      full: { "@id": selectedImage.resource.full["@id"], "@type": "dctypes:Image" },
      selector: selectedImage.resource.selector,
    });
  });

  test("serializes collection members and fragment-bearing range canvas references", () => {
    const output = asPresentation2({
      id: "https://example.org/collection",
      type: "Collection",
      label: { en: ["Collection"] },
      items: [{ id: "https://example.org/manifest", type: "Manifest", label: { en: ["Manifest"] }, items: [] }],
    });
    expect(output.members).toHaveLength(1);
    expect(output.members[0]["@id"]).toBe("https://example.org/manifest");
    expect(output.members[0].sequences).toBeUndefined();
    expect(output.members[0].structures).toBeUndefined();
    const range = asPresentation2({
      id: "https://example.org/range",
      type: "Range",
      label: { en: ["Range"] },
      items: [
        {
          type: "SpecificResource",
          source: { id: "https://example.org/canvas", type: "Canvas" },
          selector: { type: "FragmentSelector", value: "t=10,20" },
        },
      ],
    });
    expect(range.canvases).toEqual(["https://example.org/canvas#t=10,20"]);
  });
});
