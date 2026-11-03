import { presentation3to2downgrade } from "../../src/presentation-2";
import type { Manifest } from "../../src/presentation-3/types";
import type { Manifest as Manifest2 } from "../../src/presentation-2/types";
import referencedAnnotations from "../../fixtures/cookbook/0269-embedded-or-referenced-annotations-annotationpage.json";

const id = "https://example.org/manifest";

function manifest(properties: object = {}) {
  return { id, type: "Manifest", label: { en: ["Book"] }, items: [], ...properties };
}

describe("Presentation 3 to 2 downgrade", () => {
  test("exports a typed, non-mutating normalize + serialize helper", () => {
    const input: Manifest = { id, type: "Manifest", label: { en: ["Book"] }, items: [] };
    const before = structuredClone(input);
    const output: Manifest2 = presentation3to2downgrade(input);
    expect(output["@type"]).toBe("sc:Manifest");
    expect(output.sequences[0]?.canvases).toEqual([]);
    expect(input).toEqual(before);
  });

  test("keeps search protocols, URLs, extension profiles and nested services", () => {
    const output = presentation3to2downgrade(
      manifest({
        service: [
          {
            id: `${id}/search`,
            type: "SearchService2",
            service: [{ id: `${id}/autocomplete`, type: "AutoCompleteService2" }],
          },
          {
            id: `${id}/search-v1`,
            type: "SearchService1",
            service: { id: `${id}/autocomplete-v1`, type: "AutoCompleteService1" },
          },
          { id: `${id}/custom`, type: "CustomService", profile: "https://example.org/custom", extra: true },
          { "@id": `${id}/auth`, "@type": "AuthCookieService1", profile: "http://iiif.io/api/auth/1/login" },
        ],
      })
    ) as any;
    expect(output.service).toEqual([
      {
        "@id": `${id}/search`,
        "@type": "SearchService2",
        "@context": "http://iiif.io/api/search/2/context.json",
        service: {
          "@id": `${id}/autocomplete`,
          "@type": "AutoCompleteService2",
          "@context": "http://iiif.io/api/search/2/context.json",
        },
      },
      {
        "@id": `${id}/search-v1`,
        "@type": "SearchService1",
        "@context": "http://iiif.io/api/search/1/context.json",
        profile: "http://iiif.io/api/search/1/search",
        service: {
          "@id": `${id}/autocomplete-v1`,
          "@type": "AutoCompleteService1",
          "@context": "http://iiif.io/api/search/1/context.json",
          profile: "http://iiif.io/api/search/1/autocomplete",
        },
      },
      { "@id": `${id}/custom`, "@type": "CustomService", profile: "https://example.org/custom", extra: true },
      { "@id": `${id}/auth`, "@type": "AuthCookieService1", profile: "http://iiif.io/api/auth/1/login" },
    ]);
  });

  test("uses canonical image profiles without relabelling Image 3 endpoints", () => {
    const output = presentation3to2downgrade(
      manifest({
        service: [
          { id: `${id}/image2`, type: "ImageService2", profile: "level1" },
          { id: `${id}/image3`, type: "ImageService3", profile: "level2" },
          { "@id": `${id}/legacy`, profile: ["http://iiif.io/api/image/2/level0.json", { supports: ["sizeByWh"] }] },
        ],
      })
    ) as any;
    expect(output.service[0]).toEqual({
      "@id": `${id}/image2`,
      "@context": "http://iiif.io/api/image/2/context.json",
      profile: "http://iiif.io/api/image/2/level1.json",
    });
    expect(output.service[1]).toMatchObject({
      "@type": "ImageService3",
      "@context": "http://iiif.io/api/image/3/context.json",
      profile: "level2",
    });
    expect(output.service[2].profile).toEqual(["http://iiif.io/api/image/2/level0.json", { supports: ["sizeByWh"] }]);
  });

  test.each(["TextualBody", "Text"])("converts %s line transcriptions to v2 lists, chars and xywh targets", (type) => {
    const page = {
      id: `${id}/lines`,
      type: "AnnotationPage",
      items: [
        {
          id: `${id}/line1`,
          type: "Annotation",
          motivation: "supplementing",
          body: { type, value: "First line", language: "en" },
          target: `${id}/canvas#xywh=10,20,300,40`,
        },
        {
          id: `${id}/line2`,
          type: "Annotation",
          motivation: "supplementing",
          body: { type, value: "<p>Second line</p>", format: "text/html" },
          target: {
            type: "SpecificResource",
            source: `${id}/canvas`,
            selector: { type: "FragmentSelector", value: "xywh=10,60,300,40" },
          },
        },
      ],
    };
    const output = presentation3to2downgrade(
      manifest({
        items: [{ id: `${id}/canvas`, type: "Canvas", width: 400, height: 800, items: [], annotations: [page] }],
      })
    ) as any;
    const list = output.sequences[0].canvases[0].otherContent[0];
    expect(list["@type"]).toBe("sc:AnnotationList");
    expect(list.resources[0]).toMatchObject({
      "@type": "oa:Annotation",
      motivation: "sc:painting",
      on: `${id}/canvas#xywh=10,20,300,40`,
      resource: { "@type": "cnt:ContentAsText", chars: "First line", format: "text/plain", language: "en" },
    });
    expect(list.resources[1]).toMatchObject({
      on: `${id}/canvas#xywh=10,60,300,40`,
      resource: { "@type": "cnt:ContentAsText", chars: "<p>Second line</p>", format: "text/html" },
    });
    expect((presentation3to2downgrade(page) as any).resources).toEqual(list.resources);
    expect(JSON.stringify(output)).not.toMatch(/vault:\/\/|TextualBody|supplementing/);
  });

  test("retains nested range membership and standalone resource contexts", () => {
    const output = presentation3to2downgrade({
      id: `${id}/range`,
      type: "Range",
      items: [
        {
          id: `${id}/chapter`,
          type: "Range",
          label: { en: ["Chapter"] },
          items: [{ id: `${id}/canvas`, type: "Canvas" }],
        },
      ],
    }) as any;
    expect(output["@context"]).toBe("http://iiif.io/api/presentation/2/context.json");
    expect(output.members[0]).toMatchObject({
      "@type": "sc:Range",
      label: "Chapter",
      canvases: [`${id}/canvas`],
      within: `${id}/range`,
    });
    const canvas = presentation3to2downgrade({
      id: `${id}/canvas`,
      type: "Canvas",
      width: 100,
      height: 100,
      items: [],
    }) as any;
    expect(canvas["@context"]).toBe("http://iiif.io/api/presentation/2/context.json");
  });

  test("converts external annotation page responses separately", () => {
    const output = presentation3to2downgrade(referencedAnnotations) as any;
    expect(output["@context"]).toBe("http://iiif.io/api/presentation/2/context.json");
    expect(output.resources[0].resource.chars).toBe(referencedAnnotations.items[0]!.body.value);
  });

  test("preserves rights, viewing hints, links, provider logos and start fragments", () => {
    const output = presentation3to2downgrade(
      manifest({
        rights: "https://example.org/license",
        behavior: ["paged"],
        homepage: [{ id: `${id}/home`, type: "Text", format: "text/html" }],
        provider: [{ id: `${id}/provider`, type: "Agent", logo: [{ id: `${id}/logo.png`, type: "Image" }] }],
        start: {
          type: "SpecificResource",
          source: { id: `${id}/canvas`, type: "Canvas" },
          selector: { type: "FragmentSelector", value: "xywh=10,20,30,40" },
        },
      })
    ) as any;
    expect(output).toMatchObject({
      license: "https://example.org/license",
      viewingHint: "paged",
      related: { "@id": `${id}/home`, "@type": "dctypes:Text" },
      logo: { "@id": `${id}/logo.png` },
      startCanvas: `${id}/canvas#xywh=10,20,30,40`,
    });
  });
});
