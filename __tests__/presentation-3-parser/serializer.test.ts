import { normalize, serialize, serializeConfigPresentation2, serializeConfigPresentation3 } from '../../src';
import { Collection } from '@iiif/presentation-3';

describe('serializer', () => {
  test('parse, then serialize', () => {
    const input = () =>
      ({
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
            height: 100,
            width: 100,
            items: [],
            // ...
          },
        ],

        // structure of the resource, described with Ranges
        structures: [
          {
            id: 'https://example.org/iiif/book1/range/top',
            type: 'Range',
            items: [
              // Ranges members should be included here
            ],
          },
          // Any additional top level Ranges can be included here
        ],

        // Commentary Annotations on the Manifest
        annotations: [
          {
            id: 'https://example.org/iiif/book1/annotations/p1',
            type: 'AnnotationPage',
            // items: [
            //   // Annotations about the Manifest are included here
            // ],
          },
        ],
      } as const);
    const result = normalize(input());

    expect(result.resource).toBeDefined();

    const serialized = serialize(
      {
        mapping: result.mapping,
        entities: result.entities,
        requests: {},
      },
      result.resource,
      serializeConfigPresentation3
    );

    expect(serialized).toEqual(input());

    expect(serialized).toMatchInlineSnapshot(`
      {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "annotations": [
          {
            "id": "https://example.org/iiif/book1/annotations/p1",
            "type": "AnnotationPage",
          },
        ],
        "behavior": [
          "paged",
        ],
        "homepage": [
          {
            "format": "text/html",
            "id": "https://example.org/info/book1/",
            "label": {
              "en": [
                "Home page for Book 1",
              ],
            },
            "type": "Text",
          },
        ],
        "id": "https://example.org/iiif/book1/manifest",
        "items": [
          {
            "height": 100,
            "id": "https://example.org/iiif/book1/canvas/p1",
            "items": [],
            "label": {
              "none": [
                "p. 1",
              ],
            },
            "type": "Canvas",
            "width": 100,
          },
        ],
        "label": {
          "en": [
            "Book 1",
          ],
        },
        "metadata": [
          {
            "label": {
              "en": [
                "Author",
              ],
            },
            "value": {
              "none": [
                "Anne Author",
              ],
            },
          },
          {
            "label": {
              "en": [
                "Published",
              ],
            },
            "value": {
              "en": [
                "Paris, circa 1400",
              ],
              "fr": [
                "Paris, environ 1400",
              ],
            },
          },
          {
            "label": {
              "en": [
                "Notes",
              ],
            },
            "value": {
              "en": [
                "Text of note 1",
                "Text of note 2",
              ],
            },
          },
          {
            "label": {
              "en": [
                "Source",
              ],
            },
            "value": {
              "none": [
                "<span>From: <a href="https://example.org/db/1.html">Some Collection</a></span>",
              ],
            },
          },
        ],
        "navDate": "1856-01-01T00:00:00Z",
        "partOf": [
          {
            "id": "https://example.org/collections/books/",
            "type": "Collection",
          },
        ],
        "provider": [
          {
            "homepage": [
              {
                "format": "text/html",
                "id": "https://example.org/",
                "label": {
                  "en": [
                    "Example Organization Homepage",
                  ],
                },
                "type": "Text",
              },
            ],
            "id": "https://example.org/about",
            "label": {
              "en": [
                "Example Organization",
              ],
            },
            "logo": [
              {
                "format": "image/png",
                "id": "https://example.org/service/inst1/full/max/0/default.png",
                "service": [
                  {
                    "id": "https://example.org/service/inst1",
                    "profile": "level2",
                    "type": "ImageService3",
                  },
                ],
                "type": "Image",
              },
            ],
            "seeAlso": [
              {
                "format": "application/ld+json",
                "id": "https://data.example.org/about/us.jsonld",
                "profile": "https://schema.org/",
                "type": "Dataset",
              },
            ],
            "type": "Agent",
          },
        ],
        "rendering": [
          {
            "format": "application/pdf",
            "id": "https://example.org/iiif/book1.pdf",
            "label": {
              "en": [
                "Download as PDF",
              ],
            },
            "type": "Text",
          },
        ],
        "requiredStatement": {
          "label": {
            "en": [
              "Attribution",
            ],
          },
          "value": {
            "en": [
              "Provided by Example Organization",
            ],
          },
        },
        "rights": "http://creativecommons.org/licenses/by/4.0/",
        "seeAlso": [
          {
            "format": "text/xml",
            "id": "https://example.org/library/catalog/book1.xml",
            "profile": "https://example.org/profiles/bibliographic",
            "type": "Dataset",
          },
        ],
        "service": [
          {
            "id": "https://example.org/service/example",
            "profile": "https://example.org/docs/example-service.html",
            "type": "ExampleExtensionService",
          },
        ],
        "services": [
          {
            "@id": "https://example.org/iiif/auth/login",
            "@type": "AuthCookieService1",
            "label": "Login to Example Institution",
            "profile": "http://iiif.io/api/auth/1/login",
            "service": [
              {
                "@id": "https://example.org/iiif/auth/token",
                "@type": "AuthTokenService1",
                "profile": "http://iiif.io/api/auth/1/token",
              },
            ],
          },
        ],
        "start": {
          "id": "https://example.org/iiif/book1/canvas/p2",
          "type": "Canvas",
        },
        "structures": [
          {
            "id": "https://example.org/iiif/book1/range/top",
            "items": [],
            "type": "Range",
          },
        ],
        "summary": {
          "en": [
            "Book 1, written by Anne Author, published in Paris around 1400.",
          ],
        },
        "thumbnail": [
          {
            "format": "image/jpeg",
            "id": "https://example.org/iiif/book1/page1/full/80,100/0/default.jpg",
            "service": [
              {
                "id": "https://example.org/iiif/book1/page1",
                "profile": "level1",
                "type": "ImageService3",
              },
            ],
            "type": "Image",
          },
        ],
        "type": "Manifest",
        "viewingDirection": "right-to-left",
      }
    `);

    const serialized2 = serialize(
      {
        mapping: result.mapping,
        entities: result.entities,
        requests: {},
      },
      result.resource,
      serializeConfigPresentation2
    );

    expect(serialized2).toMatchInlineSnapshot(`
      {
        "@context": "http://iiif.io/api/presentation/2/context.json",
        "@id": "https://example.org/iiif/book1/manifest",
        "@type": "sc:Manifest",
        "attribution": "Provided by Example Organization",
        "description": "Book 1, written by Anne Author, published in Paris around 1400.",
        "label": "Book 1",
        "metadata": [
          {
            "label": "Author",
            "value": "Anne Author",
          },
          {
            "label": "Published",
            "value": [
              {
                "@language": "en",
                "@value": "Paris, circa 1400",
              },
              {
                "@language": "fr",
                "@value": "Paris, environ 1400",
              },
            ],
          },
          {
            "label": "Notes",
            "value": "Text of note 1Text of note 2",
          },
          {
            "label": "Source",
            "value": "<span>From: <a href="https://example.org/db/1.html">Some Collection</a></span>",
          },
        ],
        "navDate": "1856-01-01T00:00:00Z",
        "rendering": {
          "@id": "https://example.org/iiif/book1.pdf",
          "format": "application/pdf",
          "label": "Download as PDF",
        },
        "seeAlso": {
          "@id": "https://example.org/library/catalog/book1.xml",
          "format": "text/xml",
        },
        "sequences": [
          {
            "@id": "https://example.org/iiif/book1/manifest/sequence0",
            "@type": "sc:Sequence",
            "canvases": [
              {
                "@id": "https://example.org/iiif/book1/canvas/p1",
                "@type": "sc:Canvas",
                "height": 100,
                "label": "p. 1",
                "width": 100,
              },
            ],
          },
        ],
        "service": {
          "@context": "http://iiif.io/api/image/2/context.json",
          "@id": "https://example.org/service/example",
          "profile": "http://iiif.io/api/image/2/profiles/https://example.org/docs/example-service.html.json",
        },
        "startCanvas": "https://example.org/iiif/book1/canvas/p2",
        "structures": [
          {
            "@id": "https://example.org/iiif/book1/range/top",
            "@type": "sc:Range",
            "canvases": [],
          },
        ],
        "thumbnail": {
          "@id": "https://example.org/iiif/book1/page1/full/80,100/0/default.jpg",
          "@type": "dctypes:Image",
          "format": "image/jpeg",
          "service": {
            "@context": "http://iiif.io/api/image/2/context.json",
            "@id": "https://example.org/iiif/book1/page1",
            "profile": "http://iiif.io/api/image/2/profiles/level1.json",
          },
        },
        "viewingDirection": "right-to-left",
      }
    `);
  });

  test('parse, serialize with choice body', () => {
    const input = () => ({
      '@context': 'http://iiif.io/api/presentation/3/context.json',
      id: 'https://preview.iiif.io/cookbook/3333-choice/recipe/0033-choice/manifest.json',
      type: 'Manifest',
      label: {
        en: ['John Dee performing an experiment before Queen Elizabeth I.'],
      },
      items: [
        {
          id: 'https://preview.iiif.io/cookbook/3333-choice/recipe/0033-choice/canvas/p1',
          type: 'Canvas',
          height: 1271,
          width: 2000,
          items: [
            {
              id: 'https://preview.iiif.io/cookbook/3333-choice/recipe/0033-choice/page/p1/1',
              type: 'AnnotationPage',
              items: [
                {
                  id: 'https://preview.iiif.io/cookbook/3333-choice/recipe/0033-choice/annotation/p0001-image',
                  type: 'Annotation',
                  motivation: 'painting',
                  body: {
                    type: 'Choice',
                    items: [
                      {
                        id: 'https://iiif.io/api/image/3.0/example/reference/421e65be2ce95439b3ad6ef1f2ab87a9-dee-natural/full/max/0/default.jpg',
                        type: 'Image',
                        format: 'image/jpeg',
                        width: 2000,
                        height: 1271,
                        label: {
                          en: ['Natural Light'],
                        },
                        service: [
                          {
                            id: 'https://iiif.io/api/image/3.0/example/reference/421e65be2ce95439b3ad6ef1f2ab87a9-dee-natural',
                            type: 'ImageService3',
                            profile: 'level1',
                          },
                        ],
                      },
                      {
                        id: 'https://iiif.io/api/image/3.0/example/reference/421e65be2ce95439b3ad6ef1f2ab87a9-dee-xray/full/max/0/default.jpg',
                        type: 'Image',
                        format: 'image/jpeg',
                        width: 2000,
                        height: 1271,
                        label: {
                          en: ['X-Ray'],
                        },
                        service: [
                          {
                            id: 'https://iiif.io/api/image/3.0/example/reference/421e65be2ce95439b3ad6ef1f2ab87a9-dee-xray',
                            type: 'ImageService3',
                            profile: 'level1',
                          },
                        ],
                      },
                    ],
                  },
                  target: 'https://preview.iiif.io/cookbook/3333-choice/recipe/0033-choice/canvas/p1',
                },
              ],
            },
          ],
        },
      ],
    });

    const result = normalize(input());

    expect(result.resource).toBeDefined();

    const serialized = serialize(
      {
        mapping: result.mapping,
        entities: result.entities,
        requests: {},
      },
      result.resource,
      serializeConfigPresentation3
    );

    expect(serialized).toEqual(input());
  });

  test('serialize collection', () => {
    const input = () => ({
      '@context': 'http://iiif.io/api/presentation/3/context.json',
      id: 'https://example.org/collection-1',
      type: 'Collection',
      items: [
        {
          id: 'https://example.org/manifest-1',
          type: 'Manifest',
          label: { en: ['Manifest 1'] },
        },
        {
          id: 'https://example.org/manifest-2',
          type: 'Manifest',
        },
        {
          id: 'https://example.org/manifest-3',
          type: 'Manifest',
          label: { en: ['Manifest 3'] },
          thumbnail: [
            {
              id: 'https://example.org/manifest-3/thumb.jpg',
              type: 'Image',
              format: 'image/jpg',
            },
          ],
        },
      ],
    });

    const result = normalize(input());

    expect(result.resource).toBeDefined();

    const serialized = serialize<Collection>(
      {
        mapping: result.mapping,
        entities: result.entities,
        requests: {},
      },
      result.resource,
      serializeConfigPresentation3
    );

    expect(serialized).toEqual(input());

    expect(serialized.items).toHaveLength(3);
  });
});
