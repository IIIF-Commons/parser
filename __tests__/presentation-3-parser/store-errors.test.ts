import { serialize, serializeConfigPresentation3 } from '../../src';

describe('store errors', () => {
  test('Wellcome store error', async () => {
    const store = await import('../../fixtures/stores/wellcome-error.json');

    const serialized = serialize(
      {
        mapping: store.iiif.mapping,
        entities: store.iiif.entities,
        requests: {},
      },
      {
        id: 'https://iiif.wellcomecollection.org/presentation/b12024673',
        type: 'Manifest',
      },
      serializeConfigPresentation3
    );

    expect(serialized).toMatchInlineSnapshot(`
      {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "homepage": [
          {
            "format": "text/html",
            "id": "https://wellcomecollection.org/works/kqy8b2yh",
            "label": {
              "en": [
                "Saint Pancras smallpox hospital, London. Oil painting after G.S. Shepherd, 1806.",
              ],
            },
            "language": [
              "en",
            ],
            "type": "Text",
          },
        ],
        "id": "https://iiif.wellcomecollection.org/presentation/b12024673",
        "items": [
          {
            "height": 2522,
            "id": "https://iiif.wellcomecollection.org/presentation/b12024673/canvases/b12024673_0001.jp2",
            "items": [
              {
                "id": "https://iiif.wellcomecollection.org/presentation/b12024673/canvases/b12024673_0001.jp2/painting",
                "items": [
                  {
                    "body": {
                      "format": "image/jpeg",
                      "height": 912,
                      "id": "https://iiif.wellcomecollection.org/image/b12024673_0001.jp2/full/1024,912/0/default.jpg",
                      "service": [
                        {
                          "@id": "https://iiif.wellcomecollection.org/image/b12024673_0001.jp2",
                          "@type": "ImageService2",
                          "height": 2522,
                          "profile": "http://iiif.io/api/image/2/level1.json",
                          "width": 2833,
                        },
                      ],
                      "type": "Image",
                      "width": 1024,
                    },
                    "id": "https://iiif.wellcomecollection.org/presentation/b12024673/canvases/b12024673_0001.jp2/painting/anno",
                    "motivation": "painting",
                    "target": "https://iiif.wellcomecollection.org/presentation/b12024673/canvases/b12024673_0001.jp2",
                    "type": "Annotation",
                  },
                ],
                "type": "AnnotationPage",
              },
            ],
            "label": {
              "none": [
                "-",
              ],
            },
            "thumbnail": [
              {
                "height": 89,
                "id": "https://iiif.wellcomecollection.org/thumbs/b12024673_0001.jp2/full/100,89/0/default.jpg",
                "service": [
                  {
                    "@id": "https://iiif.wellcomecollection.org/thumbs/b12024673_0001.jp2",
                    "@type": "ImageService2",
                    "height": 912,
                    "profile": "http://iiif.io/api/image/2/level0.json",
                    "sizes": [
                      {
                        "height": 89,
                        "width": 100,
                      },
                      {
                        "height": 178,
                        "width": 200,
                      },
                      {
                        "height": 356,
                        "width": 400,
                      },
                      {
                        "height": 912,
                        "width": 1024,
                      },
                    ],
                    "width": 1024,
                  },
                ],
                "type": "Image",
                "width": 100,
              },
            ],
            "type": "Canvas",
            "width": 2833,
          },
        ],
        "label": {
          "en": [
            "Saint Pancras smallpox hospital, London. Oil painting after G.S. Shepherd, 1806.",
          ],
        },
        "metadata": [
          {
            "label": {
              "en": [
                "Reference",
              ],
            },
            "value": {
              "none": [
                "44655i",
              ],
            },
          },
          {
            "label": {
              "en": [
                "Physical description",
              ],
            },
            "value": {
              "en": [
                "1 painting : oil on wood ; wood 35 x 40 cm",
              ],
            },
          },
          {
            "label": {
              "en": [
                "Contributors",
              ],
            },
            "value": {
              "none": [
                "Shepherd, George Sidney, 1784-1862.",
              ],
            },
          },
          {
            "label": {
              "en": [
                "Creator/production credits",
              ],
            },
            "value": {
              "en": [
                "After an engraving by Woolnoth after a design by G.S. Shepherd",
              ],
            },
          },
          {
            "label": {
              "en": [
                "Type/technique",
              ],
            },
            "value": {
              "en": [
                "Oil paintings",
                "Paintings",
              ],
            },
          },
          {
            "label": {
              "en": [
                "Subjects",
              ],
            },
            "value": {
              "en": [
                "King's Cross (London, England)",
                "Hospitals for the Small-pox and Inoculation (London, England)",
              ],
            },
          },
          {
            "label": {
              "en": [
                "Reference",
              ],
            },
            "value": {
              "en": [
                "Wellcome Collection 44655i",
              ],
            },
          },
          {
            "label": {
              "en": [
                "Attribution and usage",
              ],
            },
            "value": {
              "en": [
                "Wellcome Collection",
                "<span>This work has been identified as being free of known restrictions under copyright law, including all related and neighbouring rights and is being made available under the <a target=\\"_top\\" href=\\"http://creativecommons.org/publicdomain/mark/1.0/\\">Creative Commons, Public Domain Mark</a>.<br/><br/>You can copy, modify, distribute and perform the work, even for commercial purposes, without asking permission.</span>",
              ],
            },
          },
        ],
        "partOf": [
          {
            "id": "https://iiif.wellcomecollection.org/presentation/collections/contributors/ze6kf2ag",
            "label": {
              "en": [
                "Contributor: Shepherd, George Sidney, 1784-1862.",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://iiif.wellcomecollection.org/presentation/collections/subjects/fxk455dn",
            "label": {
              "en": [
                "Subject: King's Cross (London, England)",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://iiif.wellcomecollection.org/presentation/collections/subjects/gjsmun8u",
            "label": {
              "en": [
                "Subject: Hospitals for the Small-pox and Inoculation (London, England)",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://iiif.wellcomecollection.org/presentation/collections/genres/Oil_paintings",
            "label": {
              "en": [
                "Genre: Oil paintings",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://iiif.wellcomecollection.org/presentation/collections/genres/Paintings",
            "label": {
              "en": [
                "Genre: Paintings",
              ],
            },
            "type": "Collection",
          },
        ],
        "provider": [
          {
            "homepage": [
              {
                "format": "text/html",
                "id": "https://wellcomecollection.org",
                "label": {
                  "en": [
                    "Wellcome Collection",
                  ],
                },
                "type": "Text",
              },
            ],
            "id": "https://wellcomecollection.org",
            "label": {
              "en": [
                "Wellcome Collection",
                "183 Euston Road",
                "London NW1 2BE UK",
                "T +44 (0)20 7611 8722",
                "E library@wellcomecollection.org",
                "https://wellcomecollection.org",
              ],
            },
            "logo": [
              {
                "format": "image/png",
                "id": "https://iiif.wellcomecollection.org/logos/wellcome-collection-black.png",
                "type": "Image",
              },
            ],
            "type": "Agent",
          },
        ],
        "rendering": [
          {
            "format": "application/pdf",
            "id": "https://iiif.wellcomecollection.org/pdf/b12024673",
            "label": {
              "en": [
                "View as PDF",
              ],
            },
            "type": "Text",
          },
        ],
        "rights": "http://creativecommons.org/publicdomain/mark/1.0/",
        "seeAlso": [
          {
            "format": "application/json",
            "id": "https://api.wellcomecollection.org/catalogue/v2/works/kqy8b2yh",
            "label": {
              "en": [
                "Wellcome Collection Catalogue API",
              ],
            },
            "profile": "https://api.wellcomecollection.org/catalogue/v2/context.json",
            "type": "Dataset",
          },
        ],
        "services": [
          {
            "id": "https://iiif.wellcomecollection.org/presentation/b12024673#tracking",
            "label": {
              "en": [
                "Format: Artwork, Institution: n/a, Identifier: b12024673, Digicode: digpaintings, Collection code: 44655i",
              ],
            },
            "profile": "http://universalviewer.io/tracking-extensions-profile",
            "type": "Text",
          },
          {
            "id": "https://iiif.wellcomecollection.org/presentation/b12024673#timestamp",
            "label": {
              "none": [
                "2023-09-28T12:35:10.1608874Z",
              ],
            },
            "profile": "https://github.com/wellcomecollection/iiif-builder/build-timestamp",
            "type": "Text",
          },
          {
            "id": "https://iiif.wellcomecollection.org/presentation/b12024673#accesscontrolhints",
            "label": {
              "en": [
                "open",
              ],
            },
            "metadata": [
              {
                "label": {
                  "en": [
                    "Open",
                  ],
                },
                "value": {
                  "none": [
                    "1",
                  ],
                },
              },
            ],
            "profile": "http://wellcomelibrary.org/ld/iiif-ext/access-control-hints",
            "type": "Text",
          },
        ],
        "thumbnail": [
          {
            "height": 89,
            "id": "https://iiif.wellcomecollection.org/thumbs/b12024673_0001.jp2/full/100,89/0/default.jpg",
            "service": [
              {
                "@id": "https://iiif.wellcomecollection.org/thumbs/b12024673_0001.jp2",
                "@type": "ImageService2",
                "height": 912,
                "profile": "http://iiif.io/api/image/2/level0.json",
                "sizes": [
                  {
                    "height": 89,
                    "width": 100,
                  },
                  {
                    "height": 178,
                    "width": 200,
                  },
                  {
                    "height": 356,
                    "width": 400,
                  },
                  {
                    "height": 912,
                    "width": 1024,
                  },
                ],
                "width": 1024,
              },
            ],
            "type": "Image",
            "width": 100,
          },
        ],
        "type": "Manifest",
      }
    `);
  });
});
