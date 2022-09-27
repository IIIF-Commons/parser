/**
 * @param options {{ external: string[]; entry: string; name: string; globalName: string; outDir?: string; react?: boolean }}
 */
export function defineConfig(options) {
  return {
    build: {
      sourcemap: true,
      outDir: options.outDir || `dist/${options.name}`,
      lib: {
        entry: options.entry,
        name: options.globalName,
        formats: options.globalName ? ['es', 'cjs', 'umd'] : ['es', 'cjs'],
        fileName: (format) => {
          if (format === 'umd') {
            return `index.umd.js`;
          }
          if (format === 'es') {
            return `esm/index.mjs`;
          }
          return `${format}/index.js`;
        },
      },
      rollupOptions: {
        external: options.external,
        output: {
          globals: {
            // If any..
          },
        },
      },
    },
  };
}
