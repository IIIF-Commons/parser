import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const repository = dirname(dirname(fileURLToPath(import.meta.url)));
const temporaryDirectory = mkdtempSync(join(tmpdir(), "iiif-parser-types-"));
const packageDirectory = join(temporaryDirectory, "package");
const packedDirectory = join(temporaryDirectory, "packed");
const compiler = createRequire(import.meta.url).resolve("typescript/bin/tsc");

const imports = [
  "@iiif/parser",
  "@iiif/parser/presentation-2",
  "@iiif/parser/presentation-2/types",
  "@iiif/parser/presentation-3",
  "@iiif/parser/presentation-3/types",
  "@iiif/parser/presentation-3-normalized",
  "@iiif/parser/presentation-3-normalized/types",
  "@iiif/parser/presentation-4",
  "@iiif/parser/presentation-4/types",
  "@iiif/parser/presentation-4/upgrader",
  "@iiif/parser/presentation-4/validator",
  "@iiif/parser/presentation-4-normalized",
  "@iiif/parser/presentation-4-normalized/types",
  "@iiif/parser/strict",
  "@iiif/parser/image-3",
  "@iiif/parser/upgrader",
];

const source = imports.map((specifier, index) => `import type * as Module${index} from "${specifier}";`).join("\n");

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

function typecheck(file, module, moduleResolution) {
  run(
    process.execPath,
    [
      compiler,
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "false",
      "--target",
      "ES2022",
      "--lib",
      "ES2022,DOM,DOM.Iterable",
      "--module",
      module,
      "--moduleResolution",
      moduleResolution,
      file,
    ],
    packageDirectory
  );
}

try {
  mkdirSync(packageDirectory, { recursive: true });
  mkdirSync(packedDirectory, { recursive: true });
  run("pnpm", ["pack", "--pack-destination", packedDirectory], repository);

  const archive = readdirSync(packedDirectory).find((file) => file.endsWith(".tgz"));
  if (!archive) {
    throw new Error("pnpm pack did not create an archive");
  }

  writeFileSync(
    join(packageDirectory, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        "@iiif/parser": `file:${join(packedDirectory, archive)}`,
      },
    })
  );
  writeFileSync(join(packageDirectory, "consumer.ts"), source);
  writeFileSync(join(packageDirectory, "consumer.cts"), source);

  run("pnpm", ["install", "--offline", "--ignore-scripts", "--config.auto-install-peers=false"], packageDirectory);
  typecheck("consumer.ts", "NodeNext", "NodeNext");
  typecheck("consumer.cts", "NodeNext", "NodeNext");
  typecheck("consumer.ts", "ESNext", "Bundler");
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
