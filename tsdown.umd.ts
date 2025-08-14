import { defineConfig, type Options } from 'tsdown';

export default defineConfig({
  dts: true,
  clean: false,
  target: ['es2020'],
  format: ['umd'],
  platform: 'browser',
  entry: {
    index: 'src/index.umd.ts',
  },
  minify: true,
  external: [],
  globalName: 'IIIFParser',
});
