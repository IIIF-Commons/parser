import { serialize, serializeConfigPresentation3 } from '../../src';
import { expect } from 'vitest';

describe('store errors', () => {
  test('Wellcome store error', async () => {
    const store = await import('../../fixtures/stores/wellcome-error.json');

    const serialized = serialize(
      {
        mapping: store.iiif.mapping,
        entities: store.iiif.entities,
        requests: {},
      },
      {
        id: 'https://iiif.wellcomecollection.org/presentation/b12024673',
        type: 'Manifest',
      },
      serializeConfigPresentation3
    );

    expect(serialized).toHaveProperty('type');
    expect(serialized).toHaveProperty('id');
    expect((serialized as any).id).toMatchInlineSnapshot(
      '"https://iiif.wellcomecollection.org/presentation/b12024673"'
    );
  });
  test('Delft collection store error', async () => {
    const store = await import('../../fixtures/stores/delft-collection-store.json');

    const serialized = serialize(
      {
        mapping: store.iiif.mapping,
        entities: store.iiif.entities,
        requests: {},
      },
      {
        id: 'https://delft-static-site-generator.netlify.com/collections/lib-tr-universiteitsgeschiedenis',
        type: 'Collection',
      },
      serializeConfigPresentation3
    );

    expect(serialized).toHaveProperty('type');
    expect(serialized).toHaveProperty('id');
    expect((serialized as any)).toMatchInlineSnapshot(
      
    `
      {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "id": "https://delft-static-site-generator.netlify.com/collections/lib-tr-universiteitsgeschiedenis",
        "label": {
          "en": [
            "History of the university",
          ],
          "nl": [
            "Universiteitsgeschiedenis",
          ],
        },
        "metadata": [
          {
            "label": {
              "none": [
                "",
              ],
            },
            "value": {
              "none": [
                "",
              ],
            },
          },
        ],
        "summary": {
          "en": [
            "Digitised books about the history of Delft University of Technology, from TU Delft Library's Special Collections",
          ],
          "nl": [
            "Gedigitaliseerde boeken over de geschiedenis van de TU Delft, afkomstig uit de Bijzondere Collecties van de TU Delft Library",
          ],
        },
        "type": "Collection",
      }
    `);
  });
});
