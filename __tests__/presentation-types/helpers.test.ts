import { describe, expect, test } from 'vitest';
import {
  cast as cast2,
  infer as infer2,
  narrow as narrow2,
  type Manifest as Manifest2,
  type ContentResource as ContentResource2,
} from '../../src/presentation-2/types';
import {
  cast as cast3,
  infer as infer3,
  narrow as narrow3,
  type Manifest as Manifest3,
  type ContentResource as ContentResource3,
} from '../../src/presentation-3/types';
import {
  cast as cast4,
  infer as infer4,
  narrow as narrow4,
  type Manifest as Manifest4,
  type ContentResourceLike as ContentResource4,
} from '../../src/presentation-4/types';
import { infer as infer3FromEntry } from '../../src/presentation-3';
import * as Presentation3Normalized from '../../src/presentation-3-normalized';
import * as Presentation4Normalized from '../../src/presentation-4-normalized';

describe('presentation helper APIs', () => {
  test('v3 supports satisfies + infer', () => {
    const manifest = {
      id: 'https://example.org/manifest',
      type: 'Manifest',
      label: { en: ['Example'] },
      items: [],
    } satisfies Manifest3;

    const inferred = infer3.Manifest(manifest);
    expect(inferred.type).toBe('Manifest');
  });

  test('v2 supports satisfies + infer', () => {
    const manifest = {
      '@id': 'https://example.org/p2/manifest',
      '@type': 'sc:Manifest',
      label: 'Example',
      sequences: [],
    } satisfies Manifest2;

    const inferred = infer2.Manifest(manifest);
    expect(inferred['@type']).toBe('sc:Manifest');
  });

  test('v4 supports satisfies + infer', () => {
    const manifest = {
      id: 'https://example.org/p4/manifest',
      type: 'Manifest',
      label: { en: ['Example'] },
      items: [],
    } satisfies Manifest4;

    const inferred = infer4.Manifest(manifest);
    expect(inferred.type).toBe('Manifest');
  });

  test('cast validates discriminants', () => {
    expect(() => cast3.Manifest({ id: 'x', type: 'Canvas' })).toThrow(TypeError);
    expect(() => cast2.Manifest({ '@id': 'x', '@type': 'sc:Canvas' })).toThrow(TypeError);
    expect(() => cast4.Manifest({ id: 'x', type: 'Canvas' })).toThrow(TypeError);
  });

  test('narrow guards content resources', () => {
    const resource3: ContentResource3 = { id: 'https://example.org/image.jpg', type: 'Image' } as ContentResource3;
    const resource2: ContentResource2 = { '@id': 'https://example.org/image.jpg', '@type': 'dctypes:Image' } as ContentResource2;
    const resource4: ContentResource4 = { id: 'https://example.org/image.jpg', type: 'Image', width: 100, height: 100 };

    expect(narrow3.isImage(resource3)).toBe(true);
    expect(narrow2.isImage(resource2)).toBe(true);
    expect(narrow4.isImage(resource4)).toBe(true);
  });

  test('generic byType guard works', () => {
    const isCanvas = narrow3.byType('Canvas');
    expect(isCanvas({ id: 'https://example.org/canvas/1', type: 'Canvas' })).toBe(true);
    expect(isCanvas({ id: 'https://example.org/manifest/1', type: 'Manifest' })).toBe(false);
  });

  test('presentation-3 and presentation-3/types expose same helper surface', () => {
    expect(typeof infer3FromEntry.Manifest).toBe('function');
    expect(infer3FromEntry.Manifest).toBe(infer3.Manifest);
  });

  test('normalized entrypoints are type-only at runtime', () => {
    expect((Presentation3Normalized as Record<string, unknown>).infer).toBeUndefined();
    expect((Presentation4Normalized as Record<string, unknown>).infer).toBeUndefined();
  });
});
