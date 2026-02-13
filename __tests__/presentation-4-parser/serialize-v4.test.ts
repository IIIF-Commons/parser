import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { describe, expect, test } from 'vitest';
import { normalize, serialize, serializeConfigPresentation4 } from '../../src/presentation-4';

describe('presentation-4 serializer', () => {
  test('serializes normalized v4 back to a v4 manifest', () => {
    const fixture = JSON.parse(
      readFileSync(join(cwd(), 'fixtures/presentation-4/01-model-in-scene.json'), 'utf8')
    );
    const normalized = normalize(fixture);

    const serialized = serialize<any>(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation4
    );

    expect(serialized['@context']).toEqual('http://iiif.io/api/presentation/4/context.json');
    expect(serialized.type).toEqual('Manifest');
    expect(Array.isArray(serialized.items)).toBe(true);
  });
});
