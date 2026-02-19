import { defineConfig } from "tsdown";

export default defineConfig({
  target: ["node22"],
  format: ["esm"],
  platform: "node",
  clean: false,
  inlineOnly: false,
  entry: {
    cli: "src/cli.ts",
  },
  dts: false,
  minify: false,
});
