#!/usr/bin/env node

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import pc from "picocolors";
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
  color?: boolean;
};

type ParsedArgs = {
  positionals: string[];
  options: Record<string, string | boolean>;
};

// ── Symbols ────────────────────────────────────────────────────────

const SYM = {
  check: "✓",
  cross: "✗",
  warn: "⚠",
  info: "ℹ",
  arrow: "→",
  bullet: "●",
  dash: "─",
  skip: "○",
};

// ── Color helpers ──────────────────────────────────────────────────

type Painter = (s: string) => string;

interface Colors {
  bold: Painter;
  dim: Painter;
  red: Painter;
  green: Painter;
  yellow: Painter;
  blue: Painter;
  cyan: Painter;
  magenta: Painter;
  gray: Painter;
  white: Painter;
  bgRed: Painter;
  bgGreen: Painter;
  bgYellow: Painter;
  bgBlue: Painter;
  underline: Painter;
}

function makeColors(enabled: boolean): Colors {
  if (!enabled) {
    const id: Painter = (s) => s;
    return {
      bold: id,
      dim: id,
      red: id,
      green: id,
      yellow: id,
      blue: id,
      cyan: id,
      magenta: id,
      gray: id,
      white: id,
      bgRed: id,
      bgGreen: id,
      bgYellow: id,
      bgBlue: id,
      underline: id,
    };
  }
  return {
    bold: pc.bold,
    dim: pc.dim,
    red: pc.red,
    green: pc.green,
    yellow: pc.yellow,
    blue: pc.blue,
    cyan: pc.cyan,
    magenta: pc.magenta,
    gray: pc.gray,
    white: pc.white,
    bgRed: (s) => pc.bgRed(pc.white(pc.bold(s))),
    bgGreen: (s) => pc.bgGreen(pc.white(pc.bold(s))),
    bgYellow: (s) => pc.bgYellow(pc.black(pc.bold(s))),
    bgBlue: (s) => pc.bgBlue(pc.white(pc.bold(s))),
    underline: pc.underline,
  };
}

// ── Formatting helpers ─────────────────────────────────────────────

function hr(c: Colors, width = 60): string {
  return c.dim(SYM.dash.repeat(width));
}

function badge(c: Colors, label: string, kind: "error" | "success" | "warn" | "info"): string {
  const padded = ` ${label} `;
  switch (kind) {
    case "error":
      return c.bgRed(padded);
    case "success":
      return c.bgGreen(padded);
    case "warn":
      return c.bgYellow(padded);
    case "info":
      return c.bgBlue(padded);
  }
}

function severityLabel(c: Colors, severity: string): string {
  switch (severity) {
    case "error":
      return c.red(`${SYM.cross} ERROR`);
    case "warning":
      return c.yellow(`${SYM.warn} WARN `);
    case "info":
      return c.blue(`${SYM.info} INFO `);
    default:
      return c.dim(severity.toUpperCase());
  }
}

function padRight(s: string, len: number): string {
  return s.length >= len ? s : s + " ".repeat(len - s.length);
}

// ── Default deps ───────────────────────────────────────────────────

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

// ── Usage / help ───────────────────────────────────────────────────

