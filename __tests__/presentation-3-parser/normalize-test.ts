import { normalize } from '../../src/presentation-3';

import manifestFixture from '../../fixtures/2-to-3-converted/manifests/iiif.io__api__presentation__2.1__example__fixtures__1__manifest.json';

describe('normalize', () => {
  test('normalize simple manifest', () => {
    const db = normalize(manifestFixture);

    expect(db.mapping).toMatchInlineSnapshot(`
      Object {
        "http://iiif.io/api/presentation/2.1/example/fixtures/1/manifest.json": "Manifest",
        "http://iiif.io/api/presentation/2.1/example/fixtures/canvas/1/c1.json": "Canvas",
        "http://iiif.io/api/presentation/2.1/example/fixtures/collection.json": "ContentResource",
        "http://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png": "ContentResource",
        "https://example.org/uuid/1dad04b3-79c6-4a97-a831-634f2ee50a26": "AnnotationPage",
        "https://example.org/uuid/3644c005-bf7a-48d0-9fa9-1e1757bf8df1": "Annotation",
      }
    `);
  });

  test('normalize', () => {
    const manifest = () => ({
      '@context': ['http://www.w3.org/ns/anno.jsonld', 'http://iiif.io/api/presentation/{{ page.major }}/context.json'],
      id: 'https://example.org/iiif/book1/manifest',
      type: 'Manifest',
      label: { en: ['Image 1'] },
      homepage: { id: 'http://myhomepage.com' },
      items: [
        {
          id: 'https://example.org/iiif/book1/canvas/p1',
          type: 'Canvas',
          height: 1800,
          width: 1200,
          items: [
            {
              id: 'https://example.org/iiif/book1/page/p1/1',
              type: 'AnnotationPage',
              items: [
                {
                  id: 'https://example.org/iiif/book1/annotation/p0001-image',
                  type: 'Annotation',
                  motivation: 'painting',
                  body: {
                    id: 'http://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png',
                    type: 'Image',
                    format: 'image/png',
                    height: 1800,
                    width: 1200,
                  },
                  target: 'https://example.org/iiif/book1/canvas/p1',
                },
              ],
            },
          ],
        },
      ],
    });

    const result = normalize(manifest());

    expect(result.entities).toMatchSnapshot();

    expect(result.mapping).toEqual({
      'http://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png': 'ContentResource',
      'http://myhomepage.com': 'ContentResource',
      'https://example.org/iiif/book1/annotation/p0001-image': 'Annotation',
      'https://example.org/iiif/book1/canvas/p1': 'Canvas',
      'https://example.org/iiif/book1/manifest': 'Manifest',
      'https://example.org/iiif/book1/page/p1/1': 'AnnotationPage',
    });

    expect(result.resource).toEqual({
      id: 'https://example.org/iiif/book1/manifest',
      type: 'Manifest',
    });
  });
});
