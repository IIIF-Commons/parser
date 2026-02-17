import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { runCli } from "../src/cli";

describe("iiif-parser CLI", () => {
  test("upgrades local v2 manifest into v3 JSON", async () => {
    const files: Record<string, string> = {
      "input.json": JSON.stringify({
        "@context": "http://iiif.io/api/presentation/2/context.json",
        "@id": "https://example.org/manifest",
        "@type": "sc:Manifest",
        label: "Example manifest",
        sequences: [],
      }),
    };

    const stdout: string[] = [];
    const stderr: string[] = [];

    const code = await runCli(["upgrade", "input.json", "output.json"], {
      readFileText: async (path) => files[path] ?? "",
      writeFileText: async (path, contents) => {
        files[path] = contents;
      },
      fetchJson: async () => {
        throw new Error("not used");
      },
      stdout: (line) => stdout.push(line),
      stderr: (line) => stderr.push(line),
    });

    expect(code).toBe(0);
    expect(stderr).toEqual([]);
    expect(stdout[0]).toContain("output.json");

    const output = JSON.parse(files["output.json"]!);
    expect(output["@context"]).toBe("http://iiif.io/api/presentation/3/context.json");
    expect(output.type).toBe("Manifest");
  });

  test("downloads and writes presentation 4 when requested", async () => {
    const files: Record<string, string> = {};
    const stdout: string[] = [];

    const code = await runCli(["download", "https://example.org/manifest", "downloaded.json", "--version", "4"], {
      readFileText: async () => "",
      writeFileText: async (path, contents) => {
        files[path] = contents;
      },
      fetchJson: async () => ({
        "@context": "http://iiif.io/api/presentation/3/context.json",
        id: "https://example.org/manifest",
        type: "Manifest",
        label: { en: ["Example"] },
        items: [],
      }),
      stdout: (line) => stdout.push(line),
      stderr: () => {
        return;
      },
    });

    expect(code).toBe(0);
    expect(stdout[0]).toContain("Presentation 4");

    const output = JSON.parse(files["downloaded.json"]!);
    expect(output["@context"]).toBe("http://iiif.io/api/presentation/4/context.json");
    expect(output.type).toBe("Manifest");
  });

  test("returns non-zero when P4 validation fails", async () => {
    const dir = await mkdtemp(join(tmpdir(), "iiif-parser-cli-"));
    const manifestPath = join(dir, "manifest.json");

    try {
      await writeFile(
        manifestPath,
        JSON.stringify({
          "@context": "http://iiif.io/api/presentation/4/context.json",
          id: "https://example.org/manifest",
          type: "Manifest",
          label: { en: ["Bad"] },
          items: [],
        }),
        "utf8"
      );

      const stdout: string[] = [];

      const code = await runCli(["validate-p4", manifestPath], {
        readFileText: async (path) => readFile(path, "utf8"),
        writeFileText: async () => {
          return;
        },
        fetchJson: async () => {
          throw new Error("not used");
        },
        stdout: (line) => stdout.push(line),
        stderr: () => {
          return;
        },
      });

      expect(code).toBe(1);
      expect(stdout.some((line) => line.includes("valid=false"))).toBe(true);
      expect(stdout.some((line) => line.includes("manifest-items-required"))).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

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
          items: [
            {
              id: "https://example.org/canvas/1",
              type: "Canvas",
              width: 1000,
              height: 1000,
              items: [],
            },
          ],
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
          items: [
            {
              id: "https://example.org/canvas/2",
              type: "Canvas",
              width: 1000,
              height: 1000,
              items: [],
            },
          ],
        }),
        "utf8"
      );

      const stdout: string[] = [];
      const stderr: string[] = [];

      const code = await runCli(["validate-p4", dir], {
        readFileText: async (path) => readFile(path, "utf8"),
        writeFileText: async () => {
          return;
        },
        fetchJson: async () => {
          throw new Error("not used");
        },
        stdout: (line) => stdout.push(line),
        stderr: (line) => stderr.push(line),
      });

      expect(code).toBe(1);
      expect(stderr).toEqual([]);
      expect(stdout.some((line) => line.includes("SKIP") && line.includes("collection.json"))).toBe(true);
      expect(stdout.some((line) => line.includes("SUMMARY scanned=4 validated=3 skipped=1 valid=2 invalid=1"))).toBe(
        true
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