function usage(c: Colors): string {
  const lines = [
    "",
    `  ${c.bold("iiif-parser")} ${c.dim("— IIIF Presentation parsing & validation CLI")}`,
    "",
    hr(c),
    "",
    `  ${c.bold(c.cyan("Usage:"))}`,
    "",
    `    ${c.green("iiif-parser")} ${c.yellow("upgrade")}      ${c.dim("<input.json> <output.json>")}`,
    `    ${c.green("iiif-parser")} ${c.yellow("download")}     ${c.dim("<manifest-url> <output.json>")} ${c.dim("[--version 3|4]")}`,
    `    ${c.green("iiif-parser")} ${c.yellow("validate-p4")}  ${c.dim("<input-path...>")} ${c.dim("[--strict] [--json] [--show-warnings]")}`,
    "",
    `  ${c.bold(c.cyan("Commands:"))}`,
    "",
    `    ${c.yellow("upgrade")}       Upgrade a local IIIF Presentation 2 manifest/collection`,
    `                  to Presentation 3.`,
    "",
    `    ${c.yellow("download")}      Download a manifest and save as Presentation 3`,
    `                  ${c.dim("(default)")} or Presentation 4.`,
    "",
    `    ${c.yellow("validate-p4")}   Validate one or more files/folders of Presentation 4`,
    `                  manifests.`,
    "",
    `  ${c.bold(c.cyan("Options:"))}`,
    "",
    `    ${c.dim("--help")}        Show this help message`,
    `    ${c.dim("--version")}     Output version (for download: target version 3|4)`,
    `    ${c.dim("--strict")}          Enable strict validation mode ${c.dim("(validate-p4)")}`,
    `    ${c.dim("--json")}            Output validation results as JSON ${c.dim("(validate-p4)")}`,
    `    ${c.dim("--show-warnings")}   Show warning details in output ${c.dim("(validate-p4)")}`,
    "",
  ];
  return lines.join("\n");
}

// ── Arg parser ─────────────────────────────────────────────────────

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
      options[key!] = rawValue ?? true;
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

// ── Shared helpers ─────────────────────────────────────────────────

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

// ── Commands ───────────────────────────────────────────────────────

async function runUpgrade(positionals: string[], deps: CliDeps, c: Colors): Promise<number> {
  if (positionals.length < 3) {
    deps.stderr(`\n  ${c.red(`${SYM.cross} Missing arguments`)}\n`);
    deps.stderr(`  Usage: ${c.green("iiif-parser")} ${c.yellow("upgrade")} ${c.dim("<input.json> <output.json>")}\n`);
    return 2;
  }

  const inputPath = positionals[1]!;
  const outputPath = positionals[2]!;
  const input = parseJson(await deps.readFileText(inputPath), inputPath);
  const upgraded = convertPresentation2(input as any);

  await deps.writeFileText(outputPath, formatJson(upgraded));

  deps.stdout("");
  deps.stdout(`  ${c.green(SYM.check)} ${c.bold("Upgrade complete")}`);
  deps.stdout(`    ${c.dim("Input:")}  ${inputPath}`);
  deps.stdout(`    ${c.dim("Output:")} ${outputPath}`);
  deps.stdout("");
  return 0;
}

async function runDownload(
  positionals: string[],
  options: ParsedArgs["options"],
  deps: CliDeps,
  c: Colors
): Promise<number> {
  if (positionals.length < 3) {
    deps.stderr(`\n  ${c.red(`${SYM.cross} Missing arguments`)}\n`);
    deps.stderr(
      `  Usage: ${c.green("iiif-parser")} ${c.yellow("download")} ${c.dim("<manifest-url> <output.json> [--version 3|4]")}\n`
    );
    return 2;
  }

  const url = positionals[1]!;
  const outputPath = positionals[2]!;
  const version = options.version === "4" ? "4" : "3";

  deps.stdout("");
  deps.stdout(`  ${c.dim(`${SYM.arrow} Downloading from`)} ${c.underline(url)}`);

  const downloaded = await deps.fetchJson(url);
  const output = version === "4" ? toSerializedPresentation4(downloaded) : toSerializedPresentation3(downloaded);

  await deps.writeFileText(outputPath, formatJson(output));

  deps.stdout(
    `  ${c.green(SYM.check)} ${c.bold(`Saved as Presentation ${version}`)} ${c.dim(`${SYM.arrow} ${outputPath}`)}`
  );
  deps.stdout("");
  return 0;
}

