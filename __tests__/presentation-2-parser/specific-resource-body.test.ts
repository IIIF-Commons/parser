import annotation from "../../fixtures/regressions/p2-image-selector-body.json";
import { convertPresentation2 } from "../../src/presentation-2";
import { normalize, serialize, serializeConfigPresentation3 } from "../../src";

// P2 form of the rotation example: https://iiif.io/api/annex/openannotation/#iiif-image-api-selector
test("upgrades specific resource bodies without losing the source or selector (#27)", () => {
  const upgraded = convertPresentation2(structuredClone(annotation)) as any;
  expect(upgraded.body).toMatchObject({
    type: "SpecificResource",
    source: {
      id: annotation.resource.full["@id"],
      type: "Image",
      label: { none: ["Image to rotate"] },
      service: [{ "@id": annotation.resource.full.service["@id"], "@type": "ImageService2" }],
    },
    selector: {
      type: "ImageApiSelector",
      region: "pct:0,0,10,10",
      size: "200,",
      rotation: "90",
      quality: "gray",
      format: "png",
    },
  });
  const result = normalize(structuredClone(upgraded));
  const output = serialize<any>({ ...result, requests: {} }, result.resource, serializeConfigPresentation3);
  expect(output.body.source.id).toBe(annotation.resource.full["@id"]);
  expect(output.body.selector).toEqual(upgraded.body.selector);
});

test("retains extension selectors in bodies without rejecting the document", () => {
  const input = structuredClone(annotation) as any;
  input.resource.selector = { "@type": "oa:TextQuoteSelector", exact: "A quotation" };
  const output = convertPresentation2(input) as any;
  expect(output.body.source.id).toBe(annotation.resource.full["@id"]);
  expect(output.body.selector).toEqual({ type: "TextQuoteSelector", exact: "A quotation" });
});
