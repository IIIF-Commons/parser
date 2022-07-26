import { presentation3StrictUpgrade } from '../../src/presentation-3/strict-upgrade';
import { Manifest } from '@iiif/presentation-3';

function getBaseManifest(): Manifest {
  return {
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    id: 'https://iiif.io/api/cookbook/recipe/0001-mvm-image/manifest.json',
    type: 'Manifest',
    label: {
      en: ['Image 1'],
    },
    items: [
      {
        id: 'https://iiif.io/api/cookbook/recipe/0001-mvm-image/canvas/p1',
        type: 'Canvas',
        height: 1800,
        width: 1200,
        items: [
          {
            id: 'https://iiif.io/api/cookbook/recipe/0001-mvm-image/page/p1/1',
            type: 'AnnotationPage',
            items: [
              {
                id: 'https://iiif.io/api/cookbook/recipe/0001-mvm-image/annotation/p0001-image',
                type: 'Annotation',
                motivation: 'painting',
                body: {
                  id: 'http://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png',
                  type: 'Image',
                  format: 'image/png',
                  height: 1800,
                  width: 1200,
                },
                target: 'https://iiif.io/api/cookbook/recipe/0001-mvm-image/canvas/p1',
              },
            ],
          },
        ],
      },
    ],
  };
}

