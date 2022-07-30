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
});
