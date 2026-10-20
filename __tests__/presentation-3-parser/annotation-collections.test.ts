import { normalize, serialize, serializeConfigPresentation3 } from "../../src";

function roundTrip(input: any): any {
  const result = normalize(structuredClone(input));
  return serialize({ ...result, requests: {} }, result.resource, serializeConfigPresentation3);
}

describe("AnnotationCollection coverage (#29)", () => {
  test("preserves descriptive/linking fields, counts, and first/last pages", () => {
    const input = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://example.org/comments",
      type: "AnnotationCollection",
      label: { en: ["Comments"] },
      summary: { en: ["Transcriptions"] },
      total: 2,
      homepage: [{ id: "https://example.org/comments.html", type: "Text", format: "text/html" }],
      first: { id: "https://example.org/comments/page1", type: "AnnotationPage", items: [] },
      last: "https://example.org/comments/page2",
    };
    expect(roundTrip(input)).toEqual(input);
  });

  test("serializes a first page with a reference back to its collection", () => {
    const id = "https://example.org/comments";
    const input = {
      id,
      type: "AnnotationCollection",
      total: 0,
      first: { id: `${id}/page`, type: "AnnotationPage", partOf: [{ id, type: "AnnotationCollection" }], items: [] },
    };
    expect(roundTrip(input)).toEqual(input);
  });
  test("keeps linked collections inline in the existing page store model", () => {
    const collection = {
      id: "https://example.org/comments",
      type: "AnnotationCollection",
      label: { en: ["Comments"] },
      total: 0,
    };
    const input = { id: "https://example.org/page", type: "AnnotationPage", items: [], partOf: [collection] };
    const result = normalize(structuredClone(input));
    expect((result.entities.AnnotationPage as any)[input.id].partOf).toEqual([collection]);
    expect(roundTrip(input).partOf).toEqual([collection]);
  });
});
