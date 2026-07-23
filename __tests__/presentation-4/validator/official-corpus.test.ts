import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { validateAuthoredPresentation4 } from "../../../src/presentation-4/validator";

const officialDirectory = join(import.meta.dirname, "../fixtures/official");
const officialFixtures = [
  "02_timeline.json",
  "05_fragment.json",
  "06_specific_resource.json",
  "07_collection.json",
  "08_range.json",
  "uc03_issue1.json",
  "uc07_duration_composite.json",
  "uc07_image_composite.json",
  "uc08_3d_comments_with_cameras.json",
];

describe("official Presentation 4 corpus", () => {
  test.each(officialFixtures)("accepts %s without changing it", (file) => {
    const input = JSON.parse(readFileSync(join(officialDirectory, file), "utf8"));
    const before = structuredClone(input);

    const report = validateAuthoredPresentation4(input);

    expect(report.valid, JSON.stringify(report.issues, null, 2)).toBe(true);
    expect(report.stats.errors).toBe(0);
    expect(input).toEqual(before);
  });
});
