import { defineConfig, type Options } from 'tsdown';

export default defineConfig({
  dts: true,
  target: ['es2020'],
  format: ['esm', 'cjs'],
  platform: 'browser',
  entry: {
    index: 'src/index.ts',
    'image-3': 'src/image-3/index.ts',
    'presentation-2': 'src/presentation-2/index.ts',
    'presentation-2/types': 'src/presentation-2/types/index.ts',
    'presentation-3': 'src/presentation-3/index.ts',
    'presentation-3/types': 'src/presentation-3/types/index.ts',
    'presentation-3-normalized': 'src/presentation-3-normalized/index.ts',
    'presentation-3-normalized/types': 'src/presentation-3-normalized/types/index.ts',
    'presentation-4': 'src/presentation-4/index.ts',
    'presentation-4/types': 'src/presentation-4/types/index.ts',
    'presentation-4-normalized': 'src/presentation-4-normalized/index.ts',
    'presentation-4-normalized/types': 'src/presentation-4-normalized/types/index.ts',
    upgrader: 'src/upgrader.ts',
    strict: 'src/presentation-3/strict-upgrade.ts',
  },
  minify: true,
  external: [],
  globalName: 'IIIFParser',
});
