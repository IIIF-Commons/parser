import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { describe, expect, test } from 'vitest';
import { upgradePresentation3To4, upgradeToPresentation4 } from '../../src/presentation-4';

const PRESENTATION_4_CONTEXT = 'http://iiif.io/api/presentation/4/context.json';

describe('presentation-4 upgrade', () => {
  test('upgrades v3 shape to v4 annotation arrays and container naming', () => {
    const v3Manifest = {
      '@context': 'http://iiif.io/api/presentation/3/context.json',
      id: 'https://example.org/manifest/v3',
      type: 'Manifest',
      label: { en: ['v3'] },
      items: [
        {
          id: 'https://example.org/canvas/1',
          type: 'Canvas',
          width: 1000,
          height: 1000,
          placeholderCanvas: {
            id: 'https://example.org/placeholder',
            type: 'Canvas',
            width: 100,
            height: 100,
          },
          items: [
            {
              id: 'https://example.org/page/1',
              type: 'AnnotationPage',
              items: [
                {
                  id: 'https://example.org/anno/1',
                  type: 'Annotation',
                  motivation: 'painting',
                  body: {
                    id: 'https://example.org/image.jpg',
                    type: 'Image',
                    format: 'image/jpeg',
                  },
                  target: 'https://example.org/canvas/1',
                },
              ],
            },
          ],
        },
      ],
    };

    const upgraded = upgradePresentation3To4(v3Manifest) as any;

    expect(upgraded['@context']).toEqual(PRESENTATION_4_CONTEXT);
    expect(upgraded.items[0].placeholderContainer).toBeTruthy();
    expect(upgraded.items[0].placeholderCanvas).toBeUndefined();

    const annotation = upgraded.items[0].items[0].items[0];
    expect(Array.isArray(annotation.motivation)).toBe(true);
    expect(Array.isArray(annotation.body)).toBe(true);
    expect(Array.isArray(annotation.target)).toBe(true);
    expect(annotation.target[0]).toEqual({
      id: 'https://example.org/canvas/1',
      type: 'Canvas',
    });
  });

  test('upgrades v2 content through v3 into v4 context', () => {
    const v2Manifest = JSON.parse(
      readFileSync(join(cwd(), 'fixtures/presentation-2/iiif-fixture-manifest.json'), 'utf8')
    );

    const upgraded = upgradeToPresentation4(v2Manifest) as any;

    expect(upgraded['@context']).toEqual(PRESENTATION_4_CONTEXT);
    expect(upgraded.type).toEqual('Manifest');
    expect(Array.isArray(upgraded.items)).toBe(true);
  });

  test('keeps v4 resources as v4 while coercing legacy annotation fields', () => {
    const v4Manifest = JSON.parse(
      readFileSync(join(cwd(), 'fixtures/presentation-4/01-model-in-scene.json'), 'utf8')
    );
    const upgraded = upgradeToPresentation4(v4Manifest) as any;
    expect(upgraded['@context']).toEqual(PRESENTATION_4_CONTEXT);
    expect(upgraded.type).toEqual('Manifest');
  });

  test('infers target type for missing-type target objects and fragments', () => {
    const manifest = {
      '@context': 'http://iiif.io/api/presentation/4/context.json',
      id: 'https://example.org/manifest/v4-targets',
      type: 'Manifest',
      label: { en: ['v4 targets'] },
      items: [
        {
          id: 'https://example.org/scene/1',
          type: 'Scene',
          items: [
            {
              id: 'https://example.org/scene/1/page',
              type: 'AnnotationPage',
              items: [
                {
                  id: 'https://example.org/scene/1/anno/1',
                  type: 'Annotation',
                  motivation: ['painting'],
                  body: [
                    {
                      id: 'https://example.org/model/1.glb',
                      type: 'Model',
                    },
                  ],
                  target: [
                    'https://example.org/scene/1#t=0,10',
                    {
                      id: 'https://example.org/scene/1/page',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const upgraded = upgradeToPresentation4(manifest) as any;
    const targets = upgraded.items[0].items[0].items[0].target;
    expect(targets[0]).toEqual({
      id: 'https://example.org/scene/1#t=0,10',
      type: 'Scene',
    });
    expect(targets[1]).toEqual({
      id: 'https://example.org/scene/1/page',
      type: 'AnnotationPage',
    });
  });
});
