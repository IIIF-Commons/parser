import {
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import {
	normalize,
	serialize,
	serializeConfigPresentation4,
} from "../dist/presentation-4.js";

const fixturesRoot = resolve(process.cwd(), "fixtures");
const outputRoot = resolve(fixturesRoot, "3-to-4-converted");
const excludedTopLevel = new Set([
	"3-to-4-converted",
	"presentation-4",
	"cookbook-v4",
	"stores",
]);

function toPosixPath(value) {
	return value.split("\\").join("/");
}

function walkJsonFiles(dir) {
	const entries = readdirSync(dir).sort();
	const files = [];

	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stats = statSync(fullPath);

		if (stats.isDirectory()) {
			files.push(...walkJsonFiles(fullPath));
			continue;
		}

		if (stats.isFile() && entry.endsWith(".json")) {
			files.push(fullPath);
		}
	}

	return files;
}

function isPresentation3Manifest(resource) {
	if (
		!resource ||
		typeof resource !== "object" ||
		resource.type !== "Manifest"
	) {
		return false;
	}

	const context = resource["@context"];
	const hasV3Context = (value) =>
		typeof value === "string" &&
		(value.includes("/presentation/3/") ||
			value === "http://iiif.io/api/presentation/3/context.json");

	if (hasV3Context(context)) {
		return true;
	}

	if (Array.isArray(context)) {
		return context.some(hasV3Context);
	}

	return false;
}

function sanitizeConvertedManifest(resource, isTopLevel = true) {
	if (Array.isArray(resource)) {
		return resource.map((item) => sanitizeConvertedManifest(item, false));
	}

	if (!resource || typeof resource !== "object") {
		return resource;
	}

	if (!isTopLevel && Object.hasOwn(resource, "@context")) {
		delete resource["@context"];
	}

	if (
		resource.type === "SpecificResource" &&
		Array.isArray(resource.source) &&
		resource.source.length === 1
	) {
		resource.source = resource.source[0];
	}

	for (const [key, value] of Object.entries(resource)) {
		resource[key] = sanitizeConvertedManifest(value, false);
	}

	return resource;
}

function patchCookbook0015StartDimensions(resource) {
	if (Array.isArray(resource)) {
		for (const item of resource) {
			patchCookbook0015StartDimensions(item);
		}
		return;
	}

	if (!resource || typeof resource !== "object") {
		return;
	}

	if (resource.type === "Canvas") {
		if (typeof resource.width !== "number" || resource.width <= 0) {
			resource.width = 640;
		}
		if (typeof resource.height !== "number" || resource.height <= 0) {
			resource.height = 360;
		}
	}

	for (const nested of Object.values(resource)) {
		patchCookbook0015StartDimensions(nested);
	}
}

function applyFixturePatches(relativeFixturePath, convertedManifest) {
	if (relativeFixturePath !== "cookbook/0015-start.json") {
		return convertedManifest;
	}

	// Cookbook recipe 0015-start is video-only and requires a concrete Canvas size
	// for downstream P4 validation. Preserve expected dimensions as 640x360.
	patchCookbook0015StartDimensions(convertedManifest);
	return convertedManifest;
}

function main() {
	rmSync(outputRoot, { recursive: true, force: true });
	mkdirSync(outputRoot, { recursive: true });

	const sourceFiles = walkJsonFiles(fixturesRoot).filter((filePath) => {
		const rel = toPosixPath(relative(fixturesRoot, filePath));
		const [topLevel] = rel.split("/");
		return !excludedTopLevel.has(topLevel);
	});

	const converted = [];
	const skipped = [];

	for (const sourceFile of sourceFiles) {
		const inputText = readFileSync(sourceFile, "utf8");
		let inputJson;

		try {
			inputJson = JSON.parse(inputText);
		} catch {
			continue;
		}

		if (!isPresentation3Manifest(inputJson)) {
			continue;
		}

		try {
			const normalized = normalize(inputJson);
			const upgraded = serialize(
				{
					mapping: normalized.mapping,
					entities: normalized.entities,
					requests: {},
				},
				normalized.resource,
				serializeConfigPresentation4,
			);
			const cleaned = sanitizeConvertedManifest(upgraded, true);
			const rel = toPosixPath(relative(fixturesRoot, sourceFile));
			const patched = applyFixturePatches(rel, cleaned);
			const destination = join(outputRoot, rel);

			mkdirSync(dirname(destination), { recursive: true });
			writeFileSync(destination, `${JSON.stringify(patched, null, 2)}\n`);
			converted.push(toPosixPath(relative(outputRoot, destination)));
		} catch (error) {
			const rel = toPosixPath(relative(fixturesRoot, sourceFile));
			const reason = error instanceof Error ? error.message : String(error);
			skipped.push({ fixture: rel, reason });
			console.warn(`Skipping ${rel}: ${reason}`);
		}
	}

	converted.sort();
	writeFileSync(
		join(outputRoot, "_index.json"),
		`${JSON.stringify(converted, null, 2)}\n`,
	);

	console.log(
		`Converted ${converted.length} P3 manifests to ${toPosixPath(relative(process.cwd(), outputRoot))}`,
	);
	if (skipped.length) {
		console.log(`Skipped ${skipped.length} manifests during conversion`);
		writeFileSync(
			join(outputRoot, "_skipped.json"),
			`${JSON.stringify(skipped, null, 2)}\n`,
		);
	}
}

main();
