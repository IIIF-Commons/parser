import { normalize } from '../../src/presentation-3';

import manifestFixture from '../../fixtures/2-to-3-converted/manifests/iiif.io__api__presentation__2.1__example__fixtures__1__manifest.json';
import manifestWithStartFixture from '../../fixtures/presentation-3/start-canvas.json';

describe('normalize', () => {
  test('normalize simple manifest', () => {
    const db = normalize(manifestFixture);

    expect(db.mapping).toMatchInlineSnapshot(`
      {
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
      homepage: [{ id: 'http://myhomepage.com' }],
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

  test('normalize full example from specification', () => {
    const result = normalize({
      // Metadata about this manifest file
      '@context': 'http://iiif.io/api/presentation/3/context.json',
      id: 'https://example.org/iiif/book1/manifest',
      type: 'Manifest',

      // Descriptive metadata about the object/work
      label: { en: ['Book 1'] },
      metadata: [
        {
          label: { en: ['Author'] },
          value: { none: ['Anne Author'] },
        },
        {
          label: { en: ['Published'] },
          value: {
            en: ['Paris, circa 1400'],
            fr: ['Paris, environ 1400'],
          },
        },
        {
          label: { en: ['Notes'] },
          value: {
            en: ['Text of note 1', 'Text of note 2'],
          },
        },
        {
          label: { en: ['Source'] },
          value: { none: ['<span>From: <a href="https://example.org/db/1.html">Some Collection</a></span>'] },
        },
      ],
      summary: { en: ['Book 1, written by Anne Author, published in Paris around 1400.'] },

      thumbnail: [
        {
          id: 'https://example.org/iiif/book1/page1/full/80,100/0/default.jpg',
          type: 'Image',
          format: 'image/jpeg',
          service: [
            {
              id: 'https://example.org/iiif/book1/page1',
              type: 'ImageService3',
              profile: 'level1',
            },
          ],
        },
      ],

      // Presentation Information
      viewingDirection: 'right-to-left',
      behavior: ['paged'],
      navDate: '1856-01-01T00:00:00Z',

      // Rights Information
      rights: 'http://creativecommons.org/licenses/by/4.0/',
      requiredStatement: {
        label: { en: ['Attribution'] },
        value: { en: ['Provided by Example Organization'] },
      },
      provider: [
        {
          id: 'https://example.org/about',
          type: 'Agent',
          label: { en: ['Example Organization'] },
          homepage: [
            {
              id: 'https://example.org/',
              type: 'Text',
              label: { en: ['Example Organization Homepage'] },
              format: 'text/html',
            },
          ],
          logo: [
            {
              id: 'https://example.org/service/inst1/full/max/0/default.png',
              type: 'Image',
              format: 'image/png',
              service: [
                {
                  id: 'https://example.org/service/inst1',
                  type: 'ImageService3',
                  profile: 'level2',
                },
              ],
            },
          ],
          seeAlso: [
            {
              id: 'https://data.example.org/about/us.jsonld',
              type: 'Dataset',
              format: 'application/ld+json',
              profile: 'https://schema.org/',
            },
          ],
        },
      ],

      // Links
      homepage: [
        {
          id: 'https://example.org/info/book1/',
          type: 'Text',
          label: { en: ['Home page for Book 1'] },
          format: 'text/html',
        },
      ],
      service: [
        {
          id: 'https://example.org/service/example',
          type: 'ExampleExtensionService',
          profile: 'https://example.org/docs/example-service.html',
        },
      ],
      seeAlso: [
        {
          id: 'https://example.org/library/catalog/book1.xml',
          type: 'Dataset',
          format: 'text/xml',
          profile: 'https://example.org/profiles/bibliographic',
        },
      ],
      rendering: [
        {
          id: 'https://example.org/iiif/book1.pdf',
          type: 'Text',
          label: { en: ['Download as PDF'] },
          format: 'application/pdf',
        },
      ],
      partOf: [
        {
          id: 'https://example.org/collections/books/',
          type: 'Collection',
        },
      ],
      start: {
        id: 'https://example.org/iiif/book1/canvas/p2',
        type: 'Canvas',
      },

      // List of Services, referenced from within items, structures or annotations
      services: [
        {
          '@id': 'https://example.org/iiif/auth/login',
          '@type': 'AuthCookieService1',
          profile: 'http://iiif.io/api/auth/1/login',
          label: 'Login to Example Institution',
          service: [
            {
              '@id': 'https://example.org/iiif/auth/token',
              '@type': 'AuthTokenService1',
              profile: 'http://iiif.io/api/auth/1/token',
            },
          ],
        },
      ],

      // List of Canvases
      items: [
        {
          id: 'https://example.org/iiif/book1/canvas/p1',
          type: 'Canvas',
          label: { none: ['p. 1'] },
          // ...
        },
      ],

      // structure of the resource, described with Ranges
      structures: [
        {
          id: 'https://example.org/iiif/book1/range/top',
          type: 'Range',
          // Ranges members should be included here
        },
        // Any additional top level Ranges can be included here
      ],

      // Commentary Annotations on the Manifest
      annotations: [
        {
          id: 'https://example.org/iiif/book1/annotations/p1',
          type: 'AnnotationPage',
          items: [
            // Annotations about the Manifest are included here
          ],
        },
      ],
    });

    expect(result.entities).toMatchSnapshot();

    expect(result.mapping).toEqual({
      'https://data.example.org/about/us.jsonld': 'ContentResource',
      'https://example.org/': 'ContentResource',
      'https://example.org/collections/books/': 'ContentResource',
      'https://example.org/iiif/book1.pdf': 'ContentResource',
      'https://example.org/iiif/book1/annotations/p1': 'AnnotationPage',
      'https://example.org/iiif/book1/canvas/p1': 'Canvas',
      'https://example.org/iiif/book1/canvas/p2': 'Canvas',
      'https://example.org/iiif/book1/manifest': 'Manifest',
      'https://example.org/iiif/book1/page1/full/80,100/0/default.jpg': 'ContentResource',
      'https://example.org/iiif/book1/range/top': 'Range',
      'https://example.org/info/book1/': 'ContentResource',
      'https://example.org/library/catalog/book1.xml': 'ContentResource',
      'https://example.org/service/inst1/full/max/0/default.png': 'ContentResource',
      'https://example.org/about': 'Agent',
    });

    expect(result.resource).toEqual({
      id: 'https://example.org/iiif/book1/manifest',
      type: 'Manifest',
    });
  });

  test('normalize manifest with start property', () => {
    const db = normalize(manifestWithStartFixture);
    expect(
      (db.entities.Canvas as any)['https://iiif.io/api/cookbook/recipe/0202-start-canvas/canvas/p2']
    ).toMatchObject({
      id: 'https://iiif.io/api/cookbook/recipe/0202-start-canvas/canvas/p2',
      type: 'Canvas',
      label: {
        en: ['Frontispiece'],
      },
      width: 3186,
      height: 4612,
    });
  });
});
