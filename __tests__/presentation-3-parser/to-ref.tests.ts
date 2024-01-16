import { toRef } from '../../src/shared/to-ref';

describe('toRef()', function () {
  const supportedRefs = [
    //
    ['https://example.org/manifest-1', 'Manifest'],
    [{ id: 'https://example.org/manifest-1', type: 'unknown' }, 'Manifest'],
    [{ id: 'https://example.org/manifest-1', type: 'Manifest' }, undefined],
    [{ id: 'https://example.org/manifest-1', type: 'Manifest', label: { en: ['Not seen'] } }, undefined],
    [{ '@id': 'https://example.org/manifest-1', '@type': 'Manifest' }, undefined],
    [{ '@id': 'https://example.org/manifest-1', '@type': 'sc:Manifest' }, undefined],
    [{ type: 'SpecificResource', source: 'https://example.org/manifest-1' }, 'Manifest'],
    [{ type: 'SpecificResource', source: { id: 'https://example.org/manifest-1', type: 'Manifest' } }],
  ];

  test.each(supportedRefs as [any, any][])('Testing toRef(%s, %s)', async (ref, type) => {
    expect(toRef(ref, type)).toEqual({ id: 'https://example.org/manifest-1', type: 'Manifest' });
  });
});
