import collection from "../../fixtures/presentation-2/paginated-collection.json";
import page from "../../fixtures/presentation-2/paginated-collection-page.json";
import { normalize, serialize, serializeConfigPresentation3, serializeConfigPresentation2 } from "../../src";

describe("paged Presentation 2 collections (#42)", () => {
  test.each([collection, page])("keeps navigation after normalization and serialization of $@id", (input) => {
    const result = normalize(structuredClone(input));
    const output = serialize<any>({ ...result, requests: {} }, result.resource, serializeConfigPresentation3);
    for (const key of ["first", "prev", "next"] as const) {
      if ((input as any)[key]) expect(output[key]).toEqual({ id: (input as any)[key], type: "Collection" });
    }
    if ("total" in input) expect(output.total).toBe(input.total);
    expect(output.items?.some((item: any) => item.id === output.next?.id)).not.toBe(true);
  });

  test("keeps zero totals and object pagination references", () => {
    const result = normalize({
      "@id": "https://example.org/collection",
      "@type": "sc:Collection",
      label: "Empty",
      total: 0,
      next: { "@id": "https://example.org/next", "@type": "sc:Collection" },
    });
    const output = serialize<any>({ ...result, requests: {} }, result.resource, serializeConfigPresentation3);
    expect(output.total).toBe(0);
    expect(output.next).toEqual({ id: "https://example.org/next", type: "Collection" });
  });
  test("keeps last, startIndex and embedded collection pagination in both serializers", () => {
    const input = {
      "@id": "https://example.org/parent",
      "@type": "sc:Collection",
      label: "Parent",
      last: "https://example.org/last",
      startIndex: 0,
      total: 0,
      collections: [
        {
          "@id": "https://example.org/child",
          "@type": "sc:Collection",
          label: "Child",
          first: "https://example.org/first",
          total: 0,
        },
      ],
    };
    const result = normalize(input);
    const store = { ...result, requests: {} };
    const p3 = serialize<any>(store, result.resource, serializeConfigPresentation3);
    expect(p3.last).toEqual({ id: input.last, type: "Collection" });
    expect(p3.startIndex).toBe(0);
    expect(p3.items[0]).toMatchObject({ first: { id: "https://example.org/first", type: "Collection" }, total: 0 });
    const p2 = serialize<any>(store, result.resource, serializeConfigPresentation2);
    expect(p2.last).toBe(input.last);
    expect(p2.startIndex).toBe(0);
    expect(p2.total).toBe(0);
  });
});
