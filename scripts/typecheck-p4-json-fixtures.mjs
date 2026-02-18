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
import { isAbsolute, join, relative, resolve } from "node:path";

const repoRoot = process.cwd();
const fixturesRoot = resolve(repoRoot, "fixtures");
const authoredFixtureDirs = [
	resolve(fixturesRoot, "presentation-4"),
	resolve(fixturesRoot, "cookbook-v4"),
];
const convertedRoot = resolve(fixturesRoot, "3-to-4-converted");
const convertedIndexFile = resolve(convertedRoot, "_index.json");
const tempTypecheckDir = resolve(
	repoRoot,
	".build",
	"typecheck-p4-json-fixtures",
);
const tempTypecheckCasesDir = resolve(tempTypecheckDir, "cases");
const tempTsconfigFile = resolve(tempTypecheckDir, "tsconfig.json");

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
				throw new Error(
					'Invalid --scope value. Use "all", "authored", or "converted"',
				);
			}
			scope = value;
			i += 1;
			continue;
		}
		if (arg === "--report-only") {
			reportOnly = true;
			continue;
		}
		throw new Error(`Unknown argument: ${arg}`);
	}

	return { help: false, file, scope, reportOnly };
}

function printHelp() {
	console.log("Usage:");
	console.log("  node scripts/typecheck-p4-json-fixtures.mjs");
	console.log(
		"  node scripts/typecheck-p4-json-fixtures.mjs --file <path-to-json>",
	);
	console.log(
		"  node scripts/typecheck-p4-json-fixtures.mjs --scope <all|authored|converted> [--report-only]",
	);
	console.log("");
	console.log("Modes:");
	console.log("  all (default): pass/fail summary plus failing fixture paths");
	console.log(
		"  single file (--file): check one fixture and print focused diagnostics",
	);
	console.log("");
	console.log("Scopes:");
	console.log("  all: authored + converted fixtures");
	console.log("  authored: fixtures/presentation-4 + fixtures/cookbook-v4");
	console.log("  converted: fixtures/3-to-4-converted from _index.json");
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
		throw new Error(
			"fixtures/3-to-4-converted/_index.json must be an array of relative JSON paths",
		);
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
		throw new Error(
			`Fixture is not a Manifest (type=${JSON.stringify(json.type)}): ${toDisplayPath(filePath)}`,
		);
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

	const uniqueFiles = [
		...new Set(discoveredFiles.map((value) => resolve(value))),
	].sort();
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

function createCaseSource(caseDir, fixturePath, fixtureJson) {
	const typesImport = toModuleSpecifier(
		caseDir,
		resolve(repoRoot, "src", "presentation-4", "types"),
	);
	const fixtureLabel = toPosixPath(relative(fixturesRoot, fixturePath));

	return [
		"// Generated at runtime by scripts/typecheck-p4-json-fixtures.mjs",
		`import type { Manifest as Manifest4 } from ${JSON.stringify(typesImport)};`,
		"",
		`// Fixture: ${fixtureLabel}`,
		`const manifest = ${toObjectLiteral(fixtureJson)} satisfies Manifest4;`,
		"",
		"export default manifest;",
		"",
	].join("\n");
}

function createTypecheckTsconfig() {
	const extendsPath = toModuleSpecifier(
		tempTypecheckDir,
		resolve(repoRoot, "tsconfig.json"),
	);
	return JSON.stringify(
		{
			extends: extendsPath,
			include: ["./cases/**/*.ts"],
			compilerOptions: {
				noEmit: true,
			},
		},
		null,
		2,
	);
}

function writeCaseFiles(manifestFixtures) {
	mkdirSync(tempTypecheckCasesDir, { recursive: true });
	const caseMappings = [];

	for (let index = 0; index < manifestFixtures.length; index += 1) {
		const { filePath, json } = manifestFixtures[index];
		const caseBaseName = toCaseFileName(filePath, index);
		const caseFilePath = resolve(
			tempTypecheckCasesDir,
			`${caseBaseName}.typecheck.ts`,
		);
		writeFileSync(
			caseFilePath,
			createCaseSource(tempTypecheckCasesDir, filePath, json),
		);
		caseMappings.push({
			fixturePath: filePath,
			caseFilePath,
		});
	}

	return caseMappings;
}

function runTypecheck() {
	const tsconfigPathFromRoot = toPosixPath(
		relative(repoRoot, tempTsconfigFile),
	);
	const outputFile = resolve(tempTypecheckDir, "tsc-output.txt");
	const outputFd = openSync(outputFile, "w");
	const result = spawnSync(
		"pnpm",
		["exec", "tsc", "--pretty", "false", "-p", tsconfigPathFromRoot],
		{
			cwd: repoRoot,
			shell: process.platform === "win32",
			stdio: ["ignore", outputFd, outputFd],
		},
	);
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
		const absolutePath = isAbsolute(rawPath)
			? resolve(rawPath)
			: resolve(repoRoot, rawPath);
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
		throw new Error(
			`No Presentation 4 Manifest fixtures found to typecheck for scope "${options.scope}"`,
		);
	}

	mkdirSync(tempTypecheckDir, { recursive: true });
	const caseMappings = writeCaseFiles(manifestFixtures);
	writeFileSync(tempTsconfigFile, createTypecheckTsconfig());
	let exitCode = 0;

	try {
		const result = runTypecheck();
		if (result.status === 0) {
			console.log(
				`PASS ${manifestFixtures.length}/${manifestFixtures.length} (scope=${options.scope})`,
			);
			return exitCode;
		}

		const mappingByCase = new Map(
			caseMappings.map((item) => [
				resolve(item.caseFilePath),
				item.fixturePath,
			]),
		);
		const failedCasePaths = extractFailedCasePaths(result.output);
		const failedFixturePaths = [
			...new Set(
				[...failedCasePaths]
					.map((casePath) => mappingByCase.get(resolve(casePath)))
					.filter((value) => typeof value === "string"),
			),
		].sort();

		const failedCount = failedFixturePaths.length;
		const passCount = manifestFixtures.length - failedCount;
		const statusLabel = options.reportOnly ? "SOFT FAIL" : "FAIL";
		console.error(
			`${statusLabel} ${passCount}/${manifestFixtures.length} (scope=${options.scope})`,
		);
		for (const fixturePath of failedFixturePaths) {
			console.error(`- ${toDisplayPath(fixturePath)}`);
		}

		if (failedFixturePaths.length === 0) {
			console.error("- Unable to map diagnostics to fixture files");
		}
		exitCode = options.reportOnly ? 0 : 1;
	} finally {
		rmSync(tempTypecheckDir, { recursive: true, force: true });
	}

	return exitCode;
}

function runSingleFileMode(fileArg) {
	const fixturePath = resolveFixturePath(fileArg);
	const manifestFixture = readManifestFixture(fixturePath);

	mkdirSync(tempTypecheckDir, { recursive: true });
	const caseMappings = writeCaseFiles([manifestFixture]);
	writeFileSync(tempTsconfigFile, createTypecheckTsconfig());
	let exitCode = 0;

	try {
		const result = runTypecheck();
		if (result.status === 0) {
			console.log(`PASS ${toDisplayPath(fixturePath)}`);
			return exitCode;
		}

		console.error(`FAIL ${toDisplayPath(fixturePath)}`);
		const rewrittenOutput = rewriteOutputPaths(
			result.output,
			caseMappings,
		).trim();
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
		process.exit(runSingleFileMode(args.file));
	}

	process.exit(runAllMode({ scope: args.scope, reportOnly: args.reportOnly }));
}

try {
	main();
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
}
