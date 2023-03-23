import cookbookIndex from '../../fixtures/cookbook/_index.json';
import { promises } from 'node:fs';
import { cwd } from 'node:process';
import { join } from 'path';
const { readFile } = promises;
import { normalize, serialize, serializeConfigPresentation3 } from '../../src';

const prWaitingForMerge: string[] = [
  // '0219-using-caption-file', // https://github.com/IIIF/cookbook-recipes/pull/340
];

describe('Cookbook', function () {
  const tests = Object.values(cookbookIndex)
    .filter((item: any) => prWaitingForMerge.indexOf(item.id) === -1)
    .map((item) => [item.id, item.url]);

  test.each(tests)('Testing normalize %p (%p)', async (id, url) => {
    const json = await readFile(join(cwd(), 'fixtures/cookbook', `${id}.json`));
    const jsonString = json.toString();
    const manifest = JSON.parse(jsonString);
    const original = JSON.parse(jsonString);
    const result = normalize(manifest);
    expect(result).toMatchSnapshot();

    const reserialized = serialize(
      {
        mapping: result.mapping,
        entities: result.entities,
        requests: {},
      },
      result.resource,
      serializeConfigPresentation3
    );
    expect(reserialized).toMatchSnapshot();

    expect(reserialized).toEqual(original);

    // Immutability:
    // expect(manifest).toEqual(original);
  });
});
