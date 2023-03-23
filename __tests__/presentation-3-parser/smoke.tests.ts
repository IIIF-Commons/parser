import cookbookIndex from '../../fixtures/cookbook/_index.json';
import { promises } from 'node:fs';
import { cwd } from 'node:process';
import { join } from 'path';
const { readFile, readdir } = promises;
import { normalize, serialize, serializeConfigPresentation2, serializeConfigPresentation3 } from '../../src';
import { expect } from 'vitest';

const skipThese: string[] = [
  // '0219-using-caption-file', // https://github.com/IIIF/cookbook-recipes/pull/340

  // @todo
  //   - Bad service array
  //   - Strange Image service behaviour (id/type vs @id/@type)
  //   - BUG - annotation.target should have type if it's an annotation.
  'exhibition-1.json',

  // @todo
  //   - Has ImageService3 and ImageService2 with the same identifier :(
  'bodleian.json',
];

describe('Smoke tests', async function () {
  const files = await readdir(join(cwd(), 'fixtures/presentation-3'));
  const twoThreeConverted = await readdir(join(cwd(), 'fixtures/2-to-3-converted'));
  const presentation2 = await readdir(join(cwd(), 'fixtures/presentation-2'));

  const tests = files.filter((item: string) => skipThese.indexOf(item) === -1).map((item) => [item]);
  const twoThreeConvertedTests = twoThreeConverted
    .filter((item: string) => item.endsWith('.json') && skipThese.indexOf(item) === -1)
    .map((item) => [item]);
  const presentation2Tests = presentation2
    .filter((item: string) => item.endsWith('.json') && skipThese.indexOf(item) === -1)
    .map((item) => [item]);

  test.each(tests)('Smoke test: ./fixtures/presentation-3/%s', async (id) => {
    const json = await readFile(join(cwd(), 'fixtures/presentation-3', `${id}`));
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

    expect(reserialized).toEqual(original);

    // Immutability:
    // expect(manifest).toEqual(original);
  });
  test.each(twoThreeConvertedTests)('Smoke test: ./fixtures/2-to-3-converted/%s', async (id) => {
    const json = await readFile(join(cwd(), 'fixtures/2-to-3-converted', `${id}`));
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

    expect(reserialized).toEqual(original);

    // Immutability:
    // expect(manifest).toEqual(original);
  });

  // @todo these are skipped because the presentation 2 serialiser is "good enough" but not good.
  test.skip.each(presentation2Tests)('Smoke test: ./fixtures/presentation-2/%s', async (id) => {
    const json = await readFile(join(cwd(), 'fixtures/presentation-2', `${id}`));
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
      serializeConfigPresentation2
    );

    expect(reserialized).toMatchSnapshot();

    expect(reserialized).toEqual(original);

    // Immutability:
    // expect(manifest).toEqual(original);
  });
});
