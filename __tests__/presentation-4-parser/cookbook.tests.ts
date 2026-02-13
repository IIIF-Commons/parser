import cookbookIndex from '../../fixtures/cookbook-v4/_index.json';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { describe, expect, test } from 'vitest';
import { normalize, serialize, serializeConfigPresentation4, validatePresentation4 } from '../../src/presentation-4';

const { readFile } = fs;

describe('Presentation 4 cookbook', function () {
  const tests = Object.values(cookbookIndex as Record<string, { id: string; url: string }>).map((item) => [
    item.id,
    item.url,
  ]);

  test.each(tests)('Testing normalize %p (%p)', async (id: string, url: string) => {
    const json = await readFile(join(cwd(), 'fixtures/cookbook-v4', `${id}.json`));
    const manifest = JSON.parse(json.toString());
    const original = JSON.parse(json.toString());
    const normalized = normalize(manifest);

    expect(normalized.resource.type).toBe(manifest.type);
    expect(normalized.resource.id).toBe(manifest.id);

    const report = validatePresentation4(manifest, { mode: 'tolerant' });
    const errors = report.issues.filter((issue) => issue.severity === 'error');
    expect(errors).toEqual([]);

    const reserialized = serialize(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation4
    ) as any;

    expect(reserialized).toEqual(original);
    expect(url).toEqual((cookbookIndex as any)[id].url);
  });
});