describe('Strict upgrade', () => {
  test('Label as string', () => {
    const manifest = {
      id: 'https://example.org',
      type: 'Manifest',
      label: 'Wrong label',
    };

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    expect(upgraded.label).toEqual({ none: ['Wrong label'] });
    expect(state.warnings).toContain('"label" should be a language map instead found a string');
  });
  test('Label without language', () => {
    const manifest = {
      id: 'https://example.org',
      type: 'Manifest',
      label: ['Wrong label'],
    };

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    expect(upgraded.label).toEqual({ none: ['Wrong label'] });
    expect(state.warnings).toContain('"label" should be a language map instead found a string');
  });
  test('Label missing array values', () => {
    const manifest = {
      id: 'https://example.org',
      type: 'Manifest',
      label: { en: 'Wrong label' },
    };

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    expect(upgraded.label).toEqual({ en: ['Wrong label'] });
    expect(state.warnings).toContain(
      '"label" values inside a language map should be an Array of strings, found a string'
    );
  });
  test('Label empty array', () => {
    const manifest = {
      id: 'https://example.org',
      type: 'Manifest',
      label: [],
    };

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    expect(upgraded.label).toEqual({ none: [''] });
    expect(state.warnings).toContain('"label" should be a language map instead found an unknown value');
  });
  test('Label invalid values', () => {
    const manifest = {
      id: 'https://example.org',
      type: 'Manifest',
      label: {
        en: { INVALID: 'this is not valid' },
      },
    };

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    expect(upgraded.label).toEqual({ none: [''] });
    expect(state.warnings).toContain(
      '"label" values inside a language map should be an Array of strings, found an unknown value'
    );
  });
  test('Label invalid values (object)', () => {
    const manifest = {
      id: 'https://example.org',
      type: 'Manifest',
      label: {
        de: [{ INVALID: 'this is not valid' }],
      },
    };

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    expect(upgraded.label).toEqual({ none: [''] });
    expect(state.warnings).toContain(
      '"label" values inside a language map should be an Array of strings, found an unknown value'
    );
  });
  test('Incorrect format', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.items[0].items[0].items[0].body.format = ['image/png'];

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.items[0].items[0].items[0].body.format).toEqual('image/png');
    expect(state.warnings).toContain('"format" should be a single string');
  });
  test('Invalid format', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.items[0].items[0].items[0].body.format = [{ type: 'image/png' }];

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.items[0].items[0].items[0].body.format).toBeUndefined();
    expect(state.warnings).toContain('"format" should be a single string');
  });
  test('Invalid behavior', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.behavior = 'paged';

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.behavior).toEqual(['paged']);
    expect(state.warnings).toContain('"behavior" should be Array of values');
  });
  test('Invalid height/width (float)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.items[0].height += 0.5;
    // @ts-ignore
    manifest.items[0].width += 0.5;

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.items[0].height).toEqual(1800);
    // @ts-ignore
    expect(upgraded.items[0].width).toEqual(1200);
    expect(state.warnings).toContain('"width" expected value to be a Integer, instead found a Float');
    expect(state.warnings).toContain('"height" expected value to be a Integer, instead found a Float');
  });
  test('Invalid height/width (string)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.items[0].height = `${manifest.items[0].height}`;
    // @ts-ignore
    manifest.items[0].width = `${manifest.items[0].width}`;

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.items[0].height).toEqual(1800);
    // @ts-ignore
    expect(upgraded.items[0].width).toEqual(1200);
    expect(state.warnings).toContain('"width" expected value to be a Integer, instead found a string');
    expect(state.warnings).toContain('"height" expected value to be a Integer, instead found a string');
  });
  test('Invalid height/width (NaN)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.items[0].height = `abc`;
    // @ts-ignore
    manifest.items[0].width = `abc`;

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.items[0].height).toBeUndefined();
    // @ts-ignore
    expect(upgraded.items[0].width).toBeUndefined();
    expect(state.warnings).toContain('"width" expected value to be a Integer, instead found an invalid value');
    expect(state.warnings).toContain('"height" expected value to be a Integer, instead found an invalid value');
  });
  test('Invalid duration (string)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.items[0].duration = `12.34`;

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.items[0].duration).toEqual(12.34);
    expect(state.warnings).toContain('"duration" expected value to be a Number, instead found a string');
  });
  test('Invalid duration (NaN)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.items[0].duration = `NOT A NUMBER`;

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.items[0].duration).toBeUndefined();
    expect(state.warnings).toContain('"duration" expected value to be a Number, instead found an invalid value');
  });
  test('Invalid summary', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.items[0].summary = `This is invalid`;

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.items[0].summary).toEqual({ none: ['This is invalid'] });
    expect(state.warnings).toContain('"summary" should be a language map instead found a string');
  });

  test('Invalid required statement (just string)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.items[0].requiredStatement = 'This is a required statement';

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.items[0].requiredStatement).toEqual({
      label: { none: ['Required statement'] },
      value: { none: ['This is a required statement'] },
    });
    expect(state.warnings).toContain('"requiredStatement" should be a {label, value} set of Language maps');
  });
  test('Invalid required statement (just value)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.items[0].requiredStatement = { value: 'This is a required statement' };

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.items[0].requiredStatement).toEqual({
      label: { none: ['Required statement'] },
      value: { none: ['This is a required statement'] },
    });
    expect(state.warnings).toContain('"requiredStatement" should have both a label and a value');
    expect(state.warnings).toContain('"requiredStatement.value" should be a language map instead found a string');
  });
  test('Invalid metadata (just string)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.items[0].metadata = 'This is some metadata';

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.items[0].metadata).toEqual([]);
    expect(state.warnings).toContain('"metadata" should be an array of {label, value} Language maps');
  });
  test('Invalid metadata (just value)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.items[0].metadata = { value: 'This is some metadata' };

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.items[0].metadata).toEqual([]);
    expect(state.warnings).toContain('"metadata" should be an array of {label, value} Language maps');
  });
  test('Invalid metadata (single, only value)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.items[0].metadata = [{ value: 'This is some metadata' }];

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.items[0].metadata).toEqual([
      {
        label: { none: [''] },
        value: { none: ['This is some metadata'] },
      },
    ]);
    expect(state.warnings).toContain('"metadata.0" should have both a label and a value');
    expect(state.warnings).toContain('"metadata.0.value" should be a language map instead found a string');
  });
  test('Invalid rights statement (https)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.rights = 'https://creativecommons.org/licenses/by/4.0/';

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.rights).toEqual('http://creativecommons.org/licenses/by/4.0/');
    expect(state.warnings).toMatchInlineSnapshot(`
      Array [
        "\\"rights\\" is an informative property and should contain the http variation of the rights statement",
      ]
    `);
  });
  test('Invalid rights statement (array + https)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.rights = ['https://creativecommons.org/licenses/by/4.0/'];

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.rights).toEqual('http://creativecommons.org/licenses/by/4.0/');
    expect(state.warnings).toMatchInlineSnapshot(`
      Array [
        "\\"rights\\" should only contain a single string",
        "\\"rights\\" is an informative property and should contain the http variation of the rights statement",
      ]
    `);
  });
  test('Invalid rights statement (invalid)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.rights = 'This is not valid';

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.rights).toEqual('This is not valid');
    expect(state.warnings).toMatchInlineSnapshot(`
      Array [
        "\\"rights\\" should be a valid URI",
      ]
    `);
  });
  test('Invalid navDate (invalid)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.navDate = '2020:01:02';

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.navDate).toBeUndefined();
    expect(state.warnings).toMatchInlineSnapshot(`
      Array [
        "\\"navDate\\" should be a valid XSD dateTime literal",
      ]
    `);
  });
  test('Valid navDate', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.navDate = '2010-01-01T00:00:00Z';

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.navDate).toEqual('2010-01-01T00:00:00Z');
    expect(state.warnings).toHaveLength(0);
  });
  test('Invalid navDate (whitespace)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.navDate = ' 2010-01-01T00:00:00Z   ';

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.navDate).toEqual('2010-01-01T00:00:00Z');
    expect(state.warnings).toMatchInlineSnapshot(`
      Array [
        "\\"navDate\\" should not contain extra whitespace",
      ]
    `);
  });
  test('Invalid language (string)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.language = 'en';

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(manifest.language).toEqual(['en']);
    expect(state.warnings).toMatchInlineSnapshot(`
      Array [
        "\\"language\\" should be Array of values",
      ]
    `);
  });
  test('Invalid language (other)', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.language = { lang: 'en' };

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.language).toEqual([]);
    expect(state.warnings).toMatchInlineSnapshot(`
      Array [
        "\\"language\\" should be Array of values",
        "'\\"language\\" expected array of strings",
      ]
    `);
  });
  test('Valid language', () => {
    const manifest = getBaseManifest();

    // @ts-ignore
    manifest.language = ['en', 'fr'];

    const state = { warnings: [] as string[] };
    const upgraded = presentation3StrictUpgrade(manifest as any, state);

    // @ts-ignore
    expect(upgraded.language).toEqual(['en', 'fr']);
    expect(state.warnings).toHaveLength(0);
  });

  describe('Accompanying canvas', () => {
    function getAccCanvas() {
      return {
        '@context': 'http://iiif.io/api/presentation/3/context.json',
        id: 'https://iiif.io/api/cookbook/recipe/0014-accompanyingcanvas/manifest.json',
        type: 'Manifest',
        label: {
          en: ["Partial audio recording of Gustav Mahler's _Symphony No. 3_"],
        },
        items: [
          {
            id: 'https://iiif.io/api/cookbook/recipe/0014-accompanyingcanvas/canvas/p1',
            type: 'Canvas',
            label: {
              en: ['Gustav Mahler, Symphony No. 3, CD 1'],
            },
            duration: 1985.024,
            accompanyingCanvas: {
              id: 'https://iiif.io/api/cookbook/recipe/0014-accompanyingcanvas/canvas/accompanying',
              type: 'Canvas',
              label: {
                en: ['First page of score for Gustav Mahler, Symphony No. 3'],
              },
              height: 998,
              width: 772,
              items: [
                {
                  id: 'https://iiif.io/api/cookbook/recipe/0014-accompanyingcanvas/canvas/accompanying/annotation/page',
                  type: 'AnnotationPage',
                  items: [
                    {
                      id: 'https://iiif.io/api/cookbook/recipe/0014-accompanyingcanvas/canvas/accompanying/annotation/image',
                      type: 'Annotation',
                      motivation: 'painting',
                      body: {
                        id: 'https://iiif.io/api/image/3.0/example/reference/4b45bba3ea612ee46f5371ce84dbcd89-mahler-0/full/,998/0/default.jpg',
                        type: 'Image',
                        format: 'image/jpeg',
                        height: 998,
                        width: 772,
                        service: [
                          {
                            id: 'https://iiif.io/api/image/3.0/example/reference/4b45bba3ea612ee46f5371ce84dbcd89-mahler-0',
                            type: 'ImageService3',
                            profile: 'level1',
                          },
                        ],
                      },
                      target: 'https://iiif.io/api/cookbook/recipe/0014-accompanyingcanvas/canvas/accompanying',
                    },
                  ],
                },
              ],
            },
            items: [
              {
                id: 'https://iiif.io/api/cookbook/recipe/0014-accompanyingcanvas/canvas/page/p1',
                type: 'AnnotationPage',
                items: [
                  {
                    id: 'https://iiif.io/api/cookbook/recipe/0014-accompanyingcanvas/canvas/page/annotation/segment1-audio',
                    type: 'Annotation',
                    motivation: 'painting',
                    body: {
                      id: 'https://fixtures.iiif.io/audio/indiana/mahler-symphony-3/CD1/medium/128Kbps.mp4',
                      type: 'Sound',
                      duration: 1985.024,
                      format: 'video/mp4',
                    },
                    target: 'https://iiif.io/api/cookbook/recipe/0014-accompanyingcanvas/canvas/page/p1',
                  },
                ],
              },
            ],
          },
        ],
      };
    }

    test('valid case', () => {
      const manifest = getAccCanvas();

      const state = { warnings: [] as string[] };
      const upgraded = presentation3StrictUpgrade(manifest as any, state);

      // @ts-ignore
      expect(state.warnings).toHaveLength(0);
    });
    test('invalid case', () => {
      const manifest = getAccCanvas();
      const manifestCorrect = getAccCanvas();

      // @ts-ignore
      manifest.items[0].accompanyingCanvas = [manifest.items[0].accompanyingCanvas];

      const state = { warnings: [] as string[] };
      const upgraded = presentation3StrictUpgrade(manifest as any, state);

      // @ts-ignore
      expect(upgraded.items[0].accompanyingCanvas).toEqual(manifestCorrect.items[0].accompanyingCanvas);
      expect(state.warnings).toMatchInlineSnapshot(`
        Array [
          "\\"accompanyingCanvas\\" should only contain a single value",
        ]
      `);
    });
    test('not type Canvas', () => {
      const manifest = getAccCanvas();

      // @ts-ignore
      manifest.items[0].accompanyingCanvas.type = 'NotCanvas';

      const state = { warnings: [] as string[] };
      const upgraded = presentation3StrictUpgrade(manifest as any, state);

      // @ts-ignore
      expect(state.warnings).toMatchInlineSnapshot(`
        Array [
          "\\"accompanyingCanvas\\" should be a Canvas",
        ]
      `);
    });
  });
});
