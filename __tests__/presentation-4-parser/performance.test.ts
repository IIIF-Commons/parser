import { performance } from 'node:perf_hooks';
import { describe, expect, test } from 'vitest';
import { normalize, serialize, serializeConfigPresentation4, validatePresentation4 } from '../../src/presentation-4';

function createLargeCanvasManifest(canvasCount = 200, annotationsPerCanvas = 4) {
  return {
    '@context': 'http://iiif.io/api/presentation/4/context.json',
    id: 'https://example.org/iiif/perf/canvas-manifest',
    type: 'Manifest',
    label: { en: ['Large canvas manifest'] },
    items: Array.from({ length: canvasCount }).map((_, canvasIndex) => ({
      id: `https://example.org/iiif/perf/canvas/${canvasIndex + 1}`,
      type: 'Canvas',
      width: 4000,
      height: 3000,
      items: [
        {
          id: `https://example.org/iiif/perf/canvas/${canvasIndex + 1}/page/1`,
          type: 'AnnotationPage',
          items: Array.from({ length: annotationsPerCanvas }).map((__, annotationIndex) => ({
            id: `https://example.org/iiif/perf/canvas/${canvasIndex + 1}/annotation/${annotationIndex + 1}`,
            type: 'Annotation',
            motivation: ['painting'],
            body: [
              {
                id: `https://example.org/iiif/perf/image/${canvasIndex + 1}-${annotationIndex + 1}.jpg`,
                type: 'Image',
                format: 'image/jpeg',
              },
            ],
            target: [
              {
                id: `https://example.org/iiif/perf/canvas/${canvasIndex + 1}`,
                type: 'Canvas',
              },
            ],
          })),
        },
      ],
    })),
  };
}

function createLargeSceneManifest(sceneCount = 120, modelsPerScene = 3) {
  return {
    '@context': 'http://iiif.io/api/presentation/4/context.json',
    id: 'https://example.org/iiif/perf/scene-manifest',
    type: 'Manifest',
    label: { en: ['Large scene manifest'] },
    items: Array.from({ length: sceneCount }).map((_, sceneIndex) => ({
      id: `https://example.org/iiif/perf/scene/${sceneIndex + 1}`,
      type: 'Scene',
      items: [
        {
          id: `https://example.org/iiif/perf/scene/${sceneIndex + 1}/page/1`,
          type: 'AnnotationPage',
          items: Array.from({ length: modelsPerScene }).map((__, modelIndex) => ({
            id: `https://example.org/iiif/perf/scene/${sceneIndex + 1}/annotation/${modelIndex + 1}`,
            type: 'Annotation',
            motivation: ['painting'],
            body: [
              {
                id: `https://example.org/iiif/perf/model/${sceneIndex + 1}-${modelIndex + 1}.glb`,
                type: 'Model',
                format: 'model/gltf-binary',
              },
            ],
            target: [
              {
                id: `https://example.org/iiif/perf/scene/${sceneIndex + 1}`,
                type: 'Scene',
              },
            ],
          })),
        },
      ],
    })),
  };
}

describe('presentation-4 performance scale tests', () => {
  test('normalizes and serializes large canvas manifests', () => {
    const manifest = createLargeCanvasManifest();
    const started = performance.now();
    const normalized = normalize(manifest);
    const serialized = serialize<any>(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation4
    );
    const report = validatePresentation4(manifest, { mode: 'tolerant' });
    const elapsed = performance.now() - started;

    expect(report.valid).toBe(true);
    expect(normalized.resource.type).toBe('Manifest');
    expect(serialized.id).toBe(manifest.id);
    expect(Object.keys(normalized.mapping).length).toBeGreaterThan(1500);
    expect(elapsed).toBeLessThan(20000);
  });

  test('normalizes and serializes large scene manifests', () => {
    const manifest = createLargeSceneManifest();
    const started = performance.now();
    const normalized = normalize(manifest);
    const serialized = serialize<any>(
      {
        entities: normalized.entities as any,
        mapping: normalized.mapping as any,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation4
    );
    const report = validatePresentation4(manifest, { mode: 'tolerant' });
    const elapsed = performance.now() - started;

    expect(report.valid).toBe(true);
    expect(normalized.resource.type).toBe('Manifest');
    expect(serialized.id).toBe(manifest.id);
    expect(Object.keys(normalized.entities.Scene).length).toBe(120);
    expect(elapsed).toBeLessThan(20000);
  });
});
