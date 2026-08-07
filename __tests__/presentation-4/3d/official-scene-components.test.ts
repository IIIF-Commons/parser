import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { normalize, serialize, serializeConfigPresentation4 } from "../../../src/presentation-4";
import { validateAuthoredPresentation4 } from "../../../src/presentation-4/validator";
import { expectPresentation4WireClean } from "../serialization/assert-presentation-4-wire";

const fixtureDirectory = join(import.meta.dirname, "../fixtures/official/3d");
const fixtureNames = [
  "04_scene.json",
  "uc06_3d.json",
  "uc06_3d_annotation.json",
  "uc06_audio_with_3d.json",
  "uc06_canvas_in_scene.json",
  "uc06_multiple_3d_objects.json",
  "uc06_scene_in_scene.json",
  "uc08_3d_annotation.json",
  "uc08_3d_comments_with_cameras.json",
];

function readFixture(name: string): any {
  return JSON.parse(readFileSync(join(fixtureDirectory, name), "utf8"));
}

function normalizeAndSerialize(resource: any) {
  const normalized = normalize(resource);
  const serialized = serialize<any>(
    {
      entities: normalized.entities as any,
      mapping: normalized.mapping as any,
      requests: {},
    },
    normalized.resource,
    serializeConfigPresentation4
  );
  return { normalized, serialized };
}

function findByType(resource: any, type: string): any[] {
  const matches: any[] = [];
  const visit = (value: any) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== "object") {
      return;
    }
    if (value.type === type) {
      matches.push(value);
    }
    Object.values(value).forEach(visit);
  };
  visit(resource);
  return matches;
}

