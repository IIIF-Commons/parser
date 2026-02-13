import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { describe, expect, test } from 'vitest';
import { upgradeToPresentation4, validatePresentation4 } from '../../src/presentation-4';

describe('presentation-4 validator', () => {
  test('reports raw-shape issues for authored v4 fixtures', () => {
    const fixture = JSON.parse(
      readFileSync(join(cwd(), 'fixtures/presentation-4/01-model-in-scene.json'), 'utf8')
    );
    const report = validatePresentation4(fixture);

    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === 'annotation-target-array')).toBe(true);
    expect(report.issues.some((issue) => issue.code === 'annotation-body-array')).toBe(true);
  });

  test('accepts the same fixture after v4 coercion', () => {
    const fixture = JSON.parse(
      readFileSync(join(cwd(), 'fixtures/presentation-4/01-model-in-scene.json'), 'utf8')
    );
    const coerced = upgradeToPresentation4(fixture);
    const report = validatePresentation4(coerced);

    expect(report.valid).toBe(true);
    expect(report.stats.errors).toBe(0);
  });

  test('reports structural validation issues', () => {
    const invalid = {
      '@context': 'http://iiif.io/api/presentation/4/context.json',
      id: 'https://example.org/manifest/invalid',
      type: 'Manifest',
      label: { en: ['invalid'] },
      items: [
        {
          id: 'https://example.org/canvas/1',
          type: 'Canvas',
          width: 0,
          height: -10,
          items: [],
        },
      ],
    };

    const report = validatePresentation4(invalid);

    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === 'canvas-width-required')).toBe(true);
    expect(report.issues.some((issue) => issue.code === 'canvas-height-required')).toBe(true);
  });

  test('throws in strict mode when errors are present', () => {
    const invalid = {
      '@context': 'http://iiif.io/api/presentation/4/context.json',
      id: 'https://example.org/manifest/invalid-2',
      type: 'Manifest',
      label: { en: ['invalid'] },
      items: [],
    };

    expect(() => validatePresentation4(invalid, { mode: 'strict' })).toThrow();
  });

  test('reports activating annotation body errors', () => {
    const invalid = {
      '@context': 'http://iiif.io/api/presentation/4/context.json',
      id: 'https://example.org/manifest/activating-invalid',
      type: 'Manifest',
      label: { en: ['invalid activating'] },
      items: [
        {
          id: 'https://example.org/canvas/1',
          type: 'Canvas',
          width: 1000,
          height: 1000,
          items: [
            {
              id: 'https://example.org/canvas/1/page/1',
              type: 'AnnotationPage',
              items: [
                {
                  id: 'https://example.org/canvas/1/page/1/anno/1',
                  type: 'Annotation',
                  motivation: ['activating'],
                  body: [
                    {
                      id: 'https://example.org/bodies/plain-text',
                      type: 'Text',
                      value: 'not a specific resource',
                    },
                  ],
                  target: ['https://example.org/canvas/1'],
                },
              ],
            },
          ],
        },
      ],
    };

    const report = validatePresentation4(invalid, { mode: 'tolerant' });
    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === 'activating-body-specific-resource')).toBe(true);
  });

  test('reports selector and quantity-shape issues', () => {
    const invalid = {
      '@context': 'http://iiif.io/api/presentation/4/context.json',
      id: 'https://example.org/manifest/selector-invalid',
      type: 'Manifest',
      label: { en: ['invalid selector'] },
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
                      id: 'https://example.org/content/model.glb',
                      type: 'Model',
                      format: 'model/gltf-binary',
                      spatialScale: {
                        type: 'Text',
                        value: 'wrong',
                      },
                    },
                  ],
                  target: [
                    {
                      type: 'SpecificResource',
                      source: 'https://example.org/scene/1',
                      selector: [
                        {
                          type: 'Spatial',
                          value: '0,0,100,100',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const report = validatePresentation4(invalid, { mode: 'tolerant' });
    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === 'selector-type-invalid')).toBe(true);
    expect(report.issues.some((issue) => issue.code === 'spatial-scale-quantity')).toBe(true);
  });

  test('reports target object type/id requirements', () => {
    const invalid = {
      '@context': 'http://iiif.io/api/presentation/4/context.json',
      id: 'https://example.org/manifest/target-shape',
      type: 'Manifest',
      label: { en: ['target shape'] },
      items: [
        {
          id: 'https://example.org/canvas/1',
          type: 'Canvas',
          width: 1000,
          height: 1000,
          items: [
            {
              id: 'https://example.org/canvas/1/page/1',
              type: 'AnnotationPage',
              items: [
                {
                  id: 'https://example.org/canvas/1/page/1/anno/1',
                  type: 'Annotation',
                  motivation: ['painting'],
                  body: [
                    {
                      id: 'https://example.org/image.jpg',
                      type: 'Image',
                      format: 'image/jpeg',
                    },
                  ],
                  target: [
                    {
                      id: 'https://example.org/canvas/1',
                    },
                    'https://example.org/canvas/1#xywh=0,0,100,100',
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const report = validatePresentation4(invalid, { mode: 'tolerant' });
    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === 'annotation-target-type-required')).toBe(true);
    expect(report.issues.some((issue) => issue.code === 'annotation-target-object')).toBe(true);
  });
});
