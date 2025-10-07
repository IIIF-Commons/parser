import { Validator } from '@hyperion-framework/validator';
import { expect } from 'vitest';
import choiceAnnoList from '../../fixtures/presentation-2/anno_list_choice.json';
import artic from '../../fixtures/presentation-2/artic-manifest.json';
import iiifManifest2 from '../../fixtures/presentation-2/biblissima-manifest.json';
import blManifest from '../../fixtures/presentation-2/bl-manifest.json';
import bodleianManifest from '../../fixtures/presentation-2/bodleian-manifest.json';
import bodyChoice from '../../fixtures/presentation-2/body-choice.json';
import codexManifest from '../../fixtures/presentation-2/codex.json';
import sctaCollection from '../../fixtures/presentation-2/collection-scta.json';
import duplicateMemberCollection from '../../fixtures/presentation-2/duplicate-member-collection.json';
import europeana from '../../fixtures/presentation-2/europeana.json';
import folgerManifest from '../../fixtures/presentation-2/folger-manifest.json';
import ghent from '../../fixtures/presentation-2/ghent.json';
import annoList from '../../fixtures/presentation-2/iiif-fixture-annotation-list.json';
import iiifManifest from '../../fixtures/presentation-2/iiif-fixture-manifest.json';
import iiifManifestInvalid from '../../fixtures/presentation-2/iiif-fixture-manifest.json';
import withDimensions from '../../fixtures/presentation-2/iiif-fixture-manifest-with-dimensions.json';
import loc from '../../fixtures/presentation-2/loc.json';
import level0manifest from '../../fixtures/presentation-2/manifest-l0.json';
import nestedRanges from '../../fixtures/presentation-2/nested-ranges.json';
import ngaManifest from '../../fixtures/presentation-2/nga-manifest.json';
import nlsCollection from '../../fixtures/presentation-2/nls-collection.json';
import nlsManifest from '../../fixtures/presentation-2/nls-manifest.json';
import nlsManifest2 from '../../fixtures/presentation-2/nls-manifest-2.json';
import nlwManifest from '../../fixtures/presentation-2/nlw-manifest.json';
import paginatedCollection from '../../fixtures/presentation-2/paginated-collection.json';
import paginatedCollectionPage from '../../fixtures/presentation-2/paginated-collection-page.json';
import quatarManifest from '../../fixtures/presentation-2/quatar-manifest.json';
import sbbManifest from '../../fixtures/presentation-2/sbb-test.json';
import scroll from '../../fixtures/presentation-2/scroll.json';
import stanfordManifest from '../../fixtures/presentation-2/stanford-manifest.json';
import goettingen from '../../fixtures/presentation-2/uni-goettingen.json';
import villanovaManifest from '../../fixtures/presentation-2/villanova-manifest.json';
import wikimediaProxy from '../../fixtures/presentation-2/wikimedia-proxy.json';
import { convertPresentation2, presentation2to3 } from '../../src/presentation-2';

