import { normalize, serialize, serializeConfigPresentation3 } from "../../src";

describe("Presentation 3 compatibility coverage (#29)", () => {
  test("retains annotation audience, accessibility and non-array motivation", () => {
    const id = "https://example.org/annotation";
    const input = {
      id,
      type: "Annotation",
      motivation: "commenting",
      target: "https://example.org/canvas",
      audience: { id: "https://example.org/audience", type: "Audience" },
      accessibility: "alternativeText",
      seeAlso: [{ id: "https://example.org/data", type: "Dataset", format: "application/json" }],
      body: { type: "TextualBody", value: "A description" },
    };
    const result = normalize(structuredClone(input));
    const stored = (result.entities.Annotation as any)[id];
    expect(stored.audience).toEqual([input.audience]);
    expect(stored.accessibility).toEqual(["alternativeText"]);
    expect(stored.motivation).toEqual(["commenting"]);
    stored.motivation = "commenting";
    const output = serialize<any>({ ...result, requests: {} }, result.resource, serializeConfigPresentation3);
    expect(output.motivation).toBe("commenting");
    expect(output.seeAlso).toEqual([{ id: "https://example.org/data", type: "Dataset", format: "application/json" }]);
    expect(output.body.value).toBe("A description");
  });

  test("serializes ImageService2 and records a single-object nested service", () => {
    const input = {
      id: "https://example.org/image.jpg",
      type: "Image",
      format: "image/jpeg",
      service: [
        {
          id: "https://example.org/image",
          type: "ImageService2",
          profile: "level1",
          service: {
            id: "https://example.org/auth",
            type: "AuthCookieService1",
            profile: "http://iiif.io/api/auth/1/login",
          },
        },
      ],
    };
    const result = normalize({
      id: "https://example.org/annotation",
      type: "Annotation",
      motivation: "painting",
      target: "https://example.org/canvas",
      body: input,
    });
    expect((result.entities.Service as any)["https://example.org/auth"]).toBeDefined();
    const output = serialize<any>({ ...result, requests: {} }, result.resource, serializeConfigPresentation3);
    expect(output.body.service[0]).toMatchObject({
      "@id": "https://example.org/image",
      "@type": "ImageService2",
      profile: "http://iiif.io/api/image/2/level1.json",
    });
    expect(output.body.service[0].service).toHaveLength(1);
  });
});
