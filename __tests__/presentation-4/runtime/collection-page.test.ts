import { describe, expect, test } from "vitest";
import { normalize, serialize, serializeConfigPresentation4 } from "../../../src/presentation-4";

const page = {
  "@context": "http://iiif.io/api/presentation/4/context.json",
  id: "https://example.org/collection/page/2",
  type: "CollectionPage",
  partOf: [
    {
      id: "https://example.org/collection",
      type: "Collection",
    },
  ],
  items: [
    {
      id: "https://example.org/manifest/2",
      type: "Manifest",
      label: { en: ["Manifest two"] },
    },
  ],
  prev: "https://example.org/collection/page/1",
  next: {
    id: "https://example.org/collection/page/3",
    type: "CollectionPage",
  },
  startIndex: 10,
};
const pageItem = page.items[0]!;
const parentCollection = page.partOf[0]!;

describe("Presentation 4 CollectionPage runtime", () => {
  test("normalizes a page as a first-class entity without fetching adjacent pages", () => {
    const normalized = normalize(page);
    const entity = normalized.entities.CollectionPage[page.id] as any;

    expect(normalized.resource).toEqual({ id: page.id, type: "CollectionPage" });
    expect(normalized.mapping[page.id]).toBe("CollectionPage");
    expect(entity.items).toEqual([{ id: pageItem.id, type: "Manifest" }]);
    expect(entity.prev).toEqual({
      id: "https://example.org/collection/page/1",
      type: "CollectionPage",
    });
    expect(entity.next).toEqual(page.next);
    expect(normalized.entities.CollectionPage[page.prev]).toBeUndefined();
    expect(normalized.entities.CollectionPage[page.next.id]).toBeUndefined();
  });

  test("serializes page identity, membership, and paging links", () => {
    const normalized = normalize(page);
    const serialized = serialize<any>(
      {
        entities: normalized.entities,
        mapping: normalized.mapping,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation4
    );

    expect(serialized["@context"]).toBe("http://iiif.io/api/presentation/4/context.json");
    expect(serialized.type).toBe("CollectionPage");
    expect(serialized.partOf).toEqual([
      {
        id: parentCollection.id,
        type: "Collection",
      },
    ]);
    expect(serialized.items[0]).toMatchObject({
      id: pageItem.id,
      type: "Manifest",
      label: pageItem.label,
    });
    expect(serialized.prev).toEqual({
      id: "https://example.org/collection/page/1",
      type: "CollectionPage",
    });
    expect(serialized.next).toEqual(page.next);
    expect(serialized.startIndex).toBe(10);
  });
});
