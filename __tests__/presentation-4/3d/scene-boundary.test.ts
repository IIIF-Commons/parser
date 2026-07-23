import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { normalize, serialize, serializeConfigPresentation4 } from "../../../src/presentation-4";
import { validateAuthoredPresentation4 } from "../../../src/presentation-4/validator";
import { expectPresentation4WireClean } from "../serialization/assert-presentation-4-wire";

const fixturePath = join(import.meta.dirname, "../fixtures/official/uc08_3d_comments_with_cameras.json");

function readFixture(): any {
  return JSON.parse(readFileSync(fixturePath, "utf8"));
}

function normalizeAndSerialize(resource: any): any {
  const normalized = normalize(resource);
  return serialize(
    {
      entities: normalized.entities as any,
      mapping: normalized.mapping as any,
      requests: {},
    },
    normalized.resource,
    serializeConfigPresentation4
  );
}

describe("Presentation 4 Scene preservation boundary", () => {
  test("strictly validates the official activating Annotation references without changing the input", () => {
    const input = readFixture();
    const before = structuredClone(input);

    const report = validateAuthoredPresentation4(input, { mode: "strict" });

    expect(report.valid).toBe(true);
    expect(report.stats.errors).toBe(0);
    expect(report.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: expect.stringMatching(/^\$\.annotations\[0\]\.items\[2\]\.(target|body\.source)(\.|$)/),
        }),
      ])
    );
    expect(input).toEqual(before);
  });

  test("accepts extension-bearing Annotation references without treating them as embedded Annotations", () => {
    const input = readFixture();
    const activating = input.annotations[0].items[2];
    activating.target["https://example.org/ns/hint"] = { role: "hotspot" };
    activating.body.source["https://example.org/ns/hint"] = { role: "camera" };

    const report = validateAuthoredPresentation4(input, { mode: "strict" });

    expect(report.valid).toBe(true);
    expect(report.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: expect.stringMatching(/^\$\.annotations\[0\]\.items\[2\]\.(target|body\.source)\.(body|target)$/),
        }),
      ])
    );
  });

  test("round-trips authored transform/action order and opaque camera data", () => {
    const input = readFixture();
    const modelBody = input.items[0].items[0].items[0].body;
    const cameraBody = input.items[0].items[0].items[1].body;

    modelBody.transform[1]["https://example.org/ns/precision"] = {
      degrees: 12.5,
      metadata: { authored: true },
    };
    cameraBody["https://example.org/ns/calibration"] = {
      lens: { coefficients: [1, 0.25, -0.01] },
      enabled: true,
    };

    const serialized = normalizeAndSerialize(input);
    const serializedModelBody = serialized.items[0].items[0].items[0].body;
    const serializedCameraBody = serialized.items[0].items[0].items[1].body;
    const activating = serialized.annotations[0].items[2];

    expect(serializedModelBody.transform.map((item: any) => item.type)).toEqual([
      "ScaleTransform",
      "RotateTransform",
      "TranslateTransform",
    ]);
    expect(serializedModelBody.transform[1]["https://example.org/ns/precision"]).toEqual({
      degrees: 12.5,
      metadata: { authored: true },
    });
    expect(serializedCameraBody).toMatchObject({
      type: "PerspectiveCamera",
      fieldOfView: 50,
      near: 0.1,
      far: 2000,
      "https://example.org/ns/calibration": {
        lens: { coefficients: [1, 0.25, -0.01] },
        enabled: true,
      },
    });
    expect(activating.body.action).toEqual(["show", "enable", "select"]);
    expect(activating.target).toEqual({
      id: "https://iiif.io/api/presentation/4.0/example/uc08/3d/commenting-anno-for-mandibular-tooth",
      type: "Annotation",
    });
    expect(activating.body.source).toEqual({
      id: "https://iiif.io/api/presentation/4.0/example/uc08/3d/anno-that-paints-desired-camera-to-view-tooth",
      type: "Annotation",
    });

    const report = validateAuthoredPresentation4(serialized, { mode: "strict" });
    expect(report.valid).toBe(true);
    expectPresentation4WireClean(serialized, { rejectAbstractContentResource: true });
  });
});
