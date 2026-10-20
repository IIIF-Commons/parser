import audio from "../../fixtures/presentation-2/wellcome-ixif-audio.json";
import video from "../../fixtures/presentation-2/wellcome-ixif-video.json";
import { convertPresentation2 } from "../../src/presentation-2";
import { normalize, serialize, serializeConfigPresentation3 } from "../../src";

describe("legacy IxIF audio and video (#14)", () => {
  test.each([
    [audio, "Sound", 74.057144],
    [video, "Video", 1180],
  ] as const)("upgrades the real Wellcome $1 manifest", (input, type, duration) => {
    const upgraded = convertPresentation2(structuredClone(input)) as any;
    expect(upgraded.items).toHaveLength(1);
    const canvas = upgraded.items[0];
    expect(canvas).toMatchObject({ type: "Canvas", duration });
    const annotation = canvas.items[0].items[0];
    expect(annotation).toMatchObject({ type: "Annotation", motivation: "painting", target: canvas.id });
    const bodies = annotation.body.type === "Choice" ? annotation.body.items : [annotation.body];
    expect(bodies.every((body: any) => body.type === type && body.duration === duration)).toBe(true);
    expect(bodies.map((body: any) => body.id)).toEqual(
      [input.mediaSequences[0]!.elements[0]!.rendering].flat().map((body) => body["@id"])
    );
    expect(bodies.every((body: any) => body.id !== canvas.id)).toBe(true);
    expect(canvas.thumbnail[0].id).toBe(input.mediaSequences[0]!.elements[0]!.thumbnail);
    if (type === "Video") expect(canvas).toMatchObject({ width: 720, height: 720 });
    const result = normalize(structuredClone(upgraded));
    const output = serialize<any>({ ...result, requests: {} }, result.resource, serializeConfigPresentation3);
    expect(output.items[0].duration).toBe(duration);
    expect(output.items[0].items[0].items[0].body).toMatchObject({ type: annotation.body.type });
  });

  test("retains real image sequences and keeps the placeholder for unsupported media", () => {
    const input = structuredClone(audio) as any;
    input.sequences.push({
      "@type": "sc:Sequence",
      canvases: [{ "@id": "https://example.org/cover", "@type": "sc:Canvas", label: "Cover", width: 1, height: 1 }],
    });
    expect((convertPresentation2(structuredClone(input)) as any).items.map((item: any) => item.id)).toContain(
      "https://example.org/cover"
    );
    input.mediaSequences[0].elements[0]["@type"] = "foaf:Document";
    input.mediaSequences[0].elements[0].format = "application/pdf";
    const unsupported = convertPresentation2(input) as any;
    expect(unsupported.items).toHaveLength(2);
    expect(unsupported.items[0].id).toContain("ixif-message");
  });

  test("does not invent a duration when the media length is unavailable", () => {
    const input = structuredClone(audio) as any;
    input.mediaSequences[0].elements[0].metadata = [];
    const output = convertPresentation2(input) as any;
    expect(output.items[0].id).toContain("ixif-message");
    expect(output.items[0].duration).toBeUndefined();
  });
});
