import { compressSpecificResource } from '../../src/shared/compress-specific-resource';
import { SpecificResource } from '@iiif/presentation-3';
import { frameResource, WILDCARD } from '../../src';

describe('Misc Utilites', function () {
  test('compressSpecificResource', () => {
    const state: SpecificResource = {
      id: 'https://iiif.io/api/cookbook/recipe/0015-start/canvas-start/segment1',
      type: 'SpecificResource',
      source: {
        id: 'https://iiif.io/api/cookbook/recipe/0015-start/canvas/segment1',
        type: 'Canvas',
      },
      selector: { type: 'PointSelector', t: 120.5 },
    };

    expect(compressSpecificResource(state, { allowSourceString: false })).toMatchInlineSnapshot(`
      {
        "id": "https://iiif.io/api/cookbook/recipe/0015-start/canvas-start/segment1",
        "selector": {
          "t": 120.5,
          "type": "PointSelector",
        },
        "source": {
          "id": "https://iiif.io/api/cookbook/recipe/0015-start/canvas/segment1",
          "type": "Canvas",
        },
        "type": "SpecificResource",
      }
    `);
  });
  test('compressSpecificResource (allowString=true)', () => {
    const state: SpecificResource = {
      id: 'https://iiif.io/api/cookbook/recipe/0015-start/canvas-start/segment1',
      type: 'SpecificResource',
      source: {
        id: 'https://iiif.io/api/cookbook/recipe/0015-start/canvas/segment1',
        type: 'Canvas',
      },
      selector: { type: 'PointSelector', t: 120.5 },
    };

    expect(compressSpecificResource(state, { allowSourceString: true })).toMatchInlineSnapshot(`
      {
        "id": "https://iiif.io/api/cookbook/recipe/0015-start/canvas-start/segment1",
        "selector": {
          "t": 120.5,
          "type": "PointSelector",
        },
        "source": "https://iiif.io/api/cookbook/recipe/0015-start/canvas/segment1",
        "type": "SpecificResource",
      }
    `);
  });

  test('compressSpecificResource (single content resource)', () => {
    const state: SpecificResource = {
      type: 'SpecificResource',
      source: {
        id: 'https://exameple.org/link-to-something',
        type: 'ContentResource',
      },
    };

    const compressed = compressSpecificResource(state, { allowSourceString: true, allowString: false });

    expect(compressed).toMatchInlineSnapshot(`
      {
        "source": "https://exameple.org/link-to-something",
        "type": "SpecificResource",
      }
    `);
  });

  test('frameResource', () => {
    const resource = {
      id: 'test',
      type: 'test-type',
      nested: { id: 'something', type: 'something-else' },
      ignored: 'not included',
    };

    expect(frameResource(resource, {})).toEqual(resource);
    expect(
      frameResource(resource, {
        '@explicit': true,
        id: {},
        type: {},
      })
    ).toEqual({
      id: 'test',
      type: 'test-type',
    });
    expect(
      frameResource(resource, {
        '@explicit': true,
        id: {},
        type: {},
        override: 'concrete value',
      })
    ).toEqual({
      id: 'test',
      type: 'test-type',
      override: 'concrete value',
    });
    expect(
      frameResource(resource, {
        '@explicit': true,
        id: {},
        type: {},
        nested: {},
      })
    ).toEqual({
      id: 'test',
      type: 'test-type',
      nested: { id: 'something', type: 'something-else' },
    });
  });
});
