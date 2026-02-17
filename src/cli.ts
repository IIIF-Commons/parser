#!/usr/bin/env node

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { convertPresentation2 } from "./presentation-2";
import {
  normalize,
  serialize,
  serializeConfigPresentation3,
  serializeConfigPresentation4,
  upgradeToPresentation4,
  validatePresentation4,
} from "./presentation-4";

type CliDeps = {
  readFileText: (path: string) => Promise<string>;
  writeFileText: (path: string, contents: string) => Promise<void>;
  fetchJson: (url: string) => Promise<unknown>;
  stdout: (line: string) => void;
  stderr: (line: string) => void;
};

type ParsedArgs = {
  positionals: string[];
  options: Record<string, string | boolean>;
};

const defaultDeps: CliDeps = {
  readFileText: (path) => readFile(path, "utf8"),
  writeFileText: (path, contents) => writeFile(path, contents, "utf8"),
  fetchJson: async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText} while downloading ${url}`);
    }
    return response.json();
  },
  stdout: (line) => console.log(line),
  stderr: (line) => console.error(line),
};

function usage() {
  return [
    "IIIF parser CLI",
    "",
    "Usage:",
    "  iiif-parser upgrade <input.json> <output.json>",
    "  iiif-parser download <manifest-url> <output.json> [--version 3|4]",
    "  iiif-parser validate-p4 <input-path...> [--strict] [--json]",
    "",
    "Commands:",
    "  upgrade      Upgrade a local IIIF Presentation 2 manifest/collection to Presentation 3.",
    "  download     Download a manifest and save as Presentation 3 (default) or Presentation 4.",
    "  validate-p4  Validate one or more files/folders of Presentation 4 manifests.",
  ].join("\n");
}

function parseArgs(args: string[]): ParsedArgs {
  const positionals: string[] = [];
  const options: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) {
      continue;
    }

    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }

    if (arg.includes("=")) {
      const [key, rawValue] = arg.slice(2).split("=", 2);
      options[key] = rawValue ?? true;
      continue;
    }

    const key = arg.slice(2);
    const next = args[i + 1];
    if (next && !next.startsWith("--")) {
      options[key] = next;
      i++;
      continue;
    }

    options[key] = true;
  }

  return { positionals, options };
}

function parseJson(contents: string, source: string): unknown {
  try {
    return JSON.parse(contents);
  } catch (error) {
    throw new Error(`Invalid JSON in ${source}: ${(error as Error).message}`);
  }
}

function toSerializedPresentation4(input: unknown): unknown {
  const upgraded = upgradeToPresentation4(input);
  const normalized = normalize(upgraded);
  return serialize(
    {
      entities: normalized.entities,
      mapping: normalized.mapping,
      requests: {},
    },
    normalized.resource,
    serializeConfigPresentation4
  );
}

function toSerializedPresentation3(input: unknown): unknown {
  const upgraded = upgradeToPresentation4(input);
  const normalized = normalize(upgraded);
  return serialize(
    {
      entities: normalized.entities,
      mapping: normalized.mapping,
      requests: {},
    },
    normalized.resource,
    serializeConfigPresentation3
  );
}

function formatJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function runUpgrade(positionals: string[], deps: CliDeps): Promise<number> {
  if (positionals.length < 3) {
    deps.stderr("Usage: iiif-parser upgrade <input.json> <output.json>");
    return 2;
  }

  const inputPath = positionals[1]!;
  const outputPath = positionals[2]!;
  const input = parseJson(await deps.readFileText(inputPath), inputPath);
  const upgraded = convertPresentation2(input as any);

  await deps.writeFileText(outputPath, formatJson(upgraded));
  deps.stdout(`Wrote upgraded manifest to ${outputPath}`);
  return 0;
}

async function runDownload(positionals: string[], options: ParsedArgs["options"], deps: CliDeps): Promise<number> {
  if (positionals.length < 3) {
    deps.stderr("Usage: iiif-parser download <manifest-url> <output.json> [--version 3|4]");
    return 2;
  }

  const url = positionals[1]!;
  const outputPath = positionals[2]!;
  const version = options.version === "4" ? "4" : "3";

  const downloaded = await deps.fetchJson(url);
  const output = version === "4" ? toSerializedPresentation4(downloaded) : toSerializedPresentation3(downloaded);

  await deps.writeFileText(outputPath, formatJson(output));
  deps.stdout(`Wrote Presentation ${version} manifest to ${outputPath}`);
  return 0;
}

async function runValidateP4(positionals: string[], options: ParsedArgs["options"], deps: CliDeps): Promise<number> {
  if (positionals.length < 2) {
    deps.stderr("Usage: iiif-parser validate-p4 <input-path...> [--strict] [--json]");
    return 2;
  }

  const inputPaths = positionals.slice(1);
  const strict = options.strict === true;
  const jsonOutput = options.json === true;
  const expandedPaths: string[] = [];

  async function collectJsonFiles(path: string): Promise<void> {
    const pathInfo = await stat(path);
    if (!pathInfo.isDirectory()) {
      expandedPaths.push(path);
      return;
    }

    const entries = await readdir(path, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = join(path, entry.name);
      if (entry.isDirectory()) {
        await collectJsonFiles(entryPath);
        continue;
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
        expandedPaths.push(entryPath);
      }
    }
  }

  for (const inputPath of inputPaths) {
    await collectJsonFiles(inputPath);
  }

  expandedPaths.sort();

  const summary = {
    scanned: expandedPaths.length,
    validated: 0,
    skipped: 0,
    valid: 0,
    invalid: 0,
  };

  const reports: Array<{
    path: string;
    valid: boolean;
    skipped: boolean;
    reason?: string;
    report?: unknown;
  }> = [];

  for (const inputPath of expandedPaths) {
    deps.stdout(`VALIDATE ${inputPath}`);
    const input = parseJson(await deps.readFileText(inputPath), inputPath);
    const resourceType = (input as { type?: string; "@type"?: string })?.type ?? (input as any)?.["@type"];
    if (resourceType !== "Manifest") {
      summary.skipped++;
      reports.push({
        path: inputPath,
        valid: true,
        skipped: true,
        reason: `type is ${String(resourceType)}`,
      });
      deps.stdout(`SKIP ${inputPath} (not a Manifest)`);
      continue;
    }

    summary.validated++;

    let report;
    try {
      report = validatePresentation4(input, {
        mode: strict ? "strict" : "tolerant",
      });
    } catch (error) {
      const reportFromError = (error as { report?: unknown }).report;
      if (!reportFromError) {
        throw error;
      }
      report = reportFromError as ReturnType<typeof validatePresentation4>;
    }

    reports.push({
      path: inputPath,
      valid: report.valid,
      skipped: false,
      report,
    });
    if (report.valid) {
      summary.valid++;
    } else {
      summary.invalid++;
    }

    if (!jsonOutput) {
      deps.stdout(
        `valid=${report.valid} errors=${report.stats.errors} warnings=${report.stats.warnings} info=${report.stats.info}`
      );
      for (const issue of report.issues) {
        deps.stdout(`${issue.severity.toUpperCase()} ${issue.code} ${issue.path} ${issue.message}`);
      }
    }
  }

  if (jsonOutput) {
    deps.stdout(
      formatJson({
        summary,
        reports,
      }).trimEnd()
    );
  } else {
    deps.stdout(
      `SUMMARY scanned=${summary.scanned} validated=${summary.validated} skipped=${summary.skipped} valid=${summary.valid} invalid=${summary.invalid}`
    );
  }

  return summary.invalid > 0 ? 1 : 0;
}

export async function runCli(args: string[], deps: CliDeps = defaultDeps): Promise<number> {
  const { positionals, options } = parseArgs(args);
  const command = positionals[0];

  if (!command || command === "help" || options.help === true) {
    deps.stdout(usage());
    return 0;
  }

  try {
    if (command === "upgrade") {
      return await runUpgrade(positionals, deps);
    }
    if (command === "download") {
      return await runDownload(positionals, options, deps);
    }
    if (command === "validate-p4") {
      return await runValidateP4(positionals, options, deps);
    }

    deps.stderr(`Unknown command: ${command}`);
    deps.stderr("");
    deps.stderr(usage());
    return 2;
  } catch (error) {
    deps.stderr((error as Error).message);
    return 1;
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  runCli(process.argv.slice(2)).then((exitCode) => {
    process.exit(exitCode);
  });
}