describe("official Presentation 4 3D corpus", () => {
  test.each(fixtureNames)("validates and stabilizes %s through normalize/serialize", (name) => {
    const input = readFixture(name);
    const inputReport = validateAuthoredPresentation4(input, { mode: "strict" });
    expect(inputReport.valid, JSON.stringify(inputReport.issues, null, 2)).toBe(true);

    const first = normalizeAndSerialize(input);
    const outputReport = validateAuthoredPresentation4(first.serialized, { mode: "strict" });
    expect(outputReport.valid, JSON.stringify(outputReport.issues, null, 2)).toBe(true);
    expectPresentation4WireClean(first.serialized, { rejectAbstractContentResource: true });

    const second = normalizeAndSerialize(first.serialized);
    expect(second.serialized).toEqual(first.serialized);
  });

  test("normalizes and restores audio sources, image-based lighting, lookAt, and selector refinement", () => {
    const input = readFixture("uc06_audio_with_3d.json");
    const { normalized, serialized } = normalizeAndSerialize(input);

    for (const type of ["AmbientAudio", "PointAudio", "SpotAudio"]) {
      const authored = findByType(input, type)[0];
      const output = findByType(serialized, type)[0];
      expect(output.source).toEqual(authored.source);
      expect(output.volume).toEqual(authored.volume);
    }

    const authoredSpotAudio = findByType(input, "SpotAudio")[0];
    const outputSpotAudio = findByType(serialized, "SpotAudio")[0];
    expect(outputSpotAudio.lookAt).toEqual(authoredSpotAudio.lookAt);
    expect(outputSpotAudio.angle).toBe(authoredSpotAudio.angle);

    const authoredLight = findByType(input, "ImageBasedLight")[0];
    const outputLight = findByType(serialized, "ImageBasedLight")[0];
    expect(outputLight.environmentMap).toEqual(authoredLight.environmentMap);

    const refinedSelector = findByType(serialized, "PointSelector").find((selector) => selector.refinedBy);
    expect(refinedSelector?.refinedBy).toEqual(expect.objectContaining({ type: "FragmentSelector" }));

    for (const component of [
      ...findByType(input, "AmbientAudio"),
      ...findByType(input, "PointAudio"),
      ...findByType(input, "SpotAudio"),
    ]) {
      expect(normalized.mapping[component.source.id]).toBe("ContentResource");
      expect(normalized.entities.ContentResource[component.source.id]).toMatchObject({
        id: component.source.id,
        type: "Audio",
      });
    }
    expect(normalized.mapping[authoredLight.environmentMap.id]).toBe("ContentResource");
    expect(normalized.entities.ContentResource[authoredLight.environmentMap.id]).toMatchObject({
      id: authoredLight.environmentMap.id,
      type: "Image",
    });
  });

  test("compacts a legacy embedded lookAt Annotation to its normalized reference", () => {
    const input = readFixture("uc06_3d_annotation.json");
    const authoredCamera = findByType(input, "PerspectiveCamera")[0];
    const lookAtAnnotation = findByType(input, "Annotation").find(
      (annotation) => annotation.id === authoredCamera.lookAt.id
    );
    authoredCamera.lookAt = structuredClone(lookAtAnnotation);

    const { normalized, serialized } = normalizeAndSerialize(input);
    const normalizedCamera = normalized.entities.ContentResource[authoredCamera.id] as any;
    const outputCamera = findByType(serialized, "PerspectiveCamera")[0];

    expect(normalizedCamera.lookAt).toEqual({ id: lookAtAnnotation.id, type: "Annotation" });
    expect(outputCamera.lookAt).toEqual({ id: lookAtAnnotation.id, type: "Annotation" });
  });

  test("preserves a TextualBody position as a nested SpecificResource", () => {
    const input = readFixture("uc08_3d_annotation.json");
    const { normalized, serialized } = normalizeAndSerialize(input);
    const authoredBody = findByType(input, "TextualBody")[0];
    const outputBody = findByType(serialized, "TextualBody")[0];
    const normalizedBody = normalized.entities.ContentResource[authoredBody.id] as any;
    const normalizedPosition = normalizedBody.position;

    expect(outputBody.position).toEqual(authoredBody.position);
    expect(normalizedPosition).toMatchObject({ type: "ContentResource" });
    expect(normalized.mapping[normalizedPosition.id]).toBe("ContentResource");
    expect(normalized.entities.ContentResource[normalizedPosition.id]).toMatchObject({
      type: "SpecificResource",
    });
    expect(findByType(outputBody.position, "PointSelector")).toHaveLength(1);
  });

  test("retains a normalized Annotation position for compatibility", () => {
    const input = readFixture("uc08_3d_annotation.json");
    const authoredBody = findByType(input, "TextualBody")[0];
    const authoredAnnotation = findByType(input, "Annotation").find(
      (annotation) => annotation.body?.type === "TextualBody"
    );
    authoredAnnotation.position = structuredClone(authoredBody.position);

    const { normalized, serialized } = normalizeAndSerialize(input);
    const normalizedAnnotation = normalized.entities.Annotation[authoredAnnotation.id] as any;
    const outputAnnotation = findByType(serialized, "Annotation").find(
      (annotation) => annotation.id === authoredAnnotation.id
    );

    expect(normalizedAnnotation.position).toMatchObject({ type: "ContentResource" });
    expect(outputAnnotation.position).toEqual(authoredAnnotation.position);
  });

  test("preserves a nested SpecificResource position without flattening it", () => {
    const input = readFixture("uc06_audio_with_3d.json");
    const authoredSpecificResource = findByType(input, "SpecificResource")[0];
    authoredSpecificResource.position = {
      type: "SpecificResource",
      source: {
        id: "https://iiif.io/api/presentation/4.0/example/uc06/scene/1",
        type: "Scene",
      },
      selector: [{ type: "PointSelector", x: 1, y: 2, z: 3 }],
    };
    authoredSpecificResource.scope = [{ id: "https://example.org/scope/1", type: "Scene" }];
    authoredSpecificResource.transform = [
      { type: "ScaleTransform", x: 2, y: 2, z: 2 },
      { type: "TranslateTransform", x: 1, y: 2, z: 3 },
    ];
    authoredSpecificResource.action = ["show", "select"];

    const { serialized } = normalizeAndSerialize(input);
    const outputSpecificResource = findByType(serialized, "SpecificResource").find((resource) => resource.position);

    expect(outputSpecificResource.position).toEqual(authoredSpecificResource.position);
    expect(outputSpecificResource.scope).toEqual(authoredSpecificResource.scope);
    expect(outputSpecificResource.transform).toEqual(authoredSpecificResource.transform);
    expect(outputSpecificResource.action).toEqual(authoredSpecificResource.action);
  });

  test("round-trips the complete normalized Scene property surface", () => {
    const input = readFixture("04_scene.json");
    const authoredScene = findByType(input, "Scene")[0];
    Object.assign(authoredScene, {
      duration: 60,
      spatialScale: { type: "Quantity", quantityValue: 0.01, unit: "m" },
      temporalScale: { type: "Quantity", quantityValue: 2, unit: "s" },
      backgroundColor: "#123456",
      interactionMode: ["orbit"],
      placeholderContainer: {
        id: "https://example.org/canvas/placeholder",
        type: "Canvas",
        height: 100,
        width: 100,
      },
      accompanyingContainer: {
        id: "https://example.org/timeline/accompanying",
        type: "Timeline",
        duration: 60,
      },
    });

    const { normalized, serialized } = normalizeAndSerialize(input);
    const outputScene = findByType(serialized, "Scene")[0];
    const normalizedScene = normalized.entities.Scene[authoredScene.id] as any;

    expect(normalizedScene).toMatchObject({
      duration: authoredScene.duration,
      spatialScale: authoredScene.spatialScale,
      temporalScale: authoredScene.temporalScale,
      backgroundColor: authoredScene.backgroundColor,
      interactionMode: authoredScene.interactionMode,
      placeholderContainer: expect.objectContaining({ type: "Canvas" }),
      accompanyingContainer: expect.objectContaining({ type: "Timeline" }),
    });
    expect(outputScene).toMatchObject({
      duration: authoredScene.duration,
      spatialScale: authoredScene.spatialScale,
      temporalScale: authoredScene.temporalScale,
      backgroundColor: authoredScene.backgroundColor,
      interactionMode: authoredScene.interactionMode,
      placeholderContainer: authoredScene.placeholderContainer,
      accompanyingContainer: authoredScene.accompanyingContainer,
    });
  });

  test("requires an environmentMap on ImageBasedLight", () => {
    const input = readFixture("uc06_multiple_3d_objects.json");
    delete findByType(input, "ImageBasedLight")[0].environmentMap;

    const report = validateAuthoredPresentation4(input);

    expect(report.valid).toBe(false);
    expect(report.issues).toContainEqual(
      expect.objectContaining({
        code: "class-requirement-must",
        resourceType: "ImageBasedLight",
        path: expect.stringMatching(/\.environmentMap$/),
      })
    );
  });
});
