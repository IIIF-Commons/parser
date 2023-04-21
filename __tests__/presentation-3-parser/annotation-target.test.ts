import { describe } from 'vitest';
import exhibition1 from '../../fixtures/presentation-3/exhibition-1.json';
import { normalize, serialize, serializeConfigPresentation3 } from "../../src";

describe('Annotation target tests', () => {
  test('Annotation with target type annotation', () => {
    const result = normalize(exhibition1);

    const anno = (result.entities.Annotation as any)[
      'https://heritage.tudelft.nl/iiif/inventing-creativity/canvas/66dc7c31-e263-79bc-08a7-43a5f6e6ad59/annotations/35'
      ];

    const reserialized = serialize(
      {
        mapping: result.mapping,
        entities: result.entities,
        requests: {},
      },
      anno,
      serializeConfigPresentation3
    );


    expect(
      (result.entities.Annotation as any)[
        'https://heritage.tudelft.nl/iiif/inventing-creativity/canvas/66dc7c31-e263-79bc-08a7-43a5f6e6ad59/annotations/35'
      ]
    ).toMatchInlineSnapshot(`
      {
        "id": "https://heritage.tudelft.nl/iiif/inventing-creativity/canvas/66dc7c31-e263-79bc-08a7-43a5f6e6ad59/annotations/35",
        "iiif-parser:hasPart": [
          {
            "id": "https://heritage.tudelft.nl/iiif/inventing-creativity/canvas/66dc7c31-e263-79bc-08a7-43a5f6e6ad59/annotations/35",
            "iiif-parser:partOf": "https://heritage.tudelft.nl/iiif/inventing-creativity/canvas/66dc7c31-e263-79bc-08a7-43a5f6e6ad59/annotations",
            "type": "Annotation",
          },
        ],
        "motivation": [
          "describing",
        ],
        "target": {
          "source": {
            "id": "https://heritage.tudelft.nl/iiif/inventing-creativity/annotation/92fab8fb-2fff-9abe-f901-f07122318a1c",
            "type": "Annotation",
          },
          "type": "SpecificResource",
        },
        "type": "Annotation",
      }
    `);

    expect(reserialized).toMatchInlineSnapshot(`
      {
        "id": "https://heritage.tudelft.nl/iiif/inventing-creativity/canvas/66dc7c31-e263-79bc-08a7-43a5f6e6ad59/annotations/35",
        "motivation": "describing",
        "target": {
          "id": "https://heritage.tudelft.nl/iiif/inventing-creativity/annotation/92fab8fb-2fff-9abe-f901-f07122318a1c",
          "type": "Annotation",
        },
        "type": "Annotation",
      }
    `);
    //
  });
});