async function runValidateP4(
  positionals: string[],
  options: ParsedArgs["options"],
  deps: CliDeps,
  c: Colors
): Promise<number> {
  if (positionals.length < 2) {
    deps.stderr(`\n  ${c.red(`${SYM.cross} Missing arguments`)}\n`);
    deps.stderr(
      `  Usage: ${c.green("iiif-parser")} ${c.yellow("validate-p4")} ${c.dim("<input-path...> [--strict] [--json] [--show-warnings]")}\n`
    );
    return 2;
  }

  const inputPaths = positionals.slice(1);
  const strict = options.strict === true;
  const jsonOutput = options.json === true;
  const showWarnings = options["show-warnings"] === true;
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

  if (!jsonOutput) {
    deps.stdout("");
    deps.stdout(
      `  ${c.bold(c.cyan("Presentation 4 Validation"))} ${c.dim(`(${strict ? "strict" : "tolerant"} mode)`)}`
    );
    deps.stdout(`  ${c.dim(`Scanning ${expandedPaths.length} file${expandedPaths.length === 1 ? "" : "s"}...`)}`);
    deps.stdout("");
  }

  // ── First pass: compact one-line-per-file results ──────────────

  for (const inputPath of expandedPaths) {
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
      if (!jsonOutput) {
        deps.stdout(`  ${c.dim(SYM.skip)} ${c.dim("SKIP")} ${c.dim(inputPath)} ${c.dim(`(${String(resourceType)})`)}`);
      }
      continue;
    }

    summary.validated++;

    let report: ReturnType<typeof validatePresentation4>;
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
      // Compact one-liner per file
      const statusIcon = report.valid ? c.green(SYM.check) : c.red(SYM.cross);
      const statusText = report.valid ? c.green("PASS") : c.red("FAIL");

      const hints: string[] = [];
      if (report.stats.errors > 0) {
        hints.push(c.red(`${SYM.cross} ${report.stats.errors}`));
      }
      if (report.stats.warnings > 0) {
        hints.push(c.yellow(`${SYM.warn} ${report.stats.warnings}`));
      }
      if (report.stats.info > 0) {
        hints.push(c.blue(`${SYM.info} ${report.stats.info}`));
      }
      const hintsStr = hints.length > 0 ? ` ${c.dim("(")}${hints.join(c.dim(", "))}${c.dim(")")}` : "";

      deps.stdout(`  ${statusIcon} ${statusText} ${inputPath}${hintsStr}`);
    }
  }

  // ── Second pass: detailed issue reports ────────────────────────

  if (!jsonOutput) {
    // Collect files that have errors
    const filesWithErrors = reports.filter(
      (r) => !r.skipped && r.report && (r.report as ReturnType<typeof validatePresentation4>).stats.errors > 0
    );

    // Collect files that have warnings
    const filesWithWarnings = reports.filter(
      (r) => !r.skipped && r.report && (r.report as ReturnType<typeof validatePresentation4>).stats.warnings > 0
    );

    if (filesWithErrors.length > 0) {
      deps.stdout("");
      deps.stdout(`  ${hr(c)}`);
      deps.stdout("");
      deps.stdout(`  ${c.bold(c.red("Errors"))}`);

      for (const entry of filesWithErrors) {
        const report = entry.report as ReturnType<typeof validatePresentation4>;
        const errorIssues = report.issues.filter((i) => i.severity === "error");

        deps.stdout("");
        deps.stdout(`  ${c.red(SYM.cross)} ${c.bold(entry.path)}`);
        deps.stdout("");

        for (const issue of errorIssues) {
          const sev = severityLabel(c, issue.severity);
          const code = c.dim(`[${issue.code}]`);
          deps.stdout(`    ${sev} ${code}`);
          deps.stdout(`           ${issue.message}`);
          if (issue.path) {
            deps.stdout(`           ${c.dim("at")} ${c.cyan(issue.path)}`);
          }
        }
      }
    }

    if (showWarnings && filesWithWarnings.length > 0) {
      deps.stdout("");
      deps.stdout(`  ${hr(c)}`);
      deps.stdout("");
      deps.stdout(`  ${c.bold(c.yellow("Warnings"))}`);

      for (const entry of filesWithWarnings) {
        const report = entry.report as ReturnType<typeof validatePresentation4>;
        const warningIssues = report.issues.filter((i) => i.severity === "warning");

        deps.stdout("");
        deps.stdout(`  ${c.yellow(SYM.warn)} ${c.bold(entry.path)}`);
        deps.stdout("");

        for (const issue of warningIssues) {
          const sev = severityLabel(c, issue.severity);
          const code = c.dim(`[${issue.code}]`);
          deps.stdout(`    ${sev} ${code}`);
          deps.stdout(`           ${issue.message}`);
          if (issue.path) {
            deps.stdout(`           ${c.dim("at")} ${c.cyan(issue.path)}`);
          }
        }
      }
    } else if (!showWarnings && filesWithWarnings.length > 0) {
      const totalWarnings = filesWithWarnings.reduce(
        (sum, r) => sum + (r.report as ReturnType<typeof validatePresentation4>).stats.warnings,
        0
      );
      deps.stdout("");
      deps.stdout(
        `  ${c.dim(`${SYM.info} ${totalWarnings} warning${totalWarnings === 1 ? "" : "s"} hidden. Use ${c.yellow("--show-warnings")} to show details.`)}`
      );
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
    // Summary
    deps.stdout("");
    deps.stdout(`  ${c.bold("Summary")}`);
    deps.stdout("");

    const labelWidth = 12;
    deps.stdout(`    ${c.dim(padRight("Scanned:", labelWidth))} ${c.bold(String(summary.scanned))}`);
    deps.stdout(`    ${c.dim(padRight("Validated:", labelWidth))} ${c.bold(String(summary.validated))}`);
    deps.stdout(`    ${c.dim(padRight("Skipped:", labelWidth))} ${c.bold(String(summary.skipped))}`);

    if (summary.valid > 0) {
      deps.stdout(`    ${c.dim(padRight("Valid:", labelWidth))} ${c.green(c.bold(String(summary.valid)))}`);
    } else {
      deps.stdout(`    ${c.dim(padRight("Valid:", labelWidth))} ${c.bold(String(summary.valid))}`);
    }

    if (summary.invalid > 0) {
      deps.stdout(`    ${c.dim(padRight("Invalid:", labelWidth))} ${c.red(c.bold(String(summary.invalid)))}`);
    } else {
      deps.stdout(`    ${c.dim(padRight("Invalid:", labelWidth))} ${c.bold(String(summary.invalid))}`);
    }

    deps.stdout("");

    if (summary.invalid > 0) {
      deps.stdout(`  ${badge(c, "FAIL", "error")} ${c.red("Validation failed")}`);
    } else if (summary.validated > 0) {
      deps.stdout(`  ${badge(c, "PASS", "success")} ${c.green("All manifests are valid")}`);
    } else {
      deps.stdout(`  ${badge(c, "DONE", "info")} ${c.dim("No manifests found to validate")}`);
    }

    deps.stdout("");
  }

  return summary.invalid > 0 ? 1 : 0;
}

// ── Main entry ─────────────────────────────────────────────────────

export async function runCli(args: string[], deps: CliDeps = defaultDeps): Promise<number> {
  const colorEnabled = deps.color !== undefined ? deps.color : (process.stdout.isTTY ?? false);
  const c = makeColors(colorEnabled);
  const { positionals, options } = parseArgs(args);
  const command = positionals[0];

  if (!command || command === "help" || options.help === true) {
    deps.stdout(usage(c));
    return 0;
  }

  try {
    if (command === "upgrade") {
      return await runUpgrade(positionals, deps, c);
    }
    if (command === "download") {
      return await runDownload(positionals, options, deps, c);
    }
    if (command === "validate-p4") {
      return await runValidateP4(positionals, options, deps, c);
    }

    deps.stderr("");
    deps.stderr(`  ${c.red(`${SYM.cross} Unknown command:`)} ${c.bold(command)}`);
    deps.stderr(usage(c));
    return 2;
  } catch (error) {
    deps.stderr("");
    deps.stderr(`  ${c.red(`${SYM.cross} Error:`)} ${(error as Error).message}`);
    deps.stderr("");
    return 1;
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  runCli(process.argv.slice(2)).then((exitCode) => {
    process.exit(exitCode);
  });
}
