import iiifManifest from '../../fixtures/presentation-2/iiif-fixture-manifest.json';
import iiifManifest2 from '../../fixtures/presentation-2/biblissima-manifest.json';
import blManifest from '../../fixtures/presentation-2/bl-manifest.json';
import nlwManifest from '../../fixtures/presentation-2/nlw-manifest.json';
import bodleianManifest from '../../fixtures/presentation-2/bodleian-manifest.json';
import stanfordManifest from '../../fixtures/presentation-2/stanford-manifest.json';
import folgerManifest from '../../fixtures/presentation-2/folger-manifest.json';
import villanovaManifest from '../../fixtures/presentation-2/villanova-manifest.json';
import ngaManifest from '../../fixtures/presentation-2/nga-manifest.json';
import quatarManifest from '../../fixtures/presentation-2/quatar-manifest.json';
import nlsCollection from '../../fixtures/presentation-2/nls-collection.json';
import nlsManifest from '../../fixtures/presentation-2/nls-manifest.json';
import nlsManifest2 from '../../fixtures/presentation-2/nls-manifest-2.json';
import ghent from '../../fixtures/presentation-2/ghent.json';
import sbbManifest from '../../fixtures/presentation-2/sbb-test.json';
import codexManifest from '../../fixtures/presentation-2/codex.json';
import wikimediaProxy from '../../fixtures/presentation-2/wikimedia-proxy.json';
import withDimensions from '../../fixtures/presentation-2/iiif-fixture-manifest-with-dimensions.json';
import europeana from '../../fixtures/presentation-2/europeana.json';
import { presentation2to3 } from '../../src/presentation-2';
import { Validator } from '@hyperion-framework/validator';
import annoList from '../../fixtures/presentation-2/iiif-fixture-annotation-list.json';
import choiceAnnoList from '../../fixtures/presentation-2/anno_list_choice.json';

describe('Presentation 2 to 3', () => {
  const validator = new Validator();

  test('Simple manifest', () => {
    const result = presentation2to3.traverseManifest(iiifManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Biblissima manifest', () => {
    const result = presentation2to3.traverseManifest(iiifManifest2 as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('British Library manifest', () => {
    const result = presentation2to3.traverseManifest(blManifest as any);

    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest.errors).toEqual(null);
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

    expect(validator.validators.manifest.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Ghent manifest', () => {
    const result = presentation2to3.traverseManifest(ghent as any);
    const isValid = validator.validateManifest(result);

    // @todo removed due to ID losing its reference.
    // expect(result.id).toEqual(
    //   'https://adore.ugent.be/IIIF/manifests/archive.ugent.be:DEED7A64-2798-11E3-B8DE-18E597481370'
    // );

    expect(validator.validators.manifest.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Bodleian manifest', () => {
    const result = presentation2to3.traverseManifest(bodleianManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Stanford manifest', () => {
    const result = presentation2to3.traverseManifest(stanfordManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Folger manifest', () => {
    const result = presentation2to3.traverseManifest(folgerManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Villanova manifest', () => {
    const result = presentation2to3.traverseManifest(villanovaManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('NGA manifest', () => {
    const result = presentation2to3.traverseManifest(ngaManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest.errors).toEqual(null);
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

    expect(validator.validators.collection.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('NLS Manifest', () => {
    const result = presentation2to3.traverseManifest(nlsManifest as any);
    const isValid = validator.validateManifest(result);

    expect(result.structures).not.toBeUndefined();

    expect(result.items[0].thumbnail).toMatchInlineSnapshot(`
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

    expect(validator.validators.manifest.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });
  test('NLS Manifest 2', () => {
    const result = presentation2to3.traverseManifest(nlsManifest2 as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('SBB manifest', () => {
    const result = presentation2to3.traverseManifest(sbbManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Codex manifest', () => {
    const result = presentation2to3.traverseManifest(codexManifest as any);
    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('Wikimedia proxy manifest', () => {
    const result = presentation2to3.traverseManifest(wikimediaProxy as any);

    expect(result.type).toEqual('Manifest');

    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest.errors).toEqual(null);
    expect(isValid).toEqual(true);
  });

  test('IIIF Fixture with dimensions', () => {
    const result = presentation2to3.traverseManifest(withDimensions as any);
    expect(result.type).toEqual('Manifest');

    const isValid = validator.validateManifest(result);

    expect(validator.validators.manifest.errors).toEqual(null);
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
              "id": "http://example.org/cnt:ContentAsText/363",
              "type": "TextualBody",
            },
            "id": "http://example.org/oa:Annotation/364",
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
                "id": "http://example.org/oa:Tag/365",
                "type": "Tag",
              },
              {
                "chars": "<p>万</p>
      <p><audio style=\\"display: none;\\" controls=\\"controls\\"></audio></p>",
                "format": "text/html",
                "id": "http://example.org/dctypes:Text/366",
                "type": "Text",
              },
            ],
            "id": "http://example.org/oa:Annotation/367",
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
                  "value": "<svg xmlns='http://www.w3.org/2000/svg'><path xmlns=\\"http://www.w3.org/2000/svg\\" d=\\"M3111.52264,1062.87895h259.04821v0h259.04821v327.86107v327.86107h-259.04821h-259.04821v-327.86107z\\" data-paper-data=\\"{&quot;strokeWidth&quot;:1,&quot;rotation&quot;:0,&quot;deleteIcon&quot;:null,&quot;rotationIcon&quot;:null,&quot;group&quot;:null,&quot;editable&quot;:true,&quot;annotation&quot;:null}\\" id=\\"rectangle_023df9bc-ab63-4d9b-9426-ddbf468fa0c6\\" fill-opacity=\\"0\\" fill=\\"#00bfff\\" fill-rule=\\"nonzero\\" stroke=\\"#00bfff\\" stroke-width=\\"1\\" stroke-linecap=\\"butt\\" stroke-linejoin=\\"miter\\" stroke-miterlimit=\\"10\\" stroke-dasharray=\\"\\" stroke-dashoffset=\\"0\\" font-family=\\"none\\" font-weight=\\"none\\" font-size=\\"none\\" text-anchor=\\"none\\" style=\\"mix-blend-mode: normal\\"/></svg>",
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
                "id": "http://example.org/dctypes:Text/368",
                "type": "Text",
              },
              {
                "chars": "Colombia",
                "id": "http://example.org/oa:Tag/369",
                "type": "Tag",
              },
              {
                "chars": "Cauca",
                "id": "http://example.org/oa:Tag/370",
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
              "id": "http://example.org/dctypes:Text/371",
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
});