describe('Presentation 2 to 3', () => {
  const validator = new Validator();

  test('Simple manifest', () => {
    const result = presentation2to3.traverseManifest(iiifManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Biblissima manifest', () => {
    const result = presentation2to3.traverseManifest(iiifManifest2 as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('British Library manifest', () => {
    const result = presentation2to3.traverseManifest(blManifest as any);

    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);

    expect(result.service).toMatchInlineSnapshot(`
      [
        {
          "@id": "https://api.bl.uk/auth/iiif/login",
          "@type": "AuthCookieService1",
          "description": "Some content may only be available to registered readers or staff. Please log-in to The British Library to continue.",
          "header": "Please Log-In",
          "label": "Login to The British Library",
          "profile": "http://iiif.io/api/auth/0/login",
          "service": [
            {
              "@id": "https://api.bl.uk/auth/iiif/token",
              "@type": "AuthTokenService1",
              "profile": "http://iiif.io/api/auth/0/token",
            },
          ],
        },
        {
          "@id": "https://api.bl.uk/search/iiif/ark:/81055/vdc_100022545251.0x000002",
          "@type": "SearchService1",
          "label": "Search within this item",
          "profile": "http://iiif.io/api/search/0/search",
          "service": [
            {
              "@id": "https://api.bl.uk/search/iiif/ark:/81055/vdc_100022545251.0x000002/autocomplete",
              "@type": "AutoCompleteService1",
              "label": "Get suggested words in this item",
              "profile": "http://iiif.io/api/search/0/autocomplete",
            },
          ],
        },
        {
          "@context": "http://universalviewer.io/context.json",
          "@id": "http://access.bl.uk/item/share/ark:/81055/vdc_100022545251.0x000002",
          "@type": "Service",
          "profile": "http://universalviewer.io/share-extensions-profile",
        },
        {
          "@context": "http://universalviewer.io/context.json",
          "@id": "http://access.bl.uk/item/feedback/ark:/81055/vdc_100022545251.0x000002",
          "@type": "Service",
          "profile": "http://universalviewer.io/feedback-extensions-profile",
        },
        {
          "@context": "http://universalviewer.io/context.json",
          "@id": "http://access.bl.uk/item/print/ark:/81055/vdc_100022545251.0x000002",
          "@type": "Service",
          "profile": "http://universalviewer.io/print-extensions-profile",
        },
      ]
    `);
  });

  test('NLW manifest', () => {
    const result = presentation2to3.traverseManifest(nlwManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Ghent manifest', () => {
    const result = presentation2to3.traverseManifest(ghent as any);
    const isValid = validator.validateManifest(result);

    // @todo removed due to ID losing its reference.
    // expect(result.id).toEqual(
    //   'https://adore.ugent.be/IIIF/manifests/archive.ugent.be:DEED7A64-2798-11E3-B8DE-18E597481370'
    // );

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Bodleian manifest', () => {
    const result = presentation2to3.traverseManifest(bodleianManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Stanford manifest', () => {
    const result = presentation2to3.traverseManifest(stanfordManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Folger manifest', () => {
    const result = presentation2to3.traverseManifest(folgerManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Villanova manifest', () => {
    const result = presentation2to3.traverseManifest(villanovaManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Choices body', () => {
    const results = presentation2to3.traverseManifest(bodyChoice as any);
    const isValid = validator.validateManifest(results);

    // @ts-expect-error
    const body = results.items[0]!.items[0]!.items[0].body as any;

    expect(body.type).toEqual('Choice');
    expect(body.id).toEqual('http://example.org/oa:Choice/335');
    expect(body.items.length).toEqual(4);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('NGA manifest', () => {
    const result = presentation2to3.traverseManifest(ngaManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Quatar manifest', () => {
    const result: any = presentation2to3.traverseManifest(quatarManifest as any);
    const isValid = validator.validateManifest(result);

    expect(result.structures).not.toBeUndefined();

    expect(result.structures[0].items.length).toEqual(498);

    // @todo see why the identifiers provided are not valid.
    expect(validator.validators.manifest!.errors!.length).toEqual(3);
    expect(isValid).toEqual(false);
  });

  test('NLS Collection', () => {
    const result = presentation2to3.traverseManifest(nlsCollection as any);
    const isValid = validator.validateCollection(result);

    expect(validator.validators.collection!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('NLS Manifest', () => {
    const result = presentation2to3.traverseManifest(nlsManifest as any);
    const isValid = validator.validateManifest(result);

    expect(result.structures).not.toBeUndefined();

    expect(result.items[0]!.thumbnail).toMatchInlineSnapshot(`
      [
        {
          "height": 113,
          "id": "https://deriv.nls.uk/dcn4/7443/74438561.4.jpg",
          "type": "Image",
          "width": 150,
        },
      ]
    `);

    expect(result.structures![0]).toMatchInlineSnapshot(`
      {
        "id": "https://view.nls.uk/iiif/7446/74464117/range/r-1",
        "items": [
          {
            "id": "https://view.nls.uk/iiif/7446/74464117/canvas/1",
            "type": "Canvas",
          },
        ],
        "label": {
          "none": [
            "Imaginative depiction of the completed Forth Rail Bridge",
          ],
        },
        "type": "Range",
      }
    `);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });
  test('NLS Manifest 2', () => {
    const result = presentation2to3.traverseManifest(nlsManifest2 as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('SBB manifest', () => {
    const result = presentation2to3.traverseManifest(sbbManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);

    // Check profile matches.
    const firstCanvas = result.items[0]; // first canvas
    const page = firstCanvas!.items![0]; // first page
    const annotation = page!.items![0]; // first annotation
    const service = (annotation!.body as any)!.service;

    expect(service).toMatchInlineSnapshot(`
      [
        {
          "@id": "https://content.staatsbibliothek-berlin.de/dc/840973497-0001",
          "@type": "ImageService2",
          "profile": "level1",
        },
      ]
    `);
  });

  test('Codex manifest', () => {
    const result = presentation2to3.traverseManifest(codexManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('presentation 2 with level 0', () => {
    const result = presentation2to3.traverseManifest(level0manifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Wikimedia proxy manifest', () => {
    const result = presentation2to3.traverseManifest(wikimediaProxy as any);

    expect(result.type).toEqual('Manifest');

    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('LOC manifest', () => {
    const result = presentation2to3.traverseManifest(loc as any);

    expect(result.type).toEqual('Manifest');

    expect(result.thumbnail![0]!.type).toEqual('Image');

    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Art Institute of Chicago manifest', () => {
    const result = presentation2to3.traverseManifest(artic as any);
    expect(result.type).toEqual('Manifest');

    expect(result.metadata).toMatchInlineSnapshot(`
      [
        {
          "label": {
            "none": [
              "Artist / Maker",
            ],
          },
          "value": {
            "none": [
              "Georges Seurat
      French, 1859-1891",
            ],
          },
        },
        {
          "label": {
            "none": [
              "Medium",
            ],
          },
          "value": {
            "none": [
              "Oil on canvas",
            ],
          },
        },
        {
          "label": {
            "none": [
              "Dimensions",
            ],
          },
          "value": {
            "none": [
              "207.5 × 308.1 cm (81 3/4 × 121 1/4 in.)",
            ],
          },
        },
        {
          "label": {
            "none": [
              "Object Number",
            ],
          },
          "value": {
            "none": [
              "1926.224",
            ],
          },
        },
        {
          "label": {
            "none": [
              "Collection",
            ],
          },
          "value": {
            "none": [
              "<a href='http://www.artic.edu/collection' target='_blank'>Art Institute of Chicago</a>",
            ],
          },
        },
      ]
    `);
    expect(result.summary).toMatchInlineSnapshot(`
      {
        "en": [
          "In his best-known and largest painting, Georges Seurat depicted people from different social classes strolling and relaxing in a park just west of Paris on La Grande Jatte, an island in the Seine River. Although he took his subject from modern life, Seurat sought to evoke the sense of timelessness associated with ancient art, especially Egyptian and Greek sculpture. He once wrote, “I want to make modern people, in their essential traits, move about as they do on those friezes, and place them on canvases organized by harmonies of color.”
      Seurat painted A Sunday on La Grande Jatte—1884 using pointillism, a highly systematic and scientific technique based on the hypothesis that closely positioned points of pure color mix together in the viewer’s eye. He began work on the canvas in 1884 (and included this date in the title) with a layer of small, horizontal brushstrokes in complementary colors. He next added a series of dots that coalesce into solid and luminous forms when seen from a distance. Sometime before 1889 Seurat added a border of blue, orange, and red dots that provide a visual transition between the painting’s interior and the specially designed white frame, which has been re-created at the Art Institute.
      ",
        ],
      }
    `);
  });

  test('IIIF Fixture with dimensions', () => {
    const result = presentation2to3.traverseManifest(withDimensions as any);
    expect(result.type).toEqual('Manifest');

    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest!.errors).toEqual(null);
    expect(isValid).toEqual(true);

    expect(result.service).toMatchInlineSnapshot(`
      [
        {
          "@context": "http://iiif.io/api/annex/services/physdim/1/context.json",
          "@id": "http://example.org/iiif/manifest/1/dims",
          "@type": "Service",
          "physicalScale": 0.0025,
          "physicalUnits": "in",
          "profile": "http://iiif.io/api/annex/services/physdim",
        },
      ]
    `);
  });

  test('europeana', () => {
    const result = presentation2to3.traverseCanvas(europeana as any);
    expect(result.type).toEqual('Canvas');

    expect(result.annotations).toEqual([
      {
        id: 'https://iiif.europeana.eu/presentation/9200396/BibliographicResource_3000118436165/annopage/21',
        type: 'AnnotationPage',
      },
    ]);
  });

  test('annotation list', () => {
    const result = presentation2to3.traverseAnnotationList(annoList as any);
    expect(result).toMatchInlineSnapshot(`
      {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "id": "http://iiif.io/api/presentation/2.0/example/fixtures/list/65/list1.json",
        "items": [
          {
            "body": {
              "chars": "Top of First Page to Display",
              "id": "http://example.org/cnt:ContentAsText/438",
              "type": "TextualBody",
            },
            "id": "http://example.org/oa:Annotation/439",
            "motivation": "painting",
            "target": {
              "selector": {
                "type": "FragmentSelector",
                "value": "xywh=225,70,750,150",
              },
              "source": {
                "id": "http://iiif.io/api/presentation/2.0/example/fixtures/canvas/65/c1.json",
                "type": "Canvas",
              },
              "type": "SpecificResource",
            },
            "type": "Annotation",
          },
          {
            "body": [
              {
                "chars": "character",
                "id": "http://example.org/oa:Tag/440",
                "type": "Tag",
              },
              {
                "chars": "<p>万</p>
      <p><audio style="display: none;" controls="controls"></audio></p>",
                "format": "text/html",
                "id": "http://example.org/dctypes:Text/441",
                "type": "Text",
              },
            ],
            "id": "http://example.org/oa:Annotation/442",
            "motivation": [
              "tagging",
              "commenting",
            ],
            "target": {
              "selector": [
                {
                  "type": "FragmentSelector",
                  "value": "xywh=3112,1063,518,656",
                },
                {
                  "type": "SvgSelector",
                  "value": "<svg xmlns='http://www.w3.org/2000/svg'><path xmlns="http://www.w3.org/2000/svg" d="M3111.52264,1062.87895h259.04821v0h259.04821v327.86107v327.86107h-259.04821h-259.04821v-327.86107z" data-paper-data="{&quot;strokeWidth&quot;:1,&quot;rotation&quot;:0,&quot;deleteIcon&quot;:null,&quot;rotationIcon&quot;:null,&quot;group&quot;:null,&quot;editable&quot;:true,&quot;annotation&quot;:null}" id="rectangle_023df9bc-ab63-4d9b-9426-ddbf468fa0c6" fill-opacity="0" fill="#00bfff" fill-rule="nonzero" stroke="#00bfff" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"/></svg>",
                },
              ],
              "source": "https://purl.stanford.edu/ch264fq0568/iiif/canvas/ch264fq0568_1",
              "type": "SpecificResource",
            },
            "type": "Annotation",
          },
        ],
        "label": {
          "none": [
            "Test 65 List 1",
          ],
        },
        "type": "AnnotationPage",
      }
    `);
  });

  test('annotation list with choices', () => {
    const result = presentation2to3.traverseAnnotationList(choiceAnnoList as any);
    expect(result).toMatchInlineSnapshot(`
      {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "id": "https://collections.recolnat.org/annotate-server/iiif/2/annotationList/30/febbe57672bb5eaf097de6c5448c43ad8a82e012/list",
        "items": [
          {
            "body": [
              {
                "chars": "<p><i>Zone of interest</i><br/><b>Place</b><br/>Cauca of Huila</p>",
                "format": "text/html",
                "id": "http://example.org/dctypes:Text/443",
                "type": "Text",
              },
              {
                "chars": "Colombia",
                "id": "http://example.org/oa:Tag/444",
                "type": "Tag",
              },
              {
                "chars": "Cauca",
                "id": "http://example.org/oa:Tag/445",
                "type": "Tag",
              },
            ],
            "id": "https://collections.recolnat.org/annotate-server/iiif/2/annotationList/30/febbe57672bb5eaf097de6c5448c43ad8a82e012/list/1",
            "label": {
              "none": [
                "label-Place",
              ],
            },
            "metadata": [
              {
                "label": {
                  "none": [
                    "Note",
                  ],
                },
                "value": {
                  "none": [
                    "Une note complémentaire à propos de cette annotation",
                  ],
                },
              },
            ],
            "motivation": [
              "commenting",
              "tagging",
            ],
            "target": {
              "selector": [
                {
                  "type": "FragmentSelector",
                  "value": "xywh=2458.3294117573255,4064.0775928284547,148.5859420675797,52.27032787325061",
                },
                {
                  "type": "SvgSelector",
                  "value": "<svg xmlns='http://www.w3.org/2000/svg'><path .../></svg>",
                },
              ],
              "source": "https://collections.recolnat.org/annotate-server/iiif/2/canvases/canvas/1",
              "type": "SpecificResource",
            },
            "type": "Annotation",
          },
          {
            "body": {
              "chars": "<p><i>Surface tool</i><br/><b>Feuille</b><br/>70.97 mm²</p>",
              "format": "text/html",
              "id": "http://example.org/dctypes:Text/446",
              "type": "Text",
            },
            "id": "https://collections.recolnat.org/annotate-server/iiif/2/annotationList/30/febbe57672bb5eaf097de6c5448c43ad8a82e012/list/3",
            "label": {
              "none": [
                "label-Feuille",
              ],
            },
            "motivation": "commenting",
            "target": {
              "selector": [
                {
                  "type": "FragmentSelector",
                  "value": "xywh=1437.1021112372669,1013.9299384835548,129.10014843443582,234.9981533683548",
                },
                {
                  "type": "SvgSelector",
                  "value": "<svg xmlns='http://www.w3.org/2000/svg'><path .../></svg>",
                },
              ],
              "source": "https://collections.recolnat.org/annotate-server/iiif/2/canvases/canvas/1",
              "type": "SpecificResource",
            },
            "type": "Annotation",
          },
        ],
        "type": "AnnotationPage",
      }
    `);
  });

  test('goettingen manifest', () => {
    const result = presentation2to3.traverseManifest(goettingen as any);
    expect(result).toMatchSnapshot();
  });

  test('nested ranges', () => {
    const result = presentation2to3.traverseManifest(nestedRanges as any);
    const found = result.structures!.find(
      (r) => r.id === 'https://iiif.bodleian.ox.ac.uk/iiif/range/390fd0e8-9eae-475d-9564-ed916ab9035c/LOG_0281'
    );

    expect(result).toMatchSnapshot();
  });

  test('Invalid Language map', () => {
    const invalid = {
      ...JSON.parse(JSON.stringify(iiifManifestInvalid)),
      metadata: [
        { label: 'Test 1', value: '' },
        { label: 'Test 2' },
        { label: '', value: 'Test 3' },
        { value: 'Test 4' },
      ],
    };
    const result = presentation2to3.traverseManifest(invalid as any);

    expect(result.metadata).toMatchSnapshot();
  });

  test('scroll', () => {
    const result = convertPresentation2(scroll as any);

    expect(result.viewingDirection).toEqual('top-to-bottom');
  });

  test('paginated collection', () => {
    const result = convertPresentation2(paginatedCollection as any);

    expect(result).toMatchInlineSnapshot(`
      {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "behavior": [
          "top",
        ],
        "first": {
          "id": "https://api.digitale-sammlungen.de/iiif/presentation/v2/collection/top?cursor=initial",
          "type": "Collection",
        },
        "id": "https://api.digitale-sammlungen.de/iiif/presentation/v2/collection/top",
        "items": [],
        "label": {
          "none": [
            "Top Level Collection for BSB Digital Collections",
          ],
        },
        "requiredStatement": {
          "label": {
            "none": [
              "Attribution",
            ],
          },
          "value": {
            "none": [
              "Bayerische Staatsbibliothek",
            ],
          },
        },
        "total": 3074231,
        "type": "Collection",
      }
    `);
  });

  test('paginated collection page', () => {
    const result = convertPresentation2(paginatedCollectionPage as any);

    result.items = [];

    expect(result).toMatchInlineSnapshot(`
      {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "id": "https://api.digitale-sammlungen.de/iiif/presentation/v2/collection/top?cursor=initial",
        "items": [],
        "label": {
          "none": [
            "Top Level Collection for BSB Digital Collections",
          ],
        },
        "next": {
          "id": "https://api.digitale-sammlungen.de/iiif/presentation/v2/collection/top?cursor=AoIIP4AAACtic2IxMjAxODY5NA==",
          "type": "Collection",
        },
        "requiredStatement": {
          "label": {
            "none": [
              "Attribution",
            ],
          },
          "value": {
            "none": [
              "Bayerische Staatsbibliothek",
            ],
          },
        },
        "total": 3074231,
        "type": "Collection",
      }
    `);
  });

  test('duplicate member collection', () => {
    const result = convertPresentation2(duplicateMemberCollection as any);

    expect(result).toMatchInlineSnapshot(`
      {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "id": "https://iiif.harvardartmuseums.org/collections/",
        "items": [
          {
            "id": "https://iiif.harvardartmuseums.org/collections/object",
            "label": {
              "none": [
                "Objects",
              ],
            },
            "type": "Collection",
          },
        ],
        "label": {
          "none": [
            "Harvard Art Museums Collections",
          ],
        },
        "type": "Collection",
      }
    `);
  });

  test('scta collection', () => {
    const result = convertPresentation2(sctaCollection as any);

    expect(result).toMatchInlineSnapshot(`
      {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "id": "https://scta.info/iiif/authors/collection",
        "items": [
          {
            "id": "https://scta.info/iiif/Wodeham/collection",
            "label": {
              "none": [
                "Adam Wodeham",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Albert/collection",
            "label": {
              "none": [
                "Albert the Great",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/AlbertusDeSaxonia/collection",
            "label": {
              "none": [
                "Albertus De Saxonia",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/AlexanderIII/collection",
            "label": {
              "none": [
                "Alexander III",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/AlexanderOfHales/collection",
            "label": {
              "none": [
                "Alexander of Hales",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/AlfonsoPenafiel/collection",
            "label": {
              "none": [
                "Alfonso Penafiel",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/AlphonsusVargas/collection",
            "label": {
              "none": [
                "Alphonso Vargas of Toledo",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-jjska2/collection",
            "label": {
              "none": [
                "Amandus Polanus von Polansdorf",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Ambrose/collection",
            "label": {
              "none": [
                "Ambrose of Milan",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/AndreaDeLangenstein/collection",
            "label": {
              "none": [
                "Andrea de Langenstein",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/AndreasDeNovoCastro/collection",
            "label": {
              "none": [
                "Andreas de Novo Castro",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Anonymous/collection",
            "label": {
              "none": [
                "Anonymous",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/AnonymusRise/collection",
            "label": {
              "none": [
                "Anonymous",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-Ca13fj/collection",
            "label": {
              "none": [
                "Anonymous",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Anselm/collection",
            "label": {
              "none": [
                "Anselm",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-vqn2ad/collection",
            "label": {
              "none": [
                "Anselm of Lucca",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/AntoineDeChandieu/collection",
            "label": {
              "none": [
                "Antoine de Chandieu",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/AntoniusAndreas/collection",
            "label": {
              "none": [
                "Antonius Andreas",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/AntoniusPerez/collection",
            "label": {
              "none": [
                "Antonoius Perez",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Arcadius/collection",
            "label": {
              "none": [
                "Arcadius",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Aristotle/collection",
            "label": {
              "none": [
                "Aristotle",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Athanasius/collection",
            "label": {
              "none": [
                "Athanasius of Alexandria",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Augustine/collection",
            "label": {
              "none": [
                "Augustine",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/AugustinusDeAncona/collection",
            "label": {
              "none": [
                "Augustinus de Ancona",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Averroes/collection",
            "label": {
              "none": [
                "Averroes",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Avicenna/collection",
            "label": {
              "none": [
                "Avicenna",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Bandinus/collection",
            "label": {
              "none": [
                "Bandinus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-29vsnv/collection",
            "label": {
              "none": [
                "Bartholomeus Brixiensis",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/BartolomeoMastri/collection",
            "label": {
              "none": [
                "Bartolomeo Mastri",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-bdlcbd/collection",
            "label": {
              "none": [
                "Bartolomé de las Casas",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Bede/collection",
            "label": {
              "none": [
                "Bede",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Bernard/collection",
            "label": {
              "none": [
                "Bernard of Clairvaux",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-bdp8db/collection",
            "label": {
              "none": [
                "Bernard of Parma",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Boethius/collection",
            "label": {
              "none": [
                "Boethius",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Bonaventure/collection",
            "label": {
              "none": [
                "Bonaventure",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/BonifaceVIII/collection",
            "label": {
              "none": [
                "Boniface VIII",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/ClementV/collection",
            "label": {
              "none": [
                "Clement V",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/ClementOfAlexandria/collection",
            "label": {
              "none": [
                "Clement of Alexandria",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/DionysiusDeBruges/collection",
            "label": {
              "none": [
                "Dionysius de Bruges",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/DionysiusdeMontina/collection",
            "label": {
              "none": [
                "Dionysius de Montina",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/DominicusGundissalinus/collection",
            "label": {
              "none": [
                "Dominicus Gundissalinus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-dOcdOc/collection",
            "label": {
              "none": [
                "Durand of Champagne",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Durandus/collection",
            "label": {
              "none": [
                "Durandus of St. Pourcain",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Euclid/collection",
            "label": {
              "none": [
                "Euclid",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-U89ddd/collection",
            "label": {
              "none": [
                "Facinus de Ast",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/FranciscoSuarez/collection",
            "label": {
              "none": [
                "Fracisco Suárez",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-ferq7p/collection",
            "label": {
              "none": [
                "Francesco Silvestri",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/FrancisofMeyronnes/collection",
            "label": {
              "none": [
                "Francis of Meyronnes",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/FranciscoDeHerrera/collection",
            "label": {
              "none": [
                "Francisco de Herrera",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-FLBca3/collection",
            "label": {
              "none": [
                "Franciscus Lychetus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/FranciscusTotiDePerusia/collection",
            "label": {
              "none": [
                "Franciscus Toti de Perusia",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/FranciscusTurrettinus/collection",
            "label": {
              "none": [
                "Franciscus Turrettinus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-Gav9di/collection",
            "label": {
              "none": [
                "Frederico Niccolo Gavardi",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-c8ahhx/collection",
            "label": {
              "none": [
                "Frontinus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-Fulcq4/collection",
            "label": {
              "none": [
                "Fulgentius of Ruspe",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/GabrielBiel/collection",
            "label": {
              "none": [
                "Gabriel Biel",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-g8a8b8/collection",
            "label": {
              "none": [
                "Gabriel Vazquez",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/GeoffreyOfTrani/collection",
            "label": {
              "none": [
                "Geoffrey of Trani",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/GerardusDeSiena/collection",
            "label": {
              "none": [
                "Gerard of Siena",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-c7y65a/collection",
            "label": {
              "none": [
                "Geremia da Montagnone",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/GerhardusVischpekchDeOsnabruck/collection",
            "label": {
              "none": [
                "Gerhardus Vischpekch de Osnabrück",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/GilesOfRome/collection",
            "label": {
              "none": [
                "Giles of Rome",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/GodfreyOfFontaines/collection",
            "label": {
              "none": [
                "Godfrey of Fontaines",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/GonsalvoOfSpain/collection",
            "label": {
              "none": [
                "GonsalvoOfSpain",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Gratian/collection",
            "label": {
              "none": [
                "Gratian",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/BasilOfCasarea/collection",
            "label": {
              "none": [
                "Gregory of Nazianzus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Rimini/collection",
            "label": {
              "none": [
                "Gregory of Rimini",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/GregoryGreat/collection",
            "label": {
              "none": [
                "Gregory the Great",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/WillemHesselsVanEst/collection",
            "label": {
              "none": [
                "Guillelmus Estius",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/GuillelmusHedonensis/collection",
            "label": {
              "none": [
                "Guillelmus Hedonensis",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/HeinrichBullinger/collection",
            "label": {
              "none": [
                "Heinrich Bullinger",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/HenningusBoltenhagen/collection",
            "label": {
              "none": [
                "Henningus Boltenhagen",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/HenriBohic/collection",
            "label": {
              "none": [
                "Henri Bohic",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/HenricusDeWerl/collection",
            "label": {
              "none": [
                "Henricus de Werl",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Oyta/collection",
            "label": {
              "none": [
                "Henry Totting de Oyta",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/HenryOfGhent/collection",
            "label": {
              "none": [
                "Henry of Ghent",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Langenstein/collection",
            "label": {
              "none": [
                "Henry of Langenstein",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/HerveusNatalis/collection",
            "label": {
              "none": [
                "Herveus Natalis",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/HimbertOfGarda/collection",
            "label": {
              "none": [
                "Himbert of Garda",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Hostiensis/collection",
            "label": {
              "none": [
                "Hostiensis",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/HughOfStVictor/collection",
            "label": {
              "none": [
                "Hugh of St. Victor",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/HugolinoOfOrvieto/collection",
            "label": {
              "none": [
                "Hugolino of Orvieto",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-igzigz/collection",
            "label": {
              "none": [
                "Inokentii Gizel",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/IohannesBerwardus/collection",
            "label": {
              "none": [
                "Iohannes Berwardus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/IsidoreOfSeville/collection",
            "label": {
              "none": [
                "Isidore of Seville",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JacobusDeAltavilla/collection",
            "label": {
              "none": [
                "Jacobus de Altavilla",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JacquesAlmain/collection",
            "label": {
              "none": [
                "Jacques Almain",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JamesViterbo/collection",
            "label": {
              "none": [
                "James of Viterbo",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JanHus/collection",
            "label": {
              "none": [
                "Jan Hus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JeanBuridan/collection",
            "label": {
              "none": [
                "Jean Buridan",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JeanLalemandet/collection",
            "label": {
              "none": [
                "Jean Lalemandet",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Jerome/collection",
            "label": {
              "none": [
                "Jerome",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohannGerhard/collection",
            "label": {
              "none": [
                "Johann Gerhard",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohannesDeFonte/collection",
            "label": {
              "none": [
                "Johannes De Fonte",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohannesMonachus/collection",
            "label": {
              "none": [
                "Johannes Monachus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-jpdw2a/collection",
            "label": {
              "none": [
                "Johannes Pfeffer de Weidenberg",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohannesRuesbach/collection",
            "label": {
              "none": [
                "Johannes Ruesbach",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-jdwJDW/collection",
            "label": {
              "none": [
                "Johannes de Wesalia",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnAltenstaig/collection",
            "label": {
              "none": [
                "John Altenstaig",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnBaconthorpe/collection",
            "label": {
              "none": [
                "John Baconthorpe",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnBassolis/collection",
            "label": {
              "none": [
                "John Bassolis",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnBelethus/collection",
            "label": {
              "none": [
                "John Belethus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnDinsdale/collection",
            "label": {
              "none": [
                "John Dinsdale",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Scotus/collection",
            "label": {
              "none": [
                "John Duns Scotus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnEck/collection",
            "label": {
              "none": [
                "John Eck",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnHiltalingenBasel/collection",
            "label": {
              "none": [
                "John Hiltalingen of Basel",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnKlenkok/collection",
            "label": {
              "none": [
                "John Klenkok",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnMair/collection",
            "label": {
              "none": [
                "John Mair",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnMirecourt/collection",
            "label": {
              "none": [
                "John Mirecourt",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnPeckham/collection",
            "label": {
              "none": [
                "John Peckham",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnOfJandun/collection",
            "label": {
              "none": [
                "John of Jandun",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Ripa/collection",
            "label": {
              "none": [
                "John of Ripa",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnOfRodington/collection",
            "label": {
              "none": [
                "John of Rodington",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnOfSalisbury/collection",
            "label": {
              "none": [
                "John of Salisbury",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnOfWales/collection",
            "label": {
              "none": [
                "John of Wales",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JohnDamascenus/collection",
            "label": {
              "none": [
                "John the Damascene",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/JustinianI/collection",
            "label": {
              "none": [
                "Justinian I",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-kSkSkS/collection",
            "label": {
              "none": [
                "Kilianus Stetzing",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Lactantius/collection",
            "label": {
              "none": [
                "Lactantius",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/LambertusDaneau/collection",
            "label": {
              "none": [
                "Lambertus Daneau",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/LambertusDeMonte/collection",
            "label": {
              "none": [
                "Lambertus de Monte",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/LeonardusPenafiel/collection",
            "label": {
              "none": [
                "Leonardus Penafiel",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Lionhardus/collection",
            "label": {
              "none": [
                "Lionhardus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-sdv3av/collection",
            "label": {
              "none": [
                "Marcantonio Zimara",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Cicero/collection",
            "label": {
              "none": [
                "Marcus Tulius Cicero",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/MartinChemnitz/collection",
            "label": {
              "none": [
                "Martin Chemnitz",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/MartinLuther/collection",
            "label": {
              "none": [
                "Martin Luther",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/MelchiorCano/collection",
            "label": {
              "none": [
                "Melchior Cano",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-nc88aa/collection",
            "label": {
              "none": [
                "Niccolo Cabeo",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/NicholasTrivet/collection",
            "label": {
              "none": [
                "Nicholas Trivet",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-nt88nt/collection",
            "label": {
              "none": [
                "Nicholas Trivet",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/NicolasDeAnaskilch/collection",
            "label": {
              "none": [
                "Nicolas de Anaskilch",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/NicolasDeDinkelsbuhl/collection",
            "label": {
              "none": [
                "Nicolas de Dinkelsbuhl",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-nbd2d8/collection",
            "label": {
              "none": [
                "Nicolaus Bonetus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-ndtndt/collection",
            "label": {
              "none": [
                "Nicolo de Tudeschi",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/OsbertPickingham/collection",
            "label": {
              "none": [
                "Osbert Pickingham",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-b3aq1a/collection",
            "label": {
              "none": [
                "Paolo Cortese",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PaulusDeGelria/collection",
            "label": {
              "none": [
                "Paulus de Gelria",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PedroGarcia/collection",
            "label": {
              "none": [
                "Pedro Garcia",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-a28anv/collection",
            "label": {
              "none": [
                "Pelbartus de Themeswar",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-dsPeAb/collection",
            "label": {
              "none": [
                "Peter Abelard",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Aureoli/collection",
            "label": {
              "none": [
                "Peter Aureoli",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Candia/collection",
            "label": {
              "none": [
                "Peter Candia",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PeterJeanOlivi/collection",
            "label": {
              "none": [
                "Peter Jean Olivi",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Lombard/collection",
            "label": {
              "none": [
                "Peter Lombard",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/peter-plaoul/collection",
            "label": {
              "none": [
                "Peter Plaoul",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PeterDeAquila/collection",
            "label": {
              "none": [
                "Peter de Aquila",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PetrusDePalude/collection",
            "label": {
              "none": [
                "Peter of Palude",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PetrusGracilis/collection",
            "label": {
              "none": [
                "Petrus Gracilis",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PetrusHispanus/collection",
            "label": {
              "none": [
                "Petrus Hispanus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-PePeMa/collection",
            "label": {
              "none": [
                "Petrus Peregrinus de Maricourt",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PetrusScad/collection",
            "label": {
              "none": [
                "Petrus Scad",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PetrusDeAilly/collection",
            "label": {
              "none": [
                "Petrus de Ailly",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PetrusDeTarantasia/collection",
            "label": {
              "none": [
                "Petrus de Tarantasia",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PetrusDeTreisa/collection",
            "label": {
              "none": [
                "Petrus de Treisa",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PetrusDeWalse/collection",
            "label": {
              "none": [
                "Petrus de Walse",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PhilipMelanchthon/collection",
            "label": {
              "none": [
                "Philip Melanchthon",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-nbhytr/collection",
            "label": {
              "none": [
                "Philippus Probus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PicoDellaMirandola/collection",
            "label": {
              "none": [
                "Pico Della Mirandola",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PlacidusAegidiusMelander/collection",
            "label": {
              "none": [
                "Placidus Aegidius Melander",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-HDmDvD/collection",
            "label": {
              "none": [
                "Pliny the Elder",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-ZEvn3a/collection",
            "label": {
              "none": [
                "Pope Innocent II",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PopeInnocentIII/collection",
            "label": {
              "none": [
                "Pope Innocent III",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Porphyry/collection",
            "label": {
              "none": [
                "Porphyry of Tyre",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PsBonaventure/collection",
            "label": {
              "none": [
                "Ps-Bonaventure",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/PsAugustine/collection",
            "label": {
              "none": [
                "Pseudo-Augustinus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Dionysius/collection",
            "label": {
              "none": [
                "Pseudo-Dionysius",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/RadulphusBrito/collection",
            "label": {
              "none": [
                "Radulphus Brito",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/RaymondOfPenyafort/collection",
            "label": {
              "none": [
                "Raymond Of Penyafort",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-RDeDRD/collection",
            "label": {
              "none": [
                "René Descartes",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/RicardusDeMediavilla/collection",
            "label": {
              "none": [
                "Ricardus de Mediavilla",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/RichardFishacre/collection",
            "label": {
              "none": [
                "Richard Fishacre",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/RichardFitzRalph/collection",
            "label": {
              "none": [
                "Richard FitzRalph",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/RichardKilvington/collection",
            "label": {
              "none": [
                "Richard of Kilvington",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/RichardOfStVictor/collection",
            "label": {
              "none": [
                "Richard of St. Victor",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-x7hda7/collection",
            "label": {
              "none": [
                "Robert Baron",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Holcot/collection",
            "label": {
              "none": [
                "Robert Holcot",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/RobertKilwardby/collection",
            "label": {
              "none": [
                "Robert Kilwardby",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/RobertOfCricklade/collection",
            "label": {
              "none": [
                "Robert of Cricklade",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/RogerBacon/collection",
            "label": {
              "none": [
                "Roger Bacon",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/SimonMagister/collection",
            "label": {
              "none": [
                "Simon Magister",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/SimonFaversham/collection",
            "label": {
              "none": [
                "Simon of Faversham",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-sykisy/collection",
            "label": {
              "none": [
                "Stefan Yavorskyi",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/StephansuDeEntzendorf/collection",
            "label": {
              "none": [
                "Stephanus de Entzendorf",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-x84nST/collection",
            "label": {
              "none": [
                "Stephen Tempier",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Aquinas/collection",
            "label": {
              "none": [
                "Thomas Aquinas",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Bradwardine/collection",
            "label": {
              "none": [
                "Thomas Bradwardine",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/ThomasCajetan/collection",
            "label": {
              "none": [
                "Thomas Cajetan",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/ThomasOfIreland/collection",
            "label": {
              "none": [
                "Thomas Of Ireland",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/ThomasDeClivis/collection",
            "label": {
              "none": [
                "Thomas de Clivis",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/ThomasStrasbourg/collection",
            "label": {
              "none": [
                "Thomas of Strasbourg",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/ThomasOfSutton/collection",
            "label": {
              "none": [
                "Thomas of Sutton",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Ulpianus/collection",
            "label": {
              "none": [
                "Ulpianus",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Virgil/collection",
            "label": {
              "none": [
                "Virgil",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Chatton/collection",
            "label": {
              "none": [
                "Walter Chatton",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/WilliamCrathorn/collection",
            "label": {
              "none": [
                "William Crathorn",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-cnuv73/collection",
            "label": {
              "none": [
                "William St. Amour",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/per-uyt678/collection",
            "label": {
              "none": [
                "William Whitaker",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/WilliamDeRothwell/collection",
            "label": {
              "none": [
                "William de Rothwell",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/WilliamDeVaurouillon/collection",
            "label": {
              "none": [
                "William de Vaurouillon",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/WilliamOfAuxerre/collection",
            "label": {
              "none": [
                "William of Auxerre",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/WilliamOfMelitona/collection",
            "label": {
              "none": [
                "William of Melitona",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/Ockham/collection",
            "label": {
              "none": [
                "William of Ockham",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/WilliamOfParis/collection",
            "label": {
              "none": [
                "William of Paris",
              ],
            },
            "type": "Collection",
          },
          {
            "id": "https://scta.info/iiif/WilliamofRubio/collection",
            "label": {
              "none": [
                "William of Rubio",
              ],
            },
            "type": "Collection",
          },
        ],
        "label": {
          "none": [
            "SCTA Authors",
          ],
        },
        "type": "Collection",
      }
    `);
  });
});
