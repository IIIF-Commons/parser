import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { runCli } from "../src/cli";

function testDeps(overrides: { files?: Record<string, string>; fetchJson?: (url: string) => Promise<unknown> }) {
  const files: Record<string, string> = overrides.files ?? {};
  const stdout: string[] = [];
  const stderr: string[] = [];

  return {
    files,
    stdout,
    stderr,
    deps: {
      readFileText: async (path: string) => files[path] ?? "",
      writeFileText: async (path: string, contents: string) => {
        files[path] = contents;
      },
      fetchJson:
        overrides.fetchJson ??
        (async () => {
          throw new Error("not used");
        }),
      stdout: (line: string) => stdout.push(line),
      stderr: (line: string) => stderr.push(line),
      color: false,
    },
  };
}

function fsDeps(stdout: string[], stderr: string[]) {
  return {
    readFileText: async (path: string) => readFile(path, "utf8"),
    writeFileText: async (_path: string, _contents: string) => {
      return;
    },
    fetchJson: async () => {
      throw new Error("not used");
    },
    stdout: (line: string) => stdout.push(line),
    stderr: (line: string) => stderr.push(line),
    color: false,
  };
}

describe("iiif-parser CLI", () => {
  // ── Help & unknown commands ──────────────────────────────────────

  test("shows help when no command is given", async () => {
    const { stdout, deps } = testDeps({});
    const code = await runCli([], deps);

    expect(code).toBe(0);
    const output = stdout.join("\n");
    expect(output).toContain("iiif-parser");
    expect(output).toContain("upgrade");
    expect(output).toContain("download");
    expect(output).toContain("validate-p4");
  });

  test("shows help with --help flag", async () => {
    const { stdout, deps } = testDeps({});
    const code = await runCli(["--help"], deps);

    expect(code).toBe(0);
    const output = stdout.join("\n");
    expect(output).toContain("iiif-parser");
    expect(output).toContain("Commands:");
  });

  test("help text documents --show-warnings flag", async () => {
    const { stdout, deps } = testDeps({});
    await runCli(["--help"], deps);

    const output = stdout.join("\n");
    expect(output).toContain("--show-warnings");
  });

  test("returns error for unknown command", async () => {
    const { stderr, deps } = testDeps({});
    const code = await runCli(["foobar"], deps);

    expect(code).toBe(2);
    expect(stderr.some((line) => line.includes("Unknown command") && line.includes("foobar"))).toBe(true);
  });

  // ── Upgrade command ──────────────────────────────────────────────

  test("upgrades local v2 manifest into v3 JSON", async () => {
    const { files, stdout, stderr, deps } = testDeps({
      files: {
        "input.json": JSON.stringify({
          "@context": "http://iiif.io/api/presentation/2/context.json",
          "@id": "https://example.org/manifest",
          "@type": "sc:Manifest",
          label: "Example manifest",
          sequences: [],
        }),
      },
    });

    const code = await runCli(["upgrade", "input.json", "output.json"], deps);

    expect(code).toBe(0);
    expect(stderr).toEqual([]);

    const allOutput = stdout.join("\n");
    expect(allOutput).toContain("Upgrade complete");
    expect(allOutput).toContain("output.json");

    const output = JSON.parse(files["output.json"]!);
    expect(output["@context"]).toBe("http://iiif.io/api/presentation/3/context.json");
    expect(output.type).toBe("Manifest");
  });

  test("upgrade shows usage when missing arguments", async () => {
    const { stderr, deps } = testDeps({});
    const code = await runCli(["upgrade"], deps);

    expect(code).toBe(2);
    expect(stderr.some((line) => line.includes("Missing arguments"))).toBe(true);
  });

  // ── Download command ─────────────────────────────────────────────

  test("downloads and writes presentation 4 when requested", async () => {
    const { files, stdout, deps } = testDeps({
      fetchJson: async () => ({
        "@context": "http://iiif.io/api/presentation/3/context.json",
        id: "https://example.org/manifest",
        type: "Manifest",
        label: { en: ["Example"] },
        items: [],
      }),
    });

    const code = await runCli(["download", "https://example.org/manifest", "downloaded.json", "--version", "4"], deps);

    expect(code).toBe(0);

    const allOutput = stdout.join("\n");
    expect(allOutput).toContain("Presentation 4");

    const output = JSON.parse(files["downloaded.json"]!);
    expect(output["@context"]).toBe("http://iiif.io/api/presentation/4/context.json");
    expect(output.type).toBe("Manifest");
  });

  test("downloads and writes presentation 3 by default", async () => {
    const { stdout, deps } = testDeps({
      fetchJson: async () => ({
        "@context": "http://iiif.io/api/presentation/3/context.json",
        id: "https://example.org/manifest",
        type: "Manifest",
        label: { en: ["Example"] },
        items: [],
      }),
    });

    const code = await runCli(["download", "https://example.org/manifest", "downloaded.json"], deps);

    expect(code).toBe(0);

    const allOutput = stdout.join("\n");
    expect(allOutput).toContain("Presentation 3");
  });

  test("download shows usage when missing arguments", async () => {
    const { stderr, deps } = testDeps({});
    const code = await runCli(["download"], deps);

    expect(code).toBe(2);
    expect(stderr.some((line) => line.includes("Missing arguments"))).toBe(true);
  });

  // ── Validate-p4: compact output ──────────────────────────────────

  test("compact output shows PASS/FAIL on one line per file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "iiif-parser-cli-"));

    try {
      await writeFile(
        join(dir, "good.json"),
        JSON.stringify({
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/manifest/good",
          type: "Manifest",
          label: { en: ["Good"] },
          items: [{ id: "https://example.org/canvas/1", type: "Canvas", width: 1000, height: 1000, items: [] }],
        }),
        "utf8"
      );
      await writeFile(
        join(dir, "bad.json"),
        JSON.stringify({
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/manifest/bad",
          type: "Manifest",
          label: { en: ["Bad"] },
          items: [],
        }),
        "utf8"
      );

      const stdout: string[] = [];
      const code = await runCli(["validate-p4", dir], fsDeps(stdout, []));

      expect(code).toBe(1);

      const allOutput = stdout.join("\n");

      // Each file gets a single compact line with PASS or FAIL
      expect(allOutput).toContain("PASS");
      expect(allOutput).toContain("FAIL");
      expect(allOutput).toContain("good.json");
      expect(allOutput).toContain("bad.json");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("compact line shows warning count hint even without --show-warnings", async () => {
    const dir = await mkdtemp(join(tmpdir(), "iiif-parser-cli-"));

    try {
      // A valid manifest that will produce warnings (missing metadata, provider, thumbnail)
      await writeFile(
        join(dir, "manifest.json"),
        JSON.stringify({
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/manifest",
          type: "Manifest",
          label: { en: ["Test"] },
          items: [{ id: "https://example.org/canvas/1", type: "Canvas", width: 1000, height: 1000, items: [] }],
        }),
        "utf8"
      );

      const stdout: string[] = [];
      // No --show-warnings flag
      const code = await runCli(["validate-p4", dir], fsDeps(stdout, []));

      expect(code).toBe(0);

      const allOutput = stdout.join("\n");
      // The compact PASS line should contain the warning symbol and a count
      const passLine = stdout.find((line) => line.includes("PASS") && line.includes("manifest.json"));
      expect(passLine).toBeDefined();
      // Warning indicator present in the compact line (⚠ followed by a number)
      expect(passLine).toMatch(/⚠\s*\d+/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  // ── Validate-p4: deferred error detail ───────────────────────────

  test("error details are shown after the compact list", async () => {
    const dir = await mkdtemp(join(tmpdir(), "iiif-parser-cli-"));

    try {
      await writeFile(
        join(dir, "bad.json"),
        JSON.stringify({
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/manifest/bad",
          type: "Manifest",
          label: { en: ["Bad"] },
          items: [],
        }),
        "utf8"
      );

      const stdout: string[] = [];
      const code = await runCli(["validate-p4", dir], fsDeps(stdout, []));

      expect(code).toBe(1);

      const allOutput = stdout.join("\n");

      // The compact FAIL line comes first
      expect(allOutput).toContain("FAIL");

      // Then a separate "Errors" section with deferred detail
      expect(allOutput).toContain("Errors");
      expect(allOutput).toContain("manifest-items-required");

      // The error detail section appears after the compact line
      const failLineIdx = stdout.findIndex((line) => line.includes("FAIL") && line.includes("bad.json"));
      const errorsSectionIdx = stdout.findIndex((line) => line.includes("Errors"));
      expect(errorsSectionIdx).toBeGreaterThan(failLineIdx);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  // ── Validate-p4: --show-warnings ─────────────────────────────────

  test("warning details are hidden by default but hint is shown", async () => {
    const dir = await mkdtemp(join(tmpdir(), "iiif-parser-cli-"));

    try {
      await writeFile(
        join(dir, "manifest.json"),
        JSON.stringify({
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/manifest",
          type: "Manifest",
          label: { en: ["Good"] },
          items: [{ id: "https://example.org/canvas/1", type: "Canvas", width: 1000, height: 1000, items: [] }],
        }),
        "utf8"
      );

      const stdout: string[] = [];
      const code = await runCli(["validate-p4", dir], fsDeps(stdout, []));

      expect(code).toBe(0);

      const allOutput = stdout.join("\n");

      // No "Warnings" section header
      expect(allOutput).not.toContain("Warnings\n");

      // Hint to use --show-warnings
      expect(allOutput).toContain("--show-warnings");
      expect(allOutput).toMatch(/warning.*hidden|hidden.*warning/i);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("--show-warnings reveals warning detail section", async () => {
    const dir = await mkdtemp(join(tmpdir(), "iiif-parser-cli-"));

    try {
      await writeFile(
        join(dir, "manifest.json"),
        JSON.stringify({
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/manifest",
          type: "Manifest",
          label: { en: ["Good"] },
          items: [{ id: "https://example.org/canvas/1", type: "Canvas", width: 1000, height: 1000, items: [] }],
        }),
        "utf8"
      );

      const stdout: string[] = [];
      const code = await runCli(["validate-p4", dir, "--show-warnings"], fsDeps(stdout, []));

      expect(code).toBe(0);

      const allOutput = stdout.join("\n");

      // A "Warnings" section header should appear
      expect(allOutput).toContain("Warnings");

      // Individual warning codes should be present in the detail
      expect(allOutput).toContain("class-requirement-should");

      // No "hidden" hint since we're showing them
      expect(allOutput).not.toContain("hidden");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  // ── Validate-p4: skips ───────────────────────────────────────────

  test("validates all JSON files in a folder and skips non-manifest resources", async () => {
    const dir = await mkdtemp(join(tmpdir(), "iiif-parser-cli-"));
    const nested = join(dir, "nested");

    try {
      await writeFile(
        join(dir, "valid-manifest.json"),
        JSON.stringify({
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/manifest/valid",
          type: "Manifest",
          label: { en: ["Good"] },
          items: [{ id: "https://example.org/canvas/1", type: "Canvas", width: 1000, height: 1000, items: [] }],
        }),
        "utf8"
      );
      await writeFile(
        join(dir, "collection.json"),
        JSON.stringify({
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/collection/1",
          type: "Collection",
          label: { en: ["Collection"] },
          items: [],
        }),
        "utf8"
      );
      await writeFile(
        join(dir, "bad-manifest.json"),
        JSON.stringify({
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/manifest/bad",
          type: "Manifest",
          label: { en: ["Bad"] },
          items: [],
        }),
        "utf8"
      );

      await mkdir(nested);
      await writeFile(
        join(nested, "valid-manifest-2.json"),
        JSON.stringify({
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/manifest/valid-2",
          type: "Manifest",
          label: { en: ["Good 2"] },
          items: [{ id: "https://example.org/canvas/2", type: "Canvas", width: 1000, height: 1000, items: [] }],
        }),
        "utf8"
      );

      const stdout: string[] = [];
      const stderr: string[] = [];

      const code = await runCli(["validate-p4", dir], fsDeps(stdout, stderr));

      expect(code).toBe(1);
      expect(stderr).toEqual([]);

      const allOutput = stdout.join("\n");

      // Skip message for the collection
      expect(allOutput).toContain("SKIP");
      expect(allOutput).toContain("collection.json");

      // Summary section with structured output
      expect(allOutput).toContain("Summary");
      expect(allOutput).toContain("Scanned:");
      expect(allOutput).toContain("4");
      expect(allOutput).toContain("Validated:");
      expect(allOutput).toContain("3");
      expect(allOutput).toContain("Skipped:");
      expect(allOutput).toContain("1");
      expect(allOutput).toContain("Valid:");
      expect(allOutput).toContain("2");
      expect(allOutput).toContain("Invalid:");
      // Overall result
      expect(allOutput).toContain("FAIL");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  // ── Validate-p4: JSON output ─────────────────────────────────────

  test("validation with --json flag outputs structured JSON", async () => {
    const dir = await mkdtemp(join(tmpdir(), "iiif-parser-cli-"));
    const manifestPath = join(dir, "manifest.json");

    try {
      await writeFile(
        manifestPath,
        JSON.stringify({
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/manifest",
          type: "Manifest",
          label: { en: ["Test"] },
          items: [{ id: "https://example.org/canvas/1", type: "Canvas", width: 1000, height: 1000, items: [] }],
        }),
        "utf8"
      );

      const stdout: string[] = [];
      const code = await runCli(["validate-p4", manifestPath, "--json"], fsDeps(stdout, []));

      expect(code).toBe(0);

      const jsonResult = JSON.parse(stdout.join("\n"));
      expect(jsonResult.summary).toBeDefined();
      expect(jsonResult.summary.scanned).toBe(1);
      expect(jsonResult.summary.validated).toBe(1);
      expect(jsonResult.reports).toHaveLength(1);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("validate-p4 accepts a manifest URL input", async () => {
    const manifestUrl = "https://example.org/manifest.json";
    const { stdout, deps } = testDeps({
      fetchJson: async (url: string) => {
        expect(url).toBe(manifestUrl);
        return {
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/manifest",
          type: "Manifest",
          label: { en: ["Remote"] },
          items: [{ id: "https://example.org/canvas/1", type: "Canvas", width: 1000, height: 1000, items: [] }],
        };
      },
    });

    const code = await runCli(["validate-p4", manifestUrl], deps);
    expect(code).toBe(0);

    const allOutput = stdout.join("\n");
    expect(allOutput).toContain("PASS");
    expect(allOutput).toContain(manifestUrl);
    expect(allOutput).toContain("Scanned:");
    expect(allOutput).toContain("1");
  });

  test("validate-p4 supports mixed local path and URL inputs", async () => {
    const dir = await mkdtemp(join(tmpdir(), "iiif-parser-cli-"));
    const manifestPath = join(dir, "local.json");
    const manifestUrl = "https://example.org/remote-manifest.json";

    try {
      await writeFile(
        manifestPath,
        JSON.stringify({
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/manifest/local",
          type: "Manifest",
          label: { en: ["Local"] },
          items: [{ id: "https://example.org/canvas/1", type: "Canvas", width: 1000, height: 1000, items: [] }],
        }),
        "utf8"
      );

      const stdout: string[] = [];
      const stderr: string[] = [];
      const deps = {
        ...fsDeps(stdout, stderr),
        fetchJson: async (url: string) => {
          expect(url).toBe(manifestUrl);
          return {
            "@context": "http://iiif.io/api/presentation/4/context.json",
            id: "https://example.org/manifest/remote",
            type: "Manifest",
            label: { en: ["Remote"] },
            items: [{ id: "https://example.org/canvas/2", type: "Canvas", width: 1000, height: 1000, items: [] }],
          };
        },
      };

      const code = await runCli(["validate-p4", manifestPath, manifestUrl], deps);
      expect(code).toBe(0);
      expect(stderr).toEqual([]);

      const allOutput = stdout.join("\n");
      expect(allOutput).toContain("PASS");
      expect(allOutput).toContain(manifestPath);
      expect(allOutput).toContain(manifestUrl);
      expect(allOutput).toContain("Scanned:");
      expect(allOutput).toContain("2");
      expect(allOutput).toContain("Validated:");
      expect(allOutput).toContain("2");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  // ── Validate-p4: usage errors ────────────────────────────────────

  test("validate-p4 shows usage when missing arguments", async () => {
    const { stderr, deps } = testDeps({});
    const code = await runCli(["validate-p4"], deps);

    expect(code).toBe(2);
    expect(stderr.some((line) => line.includes("Missing arguments"))).toBe(true);
  });

  // ── Validate-p4: all-pass summary ────────────────────────────────

  test("passing manifests show PASS status and success summary", async () => {
    const dir = await mkdtemp(join(tmpdir(), "iiif-parser-cli-"));
    const manifestPath = join(dir, "manifest.json");

    try {
      await writeFile(
        manifestPath,
        JSON.stringify({
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/manifest",
          type: "Manifest",
          label: { en: ["Good"] },
          items: [{ id: "https://example.org/canvas/1", type: "Canvas", width: 1000, height: 1000, items: [] }],
        }),
        "utf8"
      );

      const stdout: string[] = [];
      const code = await runCli(["validate-p4", manifestPath], fsDeps(stdout, []));

      expect(code).toBe(0);

      const allOutput = stdout.join("\n");
      expect(allOutput).toContain("PASS");
      expect(allOutput).toContain("All manifests are valid");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  // ── Validate-p4: errors and warnings in one run ──────────────────

  test("errors section appears without --show-warnings, warnings section only with it", async () => {
    const dir = await mkdtemp(join(tmpdir(), "iiif-parser-cli-"));

    try {
      // A manifest with both errors and warnings
      await writeFile(
        join(dir, "manifest.json"),
        JSON.stringify({
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/manifest/bad",
          type: "Manifest",
          label: { en: ["Bad"] },
          items: [],
        }),
        "utf8"
      );

      // Without --show-warnings
      const stdoutNoWarn: string[] = [];
      const code1 = await runCli(["validate-p4", dir], fsDeps(stdoutNoWarn, []));
      expect(code1).toBe(1);

      const outputNoWarn = stdoutNoWarn.join("\n");
      expect(outputNoWarn).toContain("Errors");
      expect(outputNoWarn).toContain("manifest-items-required");
      // Should NOT have a "Warnings" detail section
      const warningsSectionNoFlag = stdoutNoWarn.some((line) => /^\s*Warnings\s*$/.test(line));
      expect(warningsSectionNoFlag).toBe(false);
      // But should hint about hidden warnings
      expect(outputNoWarn).toContain("--show-warnings");

      // With --show-warnings
      const stdoutWithWarn: string[] = [];
      const code2 = await runCli(["validate-p4", dir, "--show-warnings"], fsDeps(stdoutWithWarn, []));
      expect(code2).toBe(1);

      const outputWithWarn = stdoutWithWarn.join("\n");
      expect(outputWithWarn).toContain("Errors");
      expect(outputWithWarn).toContain("Warnings");
      expect(outputWithWarn).toContain("class-requirement-should");
      // No hidden hint when warnings are shown
      expect(outputWithWarn).not.toContain("hidden");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
