import { defineConfig } from './base-config.mjs';
import { build } from 'vite';
import chalk from 'chalk';

(async () => {
  // Main UMD build.
  buildMsg('UMD + bundle');
  await build(
    defineConfig({
      entry: `src/index.umd.ts`,
      name: 'index',
      outDir: 'dist',
      globalName: 'IIIFParser',
      external: [],
    })
  );

  buildMsg('@iiif/parser + @iiif/parser/presentation-3');
  await build(
    defineConfig({
      entry: './src/index.ts',
      name: 'presentation-3',
    })
  );

  buildMsg('@iiif/parser/presentation-2');
  await build(
    defineConfig({
      entry: './src/presentation-2/index.ts',
      name: 'presentation-2',
    })
  );

  buildMsg('@iiif/parser/upgrader');
  await build(
    defineConfig({
      entry: './src/upgrader.ts',
      name: 'upgrader',
    })
  );

  console.log('');

  function buildMsg(name) {
    console.log(chalk.grey(`\n\nBuilding ${chalk.blue(name)}\n`));
  }
})();
