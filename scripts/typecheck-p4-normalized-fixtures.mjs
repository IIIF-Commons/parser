import { spawnSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { isAbsolute, join, relative, resolve } from "node:path";

const repoRoot = process.cwd();
const fixturesRoot = resolve(repoRoot, "fixtures");
const authoredFixtureDirs = [resolve(fixturesRoot, "presentation-4"), resolve(fixturesRoot, "cookbook-v4")];
const convertedRoot = resolve(fixturesRoot, "3-to-4-converted");
const convertedIndexFile = resolve(convertedRoot, "_index.json");
const tempTypecheckDir = resolve(
  repoRoot,
  ".build",
  "typecheck-p4-normalized-fixtures",
  `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
);
const tempTypecheckCasesDir = resolve(tempTypecheckDir, "cases");
const tempTsconfigFile = resolve(tempTypecheckDir, "tsconfig.json");
const presentation4DistCjs = resolve(repoRoot, "dist", "presentation-4.cjs");

function toPosixPath(value) {
  return value.split("\\").join("/");
}

function toModuleSpecifier(fromDir, targetPath) {
  const relPath = toPosixPath(relative(fromDir, targetPath));
  return relPath.startsWith(".") ? relPath : `./${relPath}`;
}

function toDisplayPath(filePath) {
  return toPosixPath(relative(repoRoot, filePath));
}

function parseArgs(argv) {
  let file = null;
  let scope = "all";
  let reportOnly = false;
  let canvasLimit = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      return { help: true, file: null };
    }
    if (arg === "--file" || arg === "-f") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --file");
      }
      file = value;
      i += 1;
      continue;
    }
    if (arg === "--scope") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --scope");
      }
      if (value !== "all" && value !== "authored" && value !== "converted") {
        throw new Error('Invalid --scope value. Use "all", "authored", or "converted"');
      }
      scope = value;
      i += 1;
      continue;
    }
    if (arg === "--canvas-limit") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --canvas-limit");
      }
      const parsed = Number.parseInt(value, 10);
      if (!Number.isInteger(parsed) || parsed < 0) {
        throw new Error("--canvas-limit must be a non-negative integer");
      }
      canvasLimit = parsed;
      i += 1;
      continue;
    }
    if (arg === "--report-only") {
      reportOnly = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { help: false, file, scope, reportOnly, canvasLimit };
}

function printHelp() {
  console.log("Usage:");
  console.log("  node scripts/typecheck-p4-normalized-fixtures.mjs");
  console.log("  node scripts/typecheck-p4-normalized-fixtures.mjs --file <path-to-json>");
  console.log(
    "  node scripts/typecheck-p4-normalized-fixtures.mjs --scope <all|authored|converted> [--report-only] [--canvas-limit <n>]"
  );
  console.log("");
  console.log("Modes:");
  console.log("  all (default): pass/fail summary plus failing fixture paths");
  console.log("  single file (--file): check one fixture and print focused diagnostics");
  console.log("");
  console.log("Scopes:");
  console.log("  all: authored + converted fixtures");
  console.log("  authored: fixtures/presentation-4 + fixtures/cookbook-v4");
  console.log("  converted: fixtures/3-to-4-converted from _index.json");
  console.log("");
  console.log("Options:");
  console.log(
    "  --canvas-limit <n>: keep only the first n Canvas entities in normalized output before typecheck (for drill-down/perf)"
  );
  console.log("  (normalization runtime is loaded from dist/presentation-4.cjs; run pnpm run build if needed)");
}

function walkJsonFiles(dirPath) {
  const files = [];
  for (const entry of readdirSync(dirPath).sort()) {
    const fullPath = join(dirPath, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walkJsonFiles(fullPath));
      continue;
    }
    if (stats.isFile() && entry.endsWith(".json") && entry !== "_index.json") {
      files.push(fullPath);
    }
  }
  return files;
}

function getConvertedFixtureFiles() {
  if (!existsSync(convertedIndexFile)) {
    return [];
  }
  const indexJson = JSON.parse(readFileSync(convertedIndexFile, "utf8"));
  if (!Array.isArray(indexJson)) {
    throw new Error("fixtures/3-to-4-converted/_index.json must be an array of relative JSON paths");
  }
  return indexJson
    .filter((value) => typeof value === "string" && value.endsWith(".json"))
    .map((value) => resolve(convertedRoot, value));
}

function readManifestFixture(filePath) {
  const json = JSON.parse(readFileSync(filePath, "utf8"));
  if (!json || typeof json !== "object") {
    throw new Error(`Fixture is not a JSON object: ${toDisplayPath(filePath)}`);
  }
  if (json.type !== "Manifest") {
    throw new Error(`Fixture is not a Manifest (type=${JSON.stringify(json.type)}): ${toDisplayPath(filePath)}`);
  }
  return { filePath, json };
}

function getManifestFixtures(scope) {
  const discoveredFiles = [];

  if (scope === "all" || scope === "authored") {
    for (const fixtureDir of authoredFixtureDirs) {
      if (!existsSync(fixtureDir)) {
        continue;
      }
      discoveredFiles.push(...walkJsonFiles(fixtureDir));
    }
  }

  if (scope === "all" || scope === "converted") {
    discoveredFiles.push(...getConvertedFixtureFiles());
  }

  const uniqueFiles = [...new Set(discoveredFiles.map((value) => resolve(value)))].sort();
  return uniqueFiles.map((filePath) => readManifestFixture(filePath));
}

function resolveFixturePath(inputPath) {
  const candidates = [];

  if (isAbsolute(inputPath)) {
    candidates.push(resolve(inputPath));
  } else {
    candidates.push(resolve(repoRoot, inputPath));
    candidates.push(resolve(fixturesRoot, inputPath));
    if (inputPath.startsWith("fixtures/")) {
      candidates.push(resolve(repoRoot, inputPath));
    }
  }

  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return resolve(candidate);
    }
  }

  throw new Error(`Fixture path not found: ${inputPath}`);
}

function toCaseFileName(fixturePath, index) {
  const relativeFixturePath = toPosixPath(relative(fixturesRoot, fixturePath));
  const stem = relativeFixturePath
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
  return `${String(index + 1).padStart(4, "0")}_${stem}`;
}

function toObjectLiteral(value) {
  return JSON.stringify(value, null, 2);
}

function loadNormalize() {
  if (!existsSync(presentation4DistCjs)) {
    throw new Error(
      "dist/presentation-4.cjs not found. Run `pnpm run build` before running normalized fixture typecheck."
    );
  }
  const require = createRequire(import.meta.url);
  const presentation4 = require(presentation4DistCjs);
  if (!presentation4 || typeof presentation4.normalize !== "function") {
    throw new Error("Failed to load normalize() from dist/presentation-4.cjs");
  }
  return presentation4.normalize;
}

const normalizeManifest = loadNormalize();

function applyCanvasLimit(normalizedResult, canvasLimit) {
  if (canvasLimit === null) {
    return normalizedResult;
  }

  if (!normalizedResult || typeof normalizedResult !== "object") {
    return normalizedResult;
  }

  const entities = normalizedResult.entities;
  if (!entities || typeof entities !== "object") {
    return normalizedResult;
  }

  const canvasStore = entities.Canvas;
  if (!canvasStore || typeof canvasStore !== "object") {
    return normalizedResult;
  }

  const canvasIds = Object.keys(canvasStore).sort();
  if (canvasIds.length <= canvasLimit) {
    return normalizedResult;
  }

  const keepCanvasIds = new Set(canvasIds.slice(0, canvasLimit));
  const limitedCanvasStore = {};
  for (const canvasId of keepCanvasIds) {
    limitedCanvasStore[canvasId] = canvasStore[canvasId];
  }

  normalizedResult.entities = {
    ...entities,
    Canvas: limitedCanvasStore,
  };

  if (normalizedResult.mapping && typeof normalizedResult.mapping === "object") {
    const nextMapping = {};
    for (const [id, mappedType] of Object.entries(normalizedResult.mapping)) {
      if (mappedType === "Canvas" && !keepCanvasIds.has(id)) {
        continue;
      }
      nextMapping[id] = mappedType;
    }
    normalizedResult.mapping = nextMapping;
  }

  return normalizedResult;
}

function normalizeFixture(manifestFixture, canvasLimit) {
  const normalized = normalizeManifest(manifestFixture.json);
  if (!normalized || typeof normalized !== "object") {
    throw new Error("normalize() did not return a JSON object");
  }
  if (!normalized.entities || typeof normalized.entities !== "object") {
    throw new Error("normalize() result is missing entities");
  }
  if (!normalized.mapping || typeof normalized.mapping !== "object") {
    throw new Error("normalize() result is missing mapping");
  }
  if (!normalized.resource || typeof normalized.resource !== "object") {
    throw new Error("normalize() result is missing resource reference");
  }

  const normalizedCopy = JSON.parse(JSON.stringify(normalized));
  return {
    filePath: manifestFixture.filePath,
    json: applyCanvasLimit(normalizedCopy, canvasLimit),
  };
}

function createCaseSource(caseDir, fixturePath, normalizedResultJson, canvasLimit) {
  const typesImport = toModuleSpecifier(caseDir, resolve(repoRoot, "src", "presentation-4-normalized", "types"));
  const fixtureLabel = toPosixPath(relative(fixturesRoot, fixturePath));
  const limitComment = canvasLimit === null ? "" : `\n// Canvas limit: ${canvasLimit}`;

  return [
    "// Generated at runtime by scripts/typecheck-p4-normalized-fixtures.mjs",
    `import type { Presentation4NormalizeResult } from ${JSON.stringify(typesImport)};`,
    "",
    `// Fixture: ${fixtureLabel}${limitComment}`,
    `const normalized: Presentation4NormalizeResult = ${toObjectLiteral(normalizedResultJson)};`,
    "",
    "export default normalized;",
    "",
  ].join("\n");
}

function createTypecheckTsconfig() {
  const extendsPath = toModuleSpecifier(tempTypecheckDir, resolve(repoRoot, "tsconfig.json"));
  return JSON.stringify(
    {
      extends: extendsPath,
      include: ["./cases/**/*.ts"],
      compilerOptions: {
        noEmit: true,
      },
    },
    null,
    2
  );
}

function writeCaseFiles(normalizedFixtures, canvasLimit) {
  mkdirSync(tempTypecheckCasesDir, { recursive: true });
  const caseMappings = [];

  for (let index = 0; index < normalizedFixtures.length; index += 1) {
    const { filePath, json } = normalizedFixtures[index];
    const caseBaseName = toCaseFileName(filePath, index);
    const caseFilePath = resolve(tempTypecheckCasesDir, `${caseBaseName}.typecheck.ts`);
    writeFileSync(caseFilePath, createCaseSource(tempTypecheckCasesDir, filePath, json, canvasLimit));
    caseMappings.push({
      fixturePath: filePath,
      caseFilePath,
    });
  }

  return caseMappings;
}

function runTypecheck() {
  const tsconfigPathFromRoot = toPosixPath(relative(repoRoot, tempTsconfigFile));
  const outputFile = resolve(tempTypecheckDir, "tsc-output.txt");
  const outputFd = openSync(outputFile, "w");
  const result = spawnSync("pnpm", ["exec", "tsc", "--pretty", "false", "-p", tsconfigPathFromRoot], {
    cwd: repoRoot,
    shell: process.platform === "win32",
    stdio: ["ignore", outputFd, outputFd],
  });
  closeSync(outputFd);

  if (result.error) {
    throw result.error;
  }

  const output = existsSync(outputFile) ? readFileSync(outputFile, "utf8") : "";

  return {
    status: typeof result.status === "number" ? result.status : 1,
    output,
  };
}

function extractFailedCasePaths(typecheckOutput) {
  const failedPaths = new Set();
  for (const line of typecheckOutput.split(/\r?\n/)) {
    const match = line.match(/^(.*\.typecheck\.ts)\(\d+,\d+\): error\s+/);
    if (!match) {
      continue;
    }
    const rawPath = match[1];
    const absolutePath = isAbsolute(rawPath) ? resolve(rawPath) : resolve(repoRoot, rawPath);
    failedPaths.add(absolutePath);
  }
  return failedPaths;
}

function rewriteOutputPaths(output, mappings) {
  let rewritten = output;
  for (const mapping of mappings) {
    const caseAbs = toPosixPath(mapping.caseFilePath);
    const caseRel = toPosixPath(relative(repoRoot, mapping.caseFilePath));
    const fixtureDisplay = toDisplayPath(mapping.fixturePath);
    rewritten = rewritten.split(caseAbs).join(fixtureDisplay);
    rewritten = rewritten.split(caseRel).join(fixtureDisplay);
  }
  return rewritten;
}

function runAllMode(options) {
  const manifestFixtures = getManifestFixtures(options.scope);
  if (manifestFixtures.length === 0) {
    throw new Error(`No Presentation 4 Manifest fixtures found to typecheck for scope "${options.scope}"`);
  }

  const normalizedFixtures = [];
  const normalizationFailures = [];

  for (const manifestFixture of manifestFixtures) {
    try {
      normalizedFixtures.push(normalizeFixture(manifestFixture, options.canvasLimit));
    } catch (error) {
      normalizationFailures.push({
        fixturePath: manifestFixture.filePath,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  mkdirSync(tempTypecheckDir, { recursive: true });
  let caseMappings = [];
  if (normalizedFixtures.length > 0) {
    caseMappings = writeCaseFiles(normalizedFixtures, options.canvasLimit);
    writeFileSync(tempTsconfigFile, createTypecheckTsconfig());
  }

  let exitCode = 0;

  try {
    let typecheckFailedFixturePaths = [];
    let typecheckOutput = "";
    if (normalizedFixtures.length > 0) {
      const result = runTypecheck();
      typecheckOutput = result.output;
      if (result.status !== 0) {
        const mappingByCase = new Map(caseMappings.map((item) => [resolve(item.caseFilePath), item.fixturePath]));
        const failedCasePaths = extractFailedCasePaths(result.output);
        typecheckFailedFixturePaths = [
          ...new Set(
            [...failedCasePaths]
              .map((casePath) => mappingByCase.get(resolve(casePath)))
              .filter((value) => typeof value === "string")
          ),
        ].sort();
      }
    }

    const allFailedFixturePaths = [
      ...new Set([...typecheckFailedFixturePaths, ...normalizationFailures.map((item) => item.fixturePath)]),
    ].sort();

    const failedCount = allFailedFixturePaths.length;
    const passCount = manifestFixtures.length - failedCount;

    if (failedCount === 0) {
      console.log(`PASS ${manifestFixtures.length}/${manifestFixtures.length} (scope=${options.scope})`);
      return exitCode;
    }

    const statusLabel = options.reportOnly ? "SOFT FAIL" : "FAIL";
    console.error(`${statusLabel} ${passCount}/${manifestFixtures.length} (scope=${options.scope})`);
    for (const fixturePath of allFailedFixturePaths) {
      console.error(`- ${toDisplayPath(fixturePath)}`);
    }

    if (allFailedFixturePaths.length === 0 && typecheckOutput) {
      console.error("- Unable to map diagnostics to fixture files");
    }

    if (normalizationFailures.length) {
      for (const failure of normalizationFailures) {
        console.error(`  ${toDisplayPath(failure.fixturePath)}: ${failure.reason}`);
      }
    }

    exitCode = options.reportOnly ? 0 : 1;
  } finally {
    rmSync(tempTypecheckDir, { recursive: true, force: true });
  }

  return exitCode;
}

function runSingleFileMode(fileArg, options) {
  const fixturePath = resolveFixturePath(fileArg);
  const manifestFixture = readManifestFixture(fixturePath);
  let normalizedFixture;
  try {
    normalizedFixture = normalizeFixture(manifestFixture, options.canvasLimit);
  } catch (error) {
    console.error(`FAIL ${toDisplayPath(fixturePath)}`);
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }

  mkdirSync(tempTypecheckDir, { recursive: true });
  const caseMappings = writeCaseFiles([normalizedFixture], options.canvasLimit);
  writeFileSync(tempTsconfigFile, createTypecheckTsconfig());
  let exitCode = 0;

  try {
    const result = runTypecheck();
    if (result.status === 0) {
      console.log(`PASS ${toDisplayPath(fixturePath)}`);
      return exitCode;
    }

    console.error(`FAIL ${toDisplayPath(fixturePath)}`);
    const rewrittenOutput = rewriteOutputPaths(result.output, caseMappings).trim();
    if (rewrittenOutput) {
      console.error(rewrittenOutput);
    }
    exitCode = 1;
  } finally {
    rmSync(tempTypecheckDir, { recursive: true, force: true });
  }

  return exitCode;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (args.file) {
    process.exit(runSingleFileMode(args.file, args));
  }

  process.exit(
    runAllMode({
      scope: args.scope,
      reportOnly: args.reportOnly,
      canvasLimit: args.canvasLimit,
    })
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
