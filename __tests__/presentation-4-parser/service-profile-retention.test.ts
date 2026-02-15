import { describe, expect, test } from 'vitest';
import { normalize, serialize, serializeConfigPresentation3, serializeConfigPresentation4 } from '../../src/presentation-4';

function createManifestWithImageService() {
  return {
    '@context': 'http://iiif.io/api/presentation/4/context.json',
    id: 'https://example.org/manifest/service-profile',
    type: 'Manifest',
    label: { en: ['service profile retention'] },
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
                motivation: ['painting'],
                body: [
                  {
                    id: 'https://example.org/image/1/full/max/0/default.jpg',
                    type: 'Image',
                    format: 'image/jpeg',
                    service: [
                      {
                        id: 'https://example.org/image/1',
                        type: 'ImageService3',
                        profile: 'level1',
                      },
                    ],
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
}

describe('presentation-4 service profile retention', () => {
  test('keeps service profile when serializing to presentation-4', () => {
    const normalized = normalize(createManifestWithImageService() as any);
    const storedService = normalized.entities.Service['https://example.org/image/1'] as any;
    expect(storedService.profile).toBe('level1');

    const serialized = serialize<any>(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation4
    );

    const serializedService = serialized.items[0].items[0].items[0].body[0].service[0];
    expect(serializedService.id).toBe('https://example.org/image/1');
    expect(serializedService.type).toBe('ImageService3');
    expect(serializedService.profile).toBe('level1');
  });

  test('keeps service profile when downgrading to presentation-3', () => {
    const normalized = normalize(createManifestWithImageService() as any);

    const serialized = serialize<any>(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation3
    );

    const body = serialized.items[0].items[0].items[0].body;
    const serializedBody = Array.isArray(body) ? body[0] : body;
    const serializedService = serializedBody.service[0];
    expect(serializedService.id).toBe('https://example.org/image/1');
    expect(serializedService.type).toBe('ImageService3');
    expect(serializedService.profile).toBe('level1');
  });
});
