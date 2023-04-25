import { describe, test, expect } from 'vitest';
import hasPartManifest from '../../fixtures/presentation-3/has-part.json';
import { normalize, serialize, mergeEntities, serializeConfigPresentation3 } from '../../src';

describe('Has part issues', function () {
  test('merging 2 entities', () => {
    const first = {
      id: 'https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg',
      type: 'Image',
      format: 'image/jpeg',
    };
    const second = {
      id: 'https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg',
      type: 'Image',
      format: 'image/jpeg',
      height: 3024,
      width: 4032,
      service: [
        {
          id: 'https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen',
          profile: 'level1',
          type: 'ImageService3',
        },
      ],
    };

    const initial = mergeEntities(
      {
        id: 'https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg',
        type: 'Image',
      },
      first,
      { parent: { id: 'https://example.org/canvas-2' } }
    );
    expect(initial).toMatchSnapshot();
    const merged = mergeEntities(initial as any, second, { parent: { id: 'https://example.org/canvas-1' } });

    expect(merged).toMatchSnapshot();
  });

  test('Merging 2 services', () => {
    const item1 = {
      service: [
        {
          '@id': 'https://iiif.wellcomecollection.org/image/b1465782x_0001.jp2',
          '@type': 'ImageService2',
          profile: 'http://iiif.io/api/image/2/level1.json',
          width: 6036,
          height: 7161,
          id: 'https://iiif.wellcomecollection.org/image/b1465782x_0001.jp2',
        },
      ],
    };

    const item2 = {
      service: [
        {
          '@id': 'https://iiif.wellcomecollection.org/image/b1465782x_0001.jp2',
          '@type': 'ImageService2',
          profile: 'http://iiif.io/api/image/2/level1.json',
          width: 6036,
          height: 7161,
        },
      ],
    };

    const merged = mergeEntities(item1 as any, item2, { parent: { id: 'https://example.org/canvas-1' } });

    expect(merged).toMatchSnapshot();

  });

  test('Merging the same 2 entities', () => {
    const first = {
      id: 'https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg',
      type: 'Image',
      format: 'image/jpeg',
    };
    const second = {
      id: 'https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg',
      type: 'Image',
      format: 'image/jpeg',
    };

    const initial = mergeEntities(
      {
        id: 'https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg',
        type: 'Image',
      },
      first,
      { parent: { id: 'https://example.org/canvas-2' } }
    );
    expect(initial).toMatchSnapshot();
    const merged = mergeEntities(initial as any, second, { parent: { id: 'https://example.org/canvas-1' } });

    expect(merged).toMatchSnapshot();
  });

  test('Merging the same 2 entities and then different one', () => {
    const first = {
      id: 'https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg',
      type: 'Image',
      format: 'image/jpeg',
    };
    const second = {
      id: 'https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg',
      type: 'Image',
      format: 'image/jpeg',
    };
    const third = {
      id: 'https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg',
      type: 'Image',
      format: 'image/jpeg',
      height: 3024,
      width: 4032,
      service: [
        {
          id: 'https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen',
          profile: 'level1',
          type: 'ImageService3',
        },
      ],
    };

    const initial = mergeEntities(
      {
        id: 'https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg',
        type: 'Image',
      },
      first,
      { parent: { id: 'https://example.org/canvas-2' } }
    );
    expect(initial).toMatchSnapshot();
    const merged = mergeEntities(initial as any, second, { parent: { id: 'https://example.org/canvas-1' } });
    const merged2 = mergeEntities(merged as any, third, { parent: { id: 'https://example.org/canvas-3' } });

    expect(merged2).toMatchSnapshot();
  });

  test('Example manifest with thumbnail ID the same as the main resource', () => {
    const original = JSON.parse(JSON.stringify(hasPartManifest));
    const result = normalize(hasPartManifest);
    expect(result).toMatchSnapshot();

    const reserialized = serialize(
      {
        mapping: result.mapping,
        entities: result.entities,
        requests: {},
      },
      result.resource,
      serializeConfigPresentation3
    );
    expect(
      serialize(
        {
          mapping: result.mapping,
          entities: result.entities,
          requests: {},
        },
        result.resource,
        serializeConfigPresentation3
      )
    ).toMatchSnapshot();

    expect(reserialized).toEqual(original);
  });

  describe('Collection and manifest labels', () => {
    const manifestFromCollection = {
      id: 'https://iiif.wellcomecollection.org/presentation/b18031511_0001',
      type: 'Manifest',
      label: {
        en: ['Volume 1', 'The biological basis of medicine / edited by E. Edward Bittar ; assisted by Neville Bittar.'],
      },
    };
    const manifestOnItsOwn = {
      id: 'https://iiif.wellcomecollection.org/presentation/b18031511_0001',
      type: 'Manifest',
      label: {
        en: ['The biological basis of medicine / edited by E. Edward Bittar ; assisted by Neville Bittar.'],
      },
    };

    test('Collection, then manifest.', () => {
      const initial = mergeEntities(
        {
          id: 'https://iiif.wellcomecollection.org/presentation/b18031511_0001',
          type: 'Manifest',
        } as any,
        manifestFromCollection,
        { parent: { id: 'https://example.org/collection-1' } }
      );
      expect(initial).toMatchSnapshot();

      const merged = mergeEntities(initial as any, manifestOnItsOwn, { parent: undefined, isTopLevel: true });
      expect(merged).toMatchSnapshot();
    });

    test('Manifest then Collection', () => {
      // Then test Manifest, then collection
      const initial = mergeEntities(
        {
          id: 'https://iiif.wellcomecollection.org/presentation/b18031511_0001',
          type: 'Manifest',
        } as any,
        manifestOnItsOwn,
        { parent: undefined, isTopLevel: true }
      );
      expect(initial).toMatchSnapshot();

      const merged = mergeEntities(initial as any, manifestFromCollection, {
        parent: { id: 'https://example.org/collection-1' },
      });
      expect(merged).toMatchSnapshot();
    });
  });
});
