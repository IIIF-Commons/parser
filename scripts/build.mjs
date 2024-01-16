import { defineConfig } from './base-config.mjs';
import { build } from 'vite';
import chalk from 'chalk';
import { execa } from 'execa';

(async () => {
  const DIST = 'dist';

  // Main UMD build.
  buildMsg('UMD');
  await build(
    defineConfig({
      entry: `src/index.umd.ts`,
      name: 'index',
      outDir: DIST,
      globalName: 'IIIFParser',
    })
  );

  buildMsg('@iiif/parser/presentation-3');
  await build(
    defineConfig({
      entry: `src/index.ts`,
      name: 'index',
      outDir: `${DIST}/bundle`,
    })
  );

  buildMsg('@iiif/parser/presentation-2');
  await build(
    defineConfig({
      entry: './src/presentation-2/index.ts',
      name: 'index',
      outDir: `${DIST}/presentation-2`,
    })
  );

  buildMsg('@iiif/parser/strict');
  await build(
    defineConfig({
      entry: './src/presentation-3/strict-upgrade.ts',
      name: 'index',
      outDir: `${DIST}/strict`,
    })
  );
  buildMsg('@iiif/parser/image-3');
  await build(
    defineConfig({
      entry: './src/image-3/index.ts',
      name: 'index',
      outDir: `${DIST}/image-3`,
    })
  );

  buildMsg('@iiif/parser/upgrader');
  await build(
    defineConfig({
      entry: `src/upgrader.ts`,
      name: 'index',
      outDir: `${DIST}/upgrader`,
      globalName: 'IIIFUpgrader',
    })
  );

  buildMsg('Types');

  listItem('@iiif/parser');
  await execa('./node_modules/.bin/dts-bundle-generator', [`--out-file=${DIST}/index.d.ts`, './src/index.ts']);

  listItem('@iiif/parser/presentation-2');
  await execa('./node_modules/.bin/dts-bundle-generator', [
    `--out-file=${DIST}/presentation-2/index.d.ts`,
    './src/presentation-2/index.ts',
  ]);

  listItem('@iiif/parser/strict');
  await execa('./node_modules/.bin/dts-bundle-generator', [
    `--out-file=${DIST}/strict/index.d.ts`,
    './src/presentation-3/strict-upgrade.ts',
  ]);

  listItem('@iiif/parser/upgrader');
  await execa('./node_modules/.bin/dts-bundle-generator', [
    `--out-file=${DIST}/upgrader/index.d.ts`,
    './src/upgrader.ts',
  ]);

  listItem('@iiif/parser/image-3');
  await execa('./node_modules/.bin/dts-bundle-generator', [
    `--out-file=${DIST}/image-3/index.d.ts`,
    './src/image-3/index.ts',
  ]);

  function buildMsg(name) {
    console.log(chalk.grey(`\n\nBuilding ${chalk.blue(name)}\n`));
  }
  function listItem(name) {
    console.log(chalk.gray(`- ${chalk.green(name)}`));
  }
})();
