import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { describe, expect, test } from 'vitest';
import { normalize } from '../../src/presentation-4';

const fixtureDir = join(cwd(), 'fixtures/presentation-4');
const fixtureFiles = readdirSync(fixtureDir).filter((file) => file.endsWith('.json'));

describe('presentation-4 normalize', () => {
  test.each(fixtureFiles)('normalizes fixture %s', (fixtureName) => {
    const fixture = JSON.parse(readFileSync(join(fixtureDir, fixtureName), 'utf8'));
    const result = normalize(fixture);

    expect(result.resource.type).toBe('Manifest');
    expect(result.entities.Manifest[result.resource.id]).toBeTruthy();
    expect(Object.keys(result.mapping).length).toBeGreaterThan(1);
  });

  test('mints deterministic ids for missing resources in tolerant mode', () => {
    const input = {
      '@context': 'http://iiif.io/api/presentation/4/context.json',
      type: 'Manifest',
      label: { en: ['No IDs'] },
      items: [
        {
          type: 'Timeline',
          duration: 15.5,
          items: [
            {
              type: 'AnnotationPage',
              items: [
                {
                  type: 'Annotation',
                  motivation: 'painting',
                  body: {
                    type: 'Sound',
                    id: 'https://example.org/audio.mp3',
                    format: 'audio/mp3',
                  },
                  target: 'https://example.org/timeline/1',
                },
              ],
            },
          ],
        },
      ],
    };

    const result = normalize(input as any);

    expect(result.resource.id.startsWith('vault://iiif-parser/v4/Manifest/')).toBe(true);
    expect(result.diagnostics.some((diagnostic) => diagnostic.code === 'minted-id')).toBe(true);
    expect(Object.keys(result.entities.Timeline).length).toBe(1);
  });
});
