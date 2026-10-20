import { normalize, serialize, serializeConfigPresentation3, Traverse } from "../../src";
import homepage from "../../fixtures/cookbook/0047-homepage.json";
import seeAlso from "../../fixtures/cookbook/0053-seeAlso.json";
import provider from "../../fixtures/cookbook/0234-provider.json";

function roundTrip(input: any): any {
  const result = normalize(structuredClone(input));
  return serialize({ ...result, requests: {} }, result.resource, serializeConfigPresentation3);
}

describe("Presentation 3 linked fields (#28)", () => {
  test.each([homepage, seeAlso, provider])("preserves published cookbook links for $id", (manifest) => {
    const result = roundTrip(manifest);
    for (const key of ["homepage", "seeAlso", "provider"] as const) {
      if ((manifest as any)[key]) expect(result[key]).toEqual((manifest as any)[key]);
    }
    expect(JSON.stringify(result)).not.toContain("__$UNSET$__");
  });

  test("resolves links on annotations, their bodies, and agents", () => {
    const link = { id: "https://example.org/data", type: "Dataset", format: "application/json" };
    const agent = {
      id: "https://example.org/agent",
      type: "Agent",
      label: { en: ["Provider"] },
      homepage: [{ id: "https://example.org", type: "Text", format: "text/html" }],
      seeAlso: [link],
    };
    const input = {
      id: "https://example.org/annotation",
      type: "Annotation",
      motivation: "commenting",
      label: { en: ["Comment"] },
      summary: { en: ["Summary"] },
      seeAlso: [link],
      provider: [agent],
      target: "https://example.org/canvas",
      body: { id: "https://example.org/body", type: "TextualBody", value: "Hello", seeAlso: [link] },
    };
    expect(roundTrip(input)).toEqual(input);
  });

  test.each(["Manifest", "Collection"])("preserves homepage on a %s referenced through partOf", (type) => {
    const manifest = {
      id: "https://example.org/parent",
      type,
      label: { en: ["Parent"] },
      homepage: [{ id: "https://example.org/home", type: "Text", format: "text/html" }],
    };
    const input = { id: "https://example.org/canvas", type: "Canvas", items: [], partOf: [manifest] };
    expect(roundTrip(input).partOf).toEqual([manifest]);
  });
  test.each(["Manifest", "Collection"])("serializes %s items with a back-reference to their collection", (type) => {
    const id = "https://example.org/collection";
    const input = {
      id,
      type: "Collection",
      label: { en: ["Parent"] },
      items: [
        {
          id: "https://example.org/child",
          type,
          label: { en: ["Child"] },
          partOf: [{ id, type: "Collection" }],
        },
      ],
    };
    expect(roundTrip(input).items[0].partOf).toBeUndefined();
  });

  test("keeps the content resource as the service callback parent", () => {
    const image = {
      id: "https://example.org/image",
      type: "Image",
      service: [{ id: "https://example.org/service", type: "ImageService3", profile: "level1" }],
    };
    const parents: unknown[] = [];
    new Traverse({
      service: [
        (_, context) => {
          parents.push(context.parent);
        },
      ],
    }).traverseContentResource(image as any);
    expect(parents).toEqual([image]);
  });

  test("preserves the existing inline body-link store shape", () => {
    const link = { id: "https://example.org/data", type: "Dataset", format: "application/json" };
    const result = normalize({
      id: "https://example.org/annotation",
      type: "Annotation",
      target: "https://example.org/canvas",
      body: { id: "https://example.org/body", type: "TextualBody", value: "Hello", seeAlso: [link] },
    });
    expect((result.entities.ContentResource as any)["https://example.org/body"].seeAlso).toEqual([link]);
  });

  test("keeps self-referencing inline links finite", () => {
    const id = "https://example.org/thumbnail";
    const input = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/manifest",
      type: "Manifest",
      label: { en: ["Manifest"] },
      items: [],
      thumbnail: [{ id, type: "Image", seeAlso: [{ id, type: "Image" }] }],
    };
    expect(roundTrip(input)).toEqual(input);
  });

  test("keeps ignoring untyped links in manually populated stores", () => {
    const result = normalize({ id: "https://example.org/manifest", type: "Manifest", items: [] });
    (result.entities.Manifest as any)[result.resource.id].homepage = [
      "https://example.org/link",
      { id: "https://example.org/link" },
    ];
    const output = serialize<any>({ ...result, requests: {} }, result.resource, serializeConfigPresentation3);
    expect(output.homepage).toBeUndefined();
  });
});
