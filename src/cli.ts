#!/usr/bin/env node

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import packageJson from "../package.json";
import pc from "picocolors";
import { convertPresentation2 } from "./presentation-2";
import {
  createValidationReport,
  normalize,
  serialize,
  serializeConfigPresentation3,
  serializeConfigPresentation4,
  upgradeToPresentation4,
} from "./presentation-4";
import { validateAuthoredPresentation4 } from "./presentation-4/validator";

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

type JsonToken = {
  kind: "{" | "}" | "[" | "]" | ":" | "," | "value";
  start: number;
  end: number;
  value?: unknown;
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
    `    ${c.green("iiif-parser")} ${c.yellow("convert")}      ${c.dim("<input-path-or-url> <output.json> --version 3|4")}`,
    `    ${c.green("iiif-parser")} ${c.yellow("download")}     ${c.dim("<manifest-url> <output.json>")} ${c.dim("[--version 3|4]")}`,
    `    ${c.green("iiif-parser")} ${c.yellow("validate-p4")}  ${c.dim("<input-path-or-url...>")} ${c.dim("[--strict] [--json] [--show-warnings]")}`,
    "",
    `  ${c.bold(c.cyan("Commands:"))}`,
    "",
    `    ${c.yellow("upgrade")}       Upgrade a local IIIF Presentation 2 manifest/collection`,
    `                  to Presentation 3.`,
    "",
    `    ${c.yellow("convert")}       Convert a local or remote Presentation 2, 3, or 4 resource`,
    `                  to Presentation 3 or 4.`,
    "",
    `    ${c.yellow("download")}      Download a manifest and save as Presentation 3`,
    `                  ${c.dim("(default)")} or Presentation 4.`,
    "",
    `    ${c.yellow("validate-p4")}   Validate one or more files/folders/URLs containing authored`,
    `                  Presentation 4 resources.`,
    "",
    `  ${c.bold(c.cyan("Options:"))}`,
    "",
    `    ${c.dim("--help")}            Show this help message`,
    `    ${c.dim("--version")}         Output CLI version, or select target version 3|4`,
    `    ${c.dim("--strict")}          Treat validation warnings as failures ${c.dim("(validate-p4)")}`,
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
  const booleanOptions = new Set(["help", "strict", "json", "show-warnings"]);

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
    if (!booleanOptions.has(key) && next && !next.startsWith("--")) {
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

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function hasPresentationContext(value: unknown): boolean {
  const context = (value as { "@context"?: unknown } | null)?.["@context"];
  return (Array.isArray(context) ? context : [context]).some(
    (entry) => typeof entry === "string" && entry.includes("/api/presentation/")
  );
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

async function readJsonDocument(source: string, deps: CliDeps): Promise<{ input: unknown; text: string }> {
  if (isHttpUrl(source)) {
    const input = await deps.fetchJson(source);
    return { input, text: formatJson(input) };
  }
  const text = await deps.readFileText(source);
  return { input: parseJson(text, source), text };
}

async function readJsonSource(source: string, deps: CliDeps): Promise<unknown> {
  return (await readJsonDocument(source, deps)).input;
}

function tokenizeJson(source: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  const punctuation = new Set(["{", "}", "[", "]", ":", ","]);

  for (let index = 0; index < source.length;) {
    const character = source[index]!;
    if (/\s/.test(character)) {
      index++;
      continue;
    }
    if (punctuation.has(character)) {
      tokens.push({ kind: character as JsonToken["kind"], start: index, end: index + 1 });
      index++;
      continue;
    }
    if (character === '"') {
      let end = index + 1;
      while (end < source.length) {
        const current = source[end];
        if (current === "\\") {
          end += 2;
        } else {
          end++;
          if (current === '"') break;
        }
      }
      const raw = source.slice(index, end);
      tokens.push({ kind: "value", start: index, end, value: JSON.parse(raw) });
      index = end;
      continue;
    }

    let end = index + 1;
    while (end < source.length && !/\s/.test(source[end]!) && !punctuation.has(source[end]!)) {
      end++;
    }
    const raw = source.slice(index, end);
    tokens.push({ kind: "value", start: index, end, value: JSON.parse(raw) });
    index = end;
  }

  return tokens;
}

function parseJsonPath(path: string): Array<string | number> | undefined {
  if (!path.startsWith("$")) {
    return undefined;
  }

  const segments: Array<string | number> = [];
  let remaining = path.slice(1);
  while (remaining) {
    const match = remaining.match(/^(?:\.([^.[\]]+)|\[(\d+)\]|\[("(?:\\.|[^"\\])*")\])/);
    if (!match) {
      return undefined;
    }
    segments.push(typeof match[1] === "string" ? match[1] : match[2] ? Number(match[2]) : JSON.parse(match[3]!));
    remaining = remaining.slice(match[0].length);
  }
  return segments;
}

function findJsonSpan(source: string, path: string): { start: number; end: number } | undefined {
  const requestedSegments = parseJsonPath(path);
  if (!requestedSegments) {
    return undefined;
  }

  const tokens = tokenizeJson(source);
  const spans = new Map<string, { start: number; end: number }>();

  function walk(tokenIndex: number, segments: Array<string | number>): number {
    const token = tokens[tokenIndex];
    if (!token) {
      return tokenIndex;
    }
    const start = token.start;

    if (token.kind === "{") {
      tokenIndex++;
      while (tokens[tokenIndex]?.kind !== "}" && tokenIndex < tokens.length) {
        const key = tokens[tokenIndex]?.value;
        tokenIndex += 2;
        tokenIndex = walk(tokenIndex, [...segments, String(key)]);
        if (tokens[tokenIndex]?.kind === ",") tokenIndex++;
      }
    } else if (token.kind === "[") {
      tokenIndex++;
      let itemIndex = 0;
      while (tokens[tokenIndex]?.kind !== "]" && tokenIndex < tokens.length) {
        tokenIndex = walk(tokenIndex, [...segments, itemIndex++]);
        if (tokens[tokenIndex]?.kind === ",") tokenIndex++;
      }
    }

    const end = tokens[tokenIndex]?.end ?? token.end;
    spans.set(JSON.stringify(segments), { start, end });
    return tokenIndex + 1;
  }

  walk(0, []);

  const exact = spans.get(JSON.stringify(requestedSegments));
  if (exact) {
    const type = spans.get(JSON.stringify([...requestedSegments, "type"]));
    return type ?? exact;
  }

  while (requestedSegments.length > 0) {
    requestedSegments.pop();
    const parent = spans.get(JSON.stringify(requestedSegments));
    if (parent) {
      return { start: Math.max(parent.start, parent.end - 1), end: parent.end };
    }
  }
  return spans.get("[]");
}

function jsonCodeFrame(source: string, path: string, sourceName: string, c: Colors): string[] {
  const span = findJsonSpan(source, path);
  if (!span) {
    return [];
  }

  const lineStarts = [0];
  for (let index = 0; index < source.length; index++) {
    if (source[index] === "\n") lineStarts.push(index + 1);
  }
  let lineIndex = lineStarts.length - 1;
  while (lineStarts[lineIndex]! > span.start) lineIndex--;
  const lineStart = lineStarts[lineIndex]!;
  const lineEnd = source.indexOf("\n", lineStart);
  const lines = source.split(/\r?\n/);
  const lineNumber = lineIndex + 1;
  const column = span.start - lineStart + 1;
  const markerWidth = Math.max(1, Math.min(span.end, lineEnd === -1 ? source.length : lineEnd) - span.start);
  const firstLine = Math.max(0, lineIndex - 1);
  const lastLine = Math.min(lines.length - 1, lineIndex + 1);
  const gutterWidth = String(lastLine + 1).length;
  const maxLineWidth = 140;
  const cropStart = Math.max(0, Math.min(column - 41, (lines[lineIndex]?.length ?? 0) - maxLineWidth));
  const markerColumn = column - 1 - cropStart + (cropStart > 0 ? 1 : 0);
  const frame = [`${c.dim("┌─")} ${c.cyan(`${sourceName}:${lineNumber}:${column}`)}`, c.dim("│")];

  for (let current = firstLine; current <= lastLine; current++) {
    const rawLine = lines[current] ?? "";
    const displayedLine = `${cropStart > 0 ? "…" : ""}${rawLine.slice(cropStart, cropStart + maxLineWidth)}${
      rawLine.length > cropStart + maxLineWidth ? "…" : ""
    }`;
    frame.push(`${c.dim(String(current + 1).padStart(gutterWidth))} ${c.dim("│")} ${displayedLine}`);
    if (current === lineIndex) {
      frame.push(
        `${" ".repeat(gutterWidth)} ${c.dim("│")} ${" ".repeat(markerColumn)}${c.red(
          "^".repeat(Math.min(markerWidth, maxLineWidth - markerColumn + 1))
        )}`
      );
    }
  }
  return frame;
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

async function runConvert(
  command: "convert" | "download",
  positionals: string[],
  options: ParsedArgs["options"],
  deps: CliDeps,
  c: Colors
): Promise<number> {
  if (positionals.length < 3) {
    deps.stderr(`\n  ${c.red(`${SYM.cross} Missing arguments`)}\n`);
    deps.stderr(
      `  Usage: ${c.green("iiif-parser")} ${c.yellow(command)} ${c.dim(
        command === "convert"
          ? "<input-path-or-url> <output.json> --version 3|4"
          : "<manifest-url> <output.json> [--version 3|4]"
      )}\n`
    );
    return 2;
  }

  const source = positionals[1]!;
  const outputPath = positionals[2]!;
  if (command === "download" && !isHttpUrl(source)) {
    deps.stderr(`\n  ${c.red(`${SYM.cross} Invalid URL:`)} ${source}\n`);
    return 2;
  }

  const versionOption = options.version;
  if (
    (command === "convert" && typeof versionOption === "undefined") ||
    (typeof versionOption !== "undefined" && versionOption !== "3" && versionOption !== "4")
  ) {
    deps.stderr(`\n  ${c.red(`${SYM.cross} --version must be 3 or 4`)}\n`);
    return 2;
  }
  const version = versionOption === "4" ? "4" : "3";

  deps.stdout("");
  deps.stdout(`  ${c.dim(`${SYM.arrow} Reading from`)} ${c.underline(source)}`);

  const input = await readJsonSource(source, deps);
  const output = version === "4" ? toSerializedPresentation4(input) : toSerializedPresentation3(input);

  await deps.writeFileText(outputPath, formatJson(output));

  deps.stdout(
    `  ${c.green(SYM.check)} ${c.bold(`Converted to Presentation ${version}`)} ${c.dim(`${SYM.arrow} ${outputPath}`)}`
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
      `  Usage: ${c.green("iiif-parser")} ${c.yellow("validate-p4")} ${c.dim("<input-path-or-url...> [--strict] [--json] [--show-warnings]")}\n`
    );
    return 2;
  }

  const inputPaths = positionals.slice(1);
  const strict = options.strict === true;
  const jsonOutput = options.json === true;
  const showWarnings = options["show-warnings"] === true;
  const expandedInputs: Array<{ type: "file" | "url"; path: string }> = [];
  const sourceTexts = new Map<string, string>();

  async function collectJsonFiles(path: string): Promise<void> {
    if (isHttpUrl(path)) {
      expandedInputs.push({ type: "url", path });
      return;
    }

    let pathInfo: Awaited<ReturnType<typeof stat>>;
    try {
      pathInfo = await stat(path);
    } catch {
      expandedInputs.push({ type: "file", path });
      return;
    }
    if (!pathInfo.isDirectory()) {
      expandedInputs.push({ type: "file", path });
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
        expandedInputs.push({ type: "file", path: entryPath });
      }
    }
  }

  for (const inputPath of inputPaths) {
    await collectJsonFiles(inputPath);
  }

  expandedInputs.sort((a, b) => a.path.localeCompare(b.path));

  const summary = {
    scanned: expandedInputs.length,
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
    deps.stdout(`  ${c.dim(`Scanning ${expandedInputs.length} input${expandedInputs.length === 1 ? "" : "s"}...`)}`);
    deps.stdout("");
  }

  // ── First pass: compact one-line-per-file results ──────────────

  for (const inputRef of expandedInputs) {
    const inputPath = inputRef.path;
    let input: unknown;
    let report: ReturnType<typeof validateAuthoredPresentation4> | undefined;

    try {
      const document = await readJsonDocument(inputPath, deps);
      input = document.input;
      sourceTexts.set(inputPath, document.text);
    } catch (error) {
      report = createValidationReport([
        {
          code: "input-processing-error",
          severity: "error",
          message: (error as Error).message,
          path: "$",
        },
      ]);
    }

    const resourceType =
      (input as { type?: string; "@type"?: string } | undefined)?.type ??
      (input as { "@type"?: string } | undefined)?.["@type"];
    if (!report && !resourceType && !hasPresentationContext(input)) {
      summary.skipped++;
      reports.push({
        path: inputPath,
        valid: true,
        skipped: true,
        reason: "no IIIF resource type",
      });
      if (!jsonOutput) {
        deps.stdout(`  ${c.dim(SYM.skip)} ${c.dim("SKIP")} ${c.dim(inputPath)} ${c.dim("(no IIIF resource type)")}`);
      }
      continue;
    }

    summary.validated++;

    if (!report) {
      try {
        report = validateAuthoredPresentation4(input, {
          mode: strict ? "strict" : "tolerant",
        });
      } catch (error) {
        const reportFromError = (error as { report?: unknown }).report;
        if (!reportFromError) {
          report = createValidationReport([
            {
              code: "input-processing-error",
              severity: "error",
              message: (error as Error).message,
              path: "$",
            },
          ]);
        } else {
          report = reportFromError as ReturnType<typeof validateAuthoredPresentation4>;
        }
      }
    }

    const valid = report.valid && (!strict || report.stats.warnings === 0);
    reports.push({
      path: inputPath,
      valid,
      skipped: false,
      report,
    });
    if (valid) {
      summary.valid++;
    } else {
      summary.invalid++;
    }

    if (!jsonOutput) {
      // Compact one-liner per file
      const statusIcon = valid ? c.green(SYM.check) : c.red(SYM.cross);
      const statusText = valid ? c.green("PASS") : c.red("FAIL");

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
      (r) => !r.skipped && r.report && (r.report as ReturnType<typeof validateAuthoredPresentation4>).stats.errors > 0
    );

    // Collect files that have warnings
    const filesWithWarnings = reports.filter(
      (r) => !r.skipped && r.report && (r.report as ReturnType<typeof validateAuthoredPresentation4>).stats.warnings > 0
    );

    if (filesWithErrors.length > 0) {
      deps.stdout("");
      deps.stdout(`  ${hr(c)}`);
      deps.stdout("");
      deps.stdout(`  ${c.bold(c.red("Errors"))}`);

      for (const entry of filesWithErrors) {
        const report = entry.report as ReturnType<typeof validateAuthoredPresentation4>;
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
            const frame = jsonCodeFrame(sourceTexts.get(entry.path) ?? "", issue.path, entry.path, c);
            if (frame.length > 0) {
              deps.stdout("");
              for (const line of frame) deps.stdout(`           ${line}`);
            }
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
        const report = entry.report as ReturnType<typeof validateAuthoredPresentation4>;
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
        (sum, r) => sum + (r.report as ReturnType<typeof validateAuthoredPresentation4>).stats.warnings,
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
      deps.stdout(`  ${badge(c, "PASS", "success")} ${c.green("All resources are valid")}`);
    } else {
      deps.stdout(`  ${badge(c, "DONE", "info")} ${c.dim("No IIIF resources found to validate")}`);
    }

    deps.stdout("");
  }

  return summary.invalid > 0 ? 1 : 0;
}

// ── Main entry ─────────────────────────────────────────────────────

export async function runCli(args: string[], deps: CliDeps = defaultDeps): Promise<number> {
  if (args.length === 1 && (args[0] === "--version" || args[0] === "-V")) {
    deps.stdout(packageJson.version);
    return 0;
  }
  if (args.length === 1 && args[0] === "-h") {
    args = ["--help"];
  }

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
    if (command === "convert" || command === "download") {
      return await runConvert(command, positionals, options, deps, c);
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

if (import.meta.main || isMain) {
  runCli(process.argv.slice(2)).then((exitCode) => {
    process.exit(exitCode);
  });
}
