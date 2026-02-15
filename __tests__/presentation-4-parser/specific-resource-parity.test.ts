import { describe, expect, test } from 'vitest';
import { normalize, serialize, serializeConfigPresentation4 } from '../../src/presentation-4';

describe('presentation-4 specific resource parity', () => {
  test('coerces start, range items, and annotation target for v3 input and keeps selectors', () => {
    const manifest = {
      '@context': 'http://iiif.io/api/presentation/3/context.json',
      id: 'https://example.org/manifest/p3-upgrade',
      type: 'Manifest',
      label: { en: ['p3 specific resource parity'] },
      start: 'https://example.org/canvas/1#t=5,15',
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
                  id: 'https://example.org/canvas/1/annotation/1',
                  type: 'Annotation',
                  motivation: 'painting',
                  body: {
                    id: 'https://example.org/image/1.jpg',
                    type: 'Image',
                    format: 'image/jpeg',
                  },
                  target: 'https://example.org/canvas/1#xywh=10,20,30,40',
                },
              ],
            },
          ],
        },
      ],
      structures: [
        {
          id: 'https://example.org/range/1',
          type: 'Range',
          items: ['https://example.org/canvas/1#t=0,10'],
        },
      ],
    };

    const result = normalize(manifest as any);
    const normalizedManifest = result.entities.Manifest['https://example.org/manifest/p3-upgrade'] as any;
    const normalizedRange = result.entities.Range['https://example.org/range/1'] as any;
    const normalizedAnnotation = result.entities.Annotation['https://example.org/canvas/1/annotation/1'] as any;
    const startSelector = Array.isArray(normalizedManifest.start.selector)
      ? normalizedManifest.start.selector[0]
      : normalizedManifest.start.selector;
    const rangeSelector = Array.isArray(normalizedRange.items[0].selector)
      ? normalizedRange.items[0].selector[0]
      : normalizedRange.items[0].selector;
    const targetSelector = Array.isArray(normalizedAnnotation.target[0].selector)
      ? normalizedAnnotation.target[0].selector[0]
      : normalizedAnnotation.target[0].selector;

    expect(normalizedManifest.start.type).toBe('SpecificResource');
    expect(normalizedManifest.start.source.id).toBe('https://example.org/canvas/1');
    expect(startSelector.type).toBe('FragmentSelector');
    expect(startSelector.value).toBe('t=5,15');

    expect(normalizedRange.items[0].type).toBe('SpecificResource');
    expect(normalizedRange.items[0].source.id).toBe('https://example.org/canvas/1');
    expect(rangeSelector.type).toBe('FragmentSelector');
    expect(rangeSelector.value).toBe('t=0,10');

    expect(normalizedAnnotation.target[0].type).toBe('SpecificResource');
    expect(normalizedAnnotation.target[0].source.id).toBe('https://example.org/canvas/1');
    expect(targetSelector.type).toBe('FragmentSelector');
    expect(targetSelector.value).toBe('xywh=10,20,30,40');

    const selectorId = targetSelector.id;
    expect(selectorId).toBeTruthy();
    expect(result.entities.Selector[selectorId]).toBeTruthy();
    expect(result.mapping[selectorId]).toBe('Selector');
  });

  test('preserves selector through normalize and serialize for native p4 fragment targets', () => {
    const manifest = {
      '@context': 'http://iiif.io/api/presentation/4/context.json',
      id: 'https://example.org/manifest/p4-fragment-target',
      type: 'Manifest',
      label: { en: ['native p4 selector parity'] },
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
                  id: 'https://example.org/canvas/1/annotation/1',
                  type: 'Annotation',
                  motivation: ['commenting'],
                  body: [
                    {
                      type: 'Text',
                      id: 'https://example.org/body/1',
                      format: 'text/plain',
                    },
                  ],
                  target: ['https://example.org/canvas/1#xywh=11,22,33,44'],
                },
              ],
            },
          ],
        },
      ],
    };

    const normalized = normalize(manifest as any);
    const annotation = normalized.entities.Annotation['https://example.org/canvas/1/annotation/1'] as any;
    const target = annotation.target[0];
    const targetSelector = Array.isArray(target.selector) ? target.selector[0] : target.selector;

    expect(target.type).toBe('SpecificResource');
    expect(target.source.id).toBe('https://example.org/canvas/1');
    expect(targetSelector.type).toBe('FragmentSelector');
    expect(targetSelector.value).toBe('xywh=11,22,33,44');

    const serialized = serialize<any>(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation4
    );
    const serializedTarget = serialized.items[0].items[0].items[0].target[0];
    const serializedSelector = Array.isArray(serializedTarget.selector)
      ? serializedTarget.selector[0]
      : serializedTarget.selector;

    expect(serializedTarget.type).toBe('SpecificResource');
    expect(serializedTarget.source.id).toBe('https://example.org/canvas/1');
    expect(serializedSelector.type).toBe('FragmentSelector');
    expect(serializedSelector.value).toBe('xywh=11,22,33,44');
  });
});
