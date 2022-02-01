import { createRollupConfig, createTypeConfig } from 'rollup-library-template';

const baseConfig = {
    filesize: true,
    minify: true,
};

// Roll up configs
export default [
    createTypeConfig({
        source: './.build/types/index.d.ts'
    }),
    createTypeConfig({
        source: './.build/types/presentation-2/index.d.ts',
        dist: './dist/presentation-2/index.d.ts',
    }),
    createTypeConfig({
        source: './.build/types/upgrader.d.ts',
        dist: './dist/upgrader/index.d.ts',
    }),

    // UMD bundle will have everything.
    createRollupConfig({
        ...baseConfig,
        inlineDynamicImports: true,
        input: './src/index.umd.ts',
        distPreset: 'umd',
        distOptions: {
            globalName: 'IIIFParser',
            globals: {}
        },
    }),

    // import {} from '@iiif/parser';
    // import {} from '@iiif/parser/presentation-3';
    createRollupConfig({
        ...baseConfig,
        input: './src/index.ts',
        distPreset: 'esm',
    }),
    createRollupConfig({
        ...baseConfig,
        input: './src/index.ts',
        distPreset: 'cjs',
    }),

    // import {} from '@iiif/parser/presentation-2';
    createRollupConfig({
        ...baseConfig,
        dist: 'dist/presentation-2',
        input: './src/presentation-2/index.ts',
        distPreset: 'esm',
    }),
    createRollupConfig({
        ...baseConfig,
        dist: 'dist/presentation-2',
        input: './src/presentation-2/index.ts',
        distPreset: 'cjs',
    }),

    // Standalone upgrader
    createRollupConfig({
        ...baseConfig,
        inlineDynamicImports: true,
        input: './src/upgrader.ts',
        distPreset: 'umd',
        dist: 'dist/upgrader',
        distOptions: {
            globalName: 'IIIFUpgrader',
            globals: {}
        },
        extra: {
            treeshake: true,
        }
    }),

    // Standalone validator
    createRollupConfig({
        ...baseConfig,
        inlineDynamicImports: true,
        input: './src/presentation-3/validator/index.ts',
        distPreset: 'umd',
        dist: 'dist/presentation-3/validator',
        distOptions: {
            globalName: 'IIIFValidator',
            globals: {}
        },
        extra: {
            treeshake: true,
        }
    }),
];
