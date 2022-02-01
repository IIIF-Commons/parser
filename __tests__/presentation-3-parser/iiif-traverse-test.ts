import { Traverse } from '../../src/presentation-3';
import { Canvas, Manifest } from '@iiif/presentation-3';

describe('utility/iiif-traverse', () => {
  const manifest = (): Manifest => ({
    '@context': ['http://www.w3.org/ns/anno.jsonld', 'http://iiif.io/api/presentation/{{ page.major }}/context.json'],
    id: 'https://example.org/iiif/book1/manifest',
    type: 'Manifest',
    label: { en: ['Image 1'] },
    items: [
      {
        id: 'https://example.org/iiif/book1/canvas/p1',
        type: 'Canvas',
        height: 1800,
        width: 1200,
        items: [
          {
            id: 'https://example.org/iiif/book1/page/p1/1',
            type: 'AnnotationPage',
            items: [
              {
                id: 'https://example.org/iiif/book1/annotation/p0001-image',
                type: 'Annotation',
                motivation: 'painting',
                body: {
                  id: 'http://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png',
                  type: 'Image',
                  format: 'image/png',
                  height: 1800,
                  width: 1200,
                },
                target: 'https://example.org/iiif/book1/canvas/p1',
              },
            ],
          },
        ],
      },
    ],
  });

  test('it can traverse simple manifest', () => {
    const canvasList: string[] = [];
    const annotationList: string[] = [];
    const traversal = new Traverse({
      canvas: [
        (currentCanvas) => {
          canvasList.push(currentCanvas.id);
          return currentCanvas;
        },
      ],
      annotation: [
        (currentAnnotation) => {
          annotationList.push(currentAnnotation.id);
          return currentAnnotation;
        },
      ],
    });

    traversal.traverseManifest(manifest());

    expect(canvasList).toEqual(['https://example.org/iiif/book1/canvas/p1']);
    expect(annotationList).toEqual(['https://example.org/iiif/book1/annotation/p0001-image']);
  });

  test('it can deference manifests canvases', () => {
    const canvasMap: { [id: string]: Canvas } = {};
    const traversal = new Traverse({
      canvas: [
        (currentCanvas) => {
          canvasMap[currentCanvas.id] = currentCanvas;
          return { id: currentCanvas.id, type: 'Canvas' };
        },
      ],
    });

    const newManifest = traversal.traverseManifest(manifest());

    expect(newManifest.items).toEqual([
      {
        id: 'https://example.org/iiif/book1/canvas/p1',
        type: 'Canvas',
      },
    ]);
  });

  it('it can do a hack-job normalize', () => {
    const store: any = {};
    const traversal = Traverse.all((resource: any): any => {
      if (resource.id && resource.type) {
        store[resource.type] = store[resource.type] ? store[resource.type] : {};
        store[resource.type][resource.id] = store[resource.type][resource.id]
          ? {
              ...store[resource.type][resource.id],
              ...resource,
            }
          : Object.assign({}, resource);
        return { id: resource.id, type: resource.type };
      }
      return resource;
    });

    const result = traversal.traverseManifest(manifest());

    expect(store).toEqual({
      Annotation: {
        'https://example.org/iiif/book1/annotation/p0001-image': {
          body: {
            id: 'http://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png',
            type: 'Image',
          },
          id: 'https://example.org/iiif/book1/annotation/p0001-image',
          motivation: 'painting',
          target: 'https://example.org/iiif/book1/canvas/p1',
          type: 'Annotation',
        },
      },
      AnnotationPage: {
        'https://example.org/iiif/book1/page/p1/1': {
          id: 'https://example.org/iiif/book1/page/p1/1',
          items: [
            {
              id: 'https://example.org/iiif/book1/annotation/p0001-image',
              type: 'Annotation',
            },
          ],
          type: 'AnnotationPage',
        },
      },
      Canvas: {
        'https://example.org/iiif/book1/canvas/p1': {
          height: 1800,
          id: 'https://example.org/iiif/book1/canvas/p1',
          items: [
            {
              id: 'https://example.org/iiif/book1/page/p1/1',
              type: 'AnnotationPage',
            },
          ],
          type: 'Canvas',
          width: 1200,
        },
      },
      Image: {
        'http://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png': {
          format: 'image/png',
          height: 1800,
          id: 'http://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png',
          type: 'Image',
          width: 1200,
        },
      },
      Manifest: {
        'https://example.org/iiif/book1/manifest': {
          '@context': [
            'http://www.w3.org/ns/anno.jsonld',
            'http://iiif.io/api/presentation/{{ page.major }}/context.json',
          ],
          id: 'https://example.org/iiif/book1/manifest',
          items: [{ id: 'https://example.org/iiif/book1/canvas/p1', type: 'Canvas' }],
          label: { en: ['Image 1'] },
          type: 'Manifest',
        },
      },
    });
    expect(result).toEqual({
      id: 'https://example.org/iiif/book1/manifest',
      type: 'Manifest',
    });
  });

  test('it can traverse all', () => {
    const ids: string[] = [];
    const traversal = Traverse.all((resource: any): any => {
      if (resource.id) {
        ids.push(resource.id);
      }
      return resource;
    });

    traversal.traverseManifest(manifest());

    expect(ids).toEqual([
      'http://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png',
      'https://example.org/iiif/book1/annotation/p0001-image',
      'https://example.org/iiif/book1/page/p1/1',
      'https://example.org/iiif/book1/canvas/p1',
      'https://example.org/iiif/book1/manifest',
    ]);
  });
});
