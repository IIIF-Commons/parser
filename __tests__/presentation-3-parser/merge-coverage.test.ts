import { merge, mergeEntities } from "../../src/presentation-3/normalize";

describe("normalization merge coverage (#29)", () => {
  test("merges repeated entity links and appends new links without losing either", () => {
    const existing = [{ id: "https://example.org/one", type: "Dataset", label: { en: ["One"] } }];
    const incoming = [
      { id: "https://example.org/one", type: "Dataset", format: "application/json" },
      { id: "https://example.org/two", type: "Dataset", format: "text/csv" },
    ];
    expect(merge(existing, incoming)).toEqual([{ ...existing[0], format: "application/json" }, incoming[1]]);
    expect(existing).toHaveLength(1);
    expect(existing[0]).not.toHaveProperty("format");
  });

  test("handles null values in both directions and within link arrays", () => {
    const resource = { label: { en: ["Label"] } };
    expect(merge(null, resource)).toEqual(resource);
    expect(merge(resource, null)).toBe(resource);
    expect(merge([], [null, undefined, "one"])).toEqual(["one"]);
    const link = { id: "https://example.org/link", type: "Dataset" };
    expect(merge([null], [link])).toEqual([null, link]);
  });

  test("rejects incompatible containers and preserves unchanged values", () => {
    expect(() => merge([], {})).toThrow("Cannot merge array with non-array");
    expect(() => merge({}, [])).toThrow("Cannot merge object with non-object");
    expect(merge({ en: ["One"] }, { en: ["One", "Two"] })).toEqual({ en: ["One", "Two"] });
    expect(merge(["One"], ["One"])).toEqual(["One"]);
    expect(merge([], ["One", "One"])).toEqual(["One", "One"]);
    expect(merge({ en: [] }, { en: ["One", "One"] })).toEqual({ en: ["One", "One"] });
    expect(merge([["One"]], [["Two"]])).toEqual([["One"], ["Two"]]);
  });

  test("keeps string entities and rejects missing or mismatched identifiers and types", () => {
    expect(mergeEntities("https://example.org/canvas" as any, {})).toBe("https://example.org/canvas");
    const canvas = { id: "https://example.org/canvas", type: "Canvas" };
    expect(() => mergeEntities(canvas, { id: canvas.id })).toThrow("identical identifiers and type");
    expect(() => mergeEntities(canvas, { type: "Canvas" })).toThrow("identical identifiers and type");
    expect(mergeEntities(canvas, canvas)).toEqual(canvas);
  });
  test("matches legacy service aliases without duplicating them", () => {
    const id = "https://example.org/image-service";
    const existing = [{ id, "@id": id, "@type": "ImageService2", profile: "level1" }];
    const incoming = [{ "@id": id, "@type": "ImageService2", profile: "level1", width: 1000 }];
    expect(merge(existing, incoming)).toEqual([{ ...existing[0], width: 1000 }]);
  });

  test("deduplicates equal untyped objects when merging service sizes", () => {
    const id = "https://example.org/image-service";
    const sizes = [
      { width: 100, height: 50 },
      { width: 200, height: 100 },
    ];
    const existing = [{ id, "@type": "ImageService2", sizes }];
    const incoming = [{ "@id": id, "@type": "ImageService2", sizes: structuredClone(sizes) }];
    expect(merge(existing, incoming)[0].sizes).toEqual(sizes);
    expect(merge([{ value: { en: ["One"] } }], [{ value: { en: ["One"] } }])).toHaveLength(1);
  });
});
