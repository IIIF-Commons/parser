import iiifCollection from '../../fixtures/presentation-2/iiif-fixture-collection.json';
import iiifManifest from '../../fixtures/presentation-2/iiif-fixture-manifest.json';
import europeana from '../../fixtures/presentation-2/europeana.json';
import { Traverse } from '../../src/presentation-2';

describe('Presentation 2 Traverse', () => {
  test('traverse simple collection', () => {
    const ids: string[] = [];
    const manifestIds = [];
    const traverse = new Traverse({
      collection: [
        (collection) => {
          ids.push(collection['@id']);
          return collection;
        },
      ],
      manifest: [
        (manifest) => {
          manifestIds.push(manifest['@id']);
          return manifest;
        },
      ],
    });

    traverse.traverseCollection(iiifCollection);

    expect(ids).toEqual(['http://iiif.io/api/presentation/2.1/example/fixtures/collection.json']);
    expect(manifestIds.length).toEqual(55);
  });

  test('traverse simple manifest', () => {
    const ids: any[] = [];
    function trackId(type: string) {
      return (item: any) => {
        ids.push({ id: item['@id'], type });
      };
    }
    const traverse = new Traverse({
      manifest: [trackId('manifest')],
      sequence: [trackId('sequence')],
      canvas: [trackId('canvas')],
      contentResource: [trackId('contentResource')],
      annotation: [trackId('annotation')],
    });

    traverse.traverseManifest(iiifManifest);

    expect(ids).toEqual([
      {
        id: 'http://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png',
        type: 'contentResource',
      },
      {
        // No id, but it traversed it.
        type: 'annotation',
      },
      {
        id: 'http://iiif.io/api/presentation/2.1/example/fixtures/canvas/1/c1.json',
        type: 'canvas',
      },
      {
        // No id, but it traversed it.
        type: 'sequence',
      },
      {
        id: 'http://iiif.io/api/presentation/2.1/example/fixtures/1/manifest.json',
        type: 'manifest',
      },
    ]);
  });

  test('bug: cannot find other content', () => {
    const ids: any[] = [];
    function trackId(type: string) {
      return (item: any) => {
        ids.push({ id: item['@id'], type });
      };
    }
    const traverse = new Traverse({
      annotationList: [trackId('annotationList')],
    });

    traverse.traverseCanvas(europeana as any);

    expect(ids).toEqual([
      {
        id: 'https://iiif.europeana.eu/presentation/9200396/BibliographicResource_3000118436165/annopage/21',
        type: 'annotationList',
      },
    ]);
  });
});
