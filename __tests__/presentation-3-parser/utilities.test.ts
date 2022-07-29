import { compressSpecificResource } from '../../src/shared/compress-specific-resource';
import { SpecificResource } from '@iiif/presentation-3';

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
});
