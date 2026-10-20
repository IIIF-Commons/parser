import {
  extractFixedSizeScales,
  fixedSizesFromScales,
  parseImageServiceRequest,
  imageServiceRequestToString,
  parseRotationParameter,
  rotationParameterToString,
  parseImageServiceUrl,
  parseRegionParameter,
} from "../../src/image-3";

describe("Image API coverage gaps (#29)", () => {
  test.each(["!90", "45.5", "0"])("parses and serializes rotation %s", (value) => {
    expect(rotationParameterToString(parseRotationParameter(value))).toBe(value);
  });

  test("normalizes angles outside one revolution and rejects invalid rotation", () => {
    expect(parseRotationParameter("!450")).toEqual({ mirror: true, angle: 90 });
    expect(() => parseRotationParameter("invalid")).toThrow("Invalid rotation");
  });

  test("round-trips prefixed info and image requests from the existing Munch examples", () => {
    const prefix = "apis/iiif/image/v2";
    for (const url of [
      "https://munch.emuseum.com/apis/iiif/image/v2/17261/info.json",
      "https://munch.emuseum.com/apis/iiif/image/v2/17261/full/max/!90/default.jpg",
    ]) {
      expect(imageServiceRequestToString(parseImageServiceRequest(url, prefix))).toBe(url);
    }
    expect(() => parseImageServiceUrl("https://example.org/image", "other")).toThrow("Path does not start with prefix");
    expect(() => parseImageServiceRequest("https://example.org/image/invalid")).toThrow("Invalid image service URL");
    expect(() => parseRegionParameter(null as any)).toThrow("Expected");
  });

  test("extracts and regenerates advertised fixed sizes", () => {
    const sizes = [
      { width: 2000, height: 1000 },
      { width: 1000, height: 500 },
      { width: 500, height: 250 },
    ];
    expect(extractFixedSizeScales(2000, 1000, sizes)).toEqual([1, 2, 4]);
    expect(fixedSizesFromScales(2000, 1000, [1, 2, 4])).toEqual(sizes);
    expect(fixedSizesFromScales(2000, 1000, [0, 2])).toEqual([sizes[1]]);
  });
  test("keeps the identifier on base-service URLs with and without prefixes", () => {
    for (const [url, prefix] of [
      ["https://example.org/identifier", ""],
      ["https://example.org/iiif/identifier", "iiif"],
    ]) {
      const parsed = parseImageServiceRequest(url!, prefix);
      expect(parsed).toMatchObject({ type: "base", identifier: "identifier" });
      expect(imageServiceRequestToString(parsed)).toBe(url);
    }
  });
});
