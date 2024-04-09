import { defineConfig, type Options } from 'tsup';

export default defineConfig((options: Options) => ({
  dts: true,
  target: ['es2020'],
  format: ['esm', 'cjs', 'iife'],
  platform: 'browser',
  entry: {
    index: 'src/index.ts',
    'image-3': 'src/image-3/index.ts',
    'presentation-2': 'src/presentation-2/index.ts',
    'presentation-3': 'src/presentation-3/index.ts',
    upgrader: 'src/upgrader.ts',
    strict: 'src/presentation-3//strict-upgrade.ts',
  },
  minify: true,
  external: [],
  globalName: 'IIIFParser',
  ...options,
}));
