import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { normalize, serialize, serializeConfigPresentation4 } from "../dist/presentation-4.js";

const repoRoot = process.cwd();
const fixtureRoot = resolve(repoRoot, "fixtures");
const fixtureDirs = [resolve(fixtureRoot, "presentation-4"), resolve(fixtureRoot, "cookbook-v4")];

function toPosixPath(value) {
  return value.split("\\").join("/");
}

function walkJsonFiles(dir) {
  const files = [];
  const entries = readdirSync(dir).sort();
  for (const entry of entries) {
    const fullPath = join(dir, entry);
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

function main() {
  const files = fixtureDirs.flatMap((dir) => walkJsonFiles(dir)).sort();
  let updated = 0;

  for (const filePath of files) {
    const inputText = readFileSync(filePath, "utf8");
    const inputJson = JSON.parse(inputText);
    if (!inputJson || typeof inputJson !== "object" || typeof inputJson.type !== "string") {
      continue;
    }

    const normalized = normalize(inputJson);
    const serialized = serialize(
      {
        entities: normalized.entities,
        mapping: normalized.mapping,
        requests: {},
      },
      normalized.resource,
      serializeConfigPresentation4
    );
    const nextText = `${JSON.stringify(serialized, null, 2)}\n`;
    if (nextText !== inputText) {
      writeFileSync(filePath, nextText);
      updated += 1;
    }
  }

  console.log(
    `Reserialized ${updated} fixture files (from ${files.length}) in ${toPosixPath(relative(repoRoot, fixtureRoot))}`
  );
}

main();
