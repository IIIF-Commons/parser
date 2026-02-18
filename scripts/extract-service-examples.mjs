import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const repoRoot = process.cwd();
const fixturesRoot = resolve(repoRoot, "fixtures");
const outputDir = resolve(repoRoot, ".build", "service-examples");

const scopes = {
  v2: [resolve(fixturesRoot, "presentation-2")],
  v3: [resolve(fixturesRoot, "presentation-3"), resolve(fixturesRoot, "cookbook")],
  converted: [resolve(fixturesRoot, "2-to-3-converted")],
};

function parseArgs(argv) {
  let scope = "all";
  let out = resolve(outputDir, "service-examples.json");

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      return { help: true, scope, out };
    }
    if (arg === "--scope") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --scope");
      }
      if (!new Set(["all", "v2", "v3", "converted"]).has(value)) {
        throw new Error('Invalid --scope value. Use "all", "v2", "v3", or "converted"');
      }
      scope = value;
      i += 1;
      continue;
    }
    if (arg === "--out") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --out");
      }
      out = resolve(repoRoot, value);
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { help: false, scope, out };
}

function printHelp() {
  console.log("Usage:");
  console.log("  node scripts/extract-service-examples.mjs [--scope all|v2|v3|converted] [--out <path>]");
}

function getScopeDirs(scope) {
  if (scope === "v2") return scopes.v2;
  if (scope === "v3") return scopes.v3;
  if (scope === "converted") return scopes.converted;
  return [...scopes.v2, ...scopes.v3, ...scopes.converted];
}

function walkJsonFiles(dirPath) {
  if (!existsSync(dirPath)) {
    return [];
  }

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

function toDisplayPath(filePath) {
  return relative(repoRoot, filePath).split("\\").join("/");
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function detectProfileKind(profile) {
  if (profile === undefined) return "none";
  if (typeof profile === "string") return "string";
  if (Array.isArray(profile)) return "array";
  if (isObject(profile)) return "object";
  return typeof profile;
}

function normalizeType(service) {
  if (typeof service.type === "string") return service.type;
  if (typeof service["@type"] === "string") return service["@type"];
  return "(missing)";
}

function normalizeIdKind(service) {
  const hasId = typeof service.id === "string";
  const hasAtId = typeof service["@id"] === "string";
  if (hasId && hasAtId) return "id+@id";
  if (hasId) return "id";
  if (hasAtId) return "@id";
  return "none";
}

function toSignature(service) {
  const keys = Object.keys(service).sort();
  const profile = service.profile;
  const profileKind = detectProfileKind(profile);
  const profileArrayKinds = Array.isArray(profile)
    ? Array.from(new Set(profile.map((entry) => (isObject(entry) ? "object" : typeof entry)))).sort()
    : [];

  return JSON.stringify({
    type: normalizeType(service),
    idKind: normalizeIdKind(service),
    profileKind,
    profileArrayKinds,
    keys,
  });
}

function* extractServices(value, pathParts = []) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      yield* extractServices(value[i], [...pathParts, `[${i}]`]);
    }
    return;
  }

  if (!isObject(value)) {
    return;
  }

  if ("service" in value || "services" in value) {
    const candidates = [];
    if ("service" in value) {
      const serviceValue = value.service;
      if (Array.isArray(serviceValue)) {
        for (const entry of serviceValue) {
          candidates.push(entry);
        }
      } else {
        candidates.push(serviceValue);
      }
    }
    if ("services" in value) {
      const servicesValue = value.services;
      if (Array.isArray(servicesValue)) {
        for (const entry of servicesValue) {
          candidates.push(entry);
        }
      } else {
        candidates.push(servicesValue);
      }
    }

    for (const candidate of candidates) {
      if (isObject(candidate)) {
        yield {
          path: pathParts.join("."),
          service: candidate,
        };
      }
    }
  }

  for (const [key, child] of Object.entries(value)) {
    yield* extractServices(child, [...pathParts, key]);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const files = getScopeDirs(args.scope)
    .flatMap((dirPath) => walkJsonFiles(dirPath))
    .sort();

  const signatures = new Map();
  const byType = new Map();
  const byProfileKind = new Map();
  let totalServices = 0;

  for (const filePath of files) {
    let json;
    try {
      json = JSON.parse(readFileSync(filePath, "utf8"));
    } catch {
      continue;
    }

    for (const entry of extractServices(json, [])) {
      totalServices += 1;
      const signature = toSignature(entry.service);
      const type = normalizeType(entry.service);
      const profileKind = detectProfileKind(entry.service.profile);

      if (!signatures.has(signature)) {
        signatures.set(signature, {
          count: 0,
          sample: {
            file: toDisplayPath(filePath),
            path: entry.path || "(root)",
            service: entry.service,
          },
          parsed: JSON.parse(signature),
        });
      }
      signatures.get(signature).count += 1;

      byType.set(type, (byType.get(type) ?? 0) + 1);
      byProfileKind.set(profileKind, (byProfileKind.get(profileKind) ?? 0) + 1);
    }
  }

  const sortedSignatures = Array.from(signatures.values()).sort((a, b) => b.count - a.count);
  const sortedByType = Array.from(byType.entries()).sort((a, b) => b[1] - a[1]);
  const sortedByProfileKind = Array.from(byProfileKind.entries()).sort((a, b) => b[1] - a[1]);

  mkdirSync(resolve(args.out, ".."), { recursive: true });
  writeFileSync(
    args.out,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scope: args.scope,
        filesScanned: files.map((filePath) => toDisplayPath(filePath)),
        totals: {
          files: files.length,
          services: totalServices,
          uniqueSignatures: sortedSignatures.length,
        },
        byType: sortedByType.map(([type, count]) => ({ type, count })),
        byProfileKind: sortedByProfileKind.map(([kind, count]) => ({ kind, count })),
        signatures: sortedSignatures,
      },
      null,
      2,
    ),
  );

  console.log(`Scanned files: ${files.length}`);
  console.log(`Services found: ${totalServices}`);
  console.log(`Unique service signatures: ${sortedSignatures.length}`);
  console.log("Top service types:");
  for (const [type, count] of sortedByType.slice(0, 12)) {
    console.log(`  - ${type}: ${count}`);
  }
  console.log("Profile kinds:");
  for (const [kind, count] of sortedByProfileKind) {
    console.log(`  - ${kind}: ${count}`);
  }
  console.log(`Wrote detailed report: ${toDisplayPath(args.out)}`);
}

main();
