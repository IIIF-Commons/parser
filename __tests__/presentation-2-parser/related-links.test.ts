import manifest from "../../fixtures/presentation-2/wellcome-ixif-audio.json";
import { convertPresentation2, presentation2to3 } from "../../src/presentation-2";
import { normalize, serialize, serializeConfigPresentation3 } from "../../src";

describe("Presentation 2 related links (#52)", () => {
  test("puts the Wellcome catalogue link on the manifest homepage", () => {
    // Source: https://wellcomelibrary.org/iiif/b17307922/manifest
    const upgraded = convertPresentation2(structuredClone(manifest));
    const expected = [
      {
        id: manifest.related["@id"],
        type: "Text",
        format: "text/html",
        label: { none: [manifest.related.label] },
      },
    ];
    expect(upgraded.homepage).toEqual(expected);
    expect(upgraded.provider?.[0]?.logo?.[0]).toMatchObject({ id: manifest.logo, type: "Image" });
    expect(upgraded.provider?.[0]?.homepage).toBeUndefined();
    const result = normalize(upgraded);
    expect(serialize<any>({ ...result, requests: {} }, result.resource, serializeConfigPresentation3).homepage).toEqual(
      expected
    );
  });

  test("retains every related link and avoids a provider when no logo exists", () => {
    const upgraded = presentation2to3.traverseManifest({
      "@id": "https://example.org/manifest",
      "@type": "sc:Manifest",
      label: "Manifest",
      related: [
        "https://example.org/one",
        {
          "@id": "https://example.org/two",
          format: "text/html",
          label: "Two",
        },
      ],
    } as any);
    expect(upgraded.homepage).toEqual([
      { id: "https://example.org/one", type: "Text" },
      { id: "https://example.org/two", type: "Text", format: "text/html", label: { none: ["Two"] } },
    ]);
    expect(upgraded.provider).toBeUndefined();
  });
});
