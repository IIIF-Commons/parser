import { expect } from "vitest";

const internalStringMarkers = ["vault://", "iiif-parser:", "__$UNSET$__"];
const normalizedArrayDefaults = new Set([
  "action",
  "annotations",
  "behavior",
  "homepage",
  "language",
  "motivation",
  "partOf",
  "provider",
  "provides",
  "rendering",
  "seeAlso",
  "selector",
  "service",
  "services",
  "supplementary",
  "thumbnail",
  "transform",
]);

export function expectPresentation4WireClean(
  value: unknown,
  options: { rejectAbstractContentResource?: boolean } = {}
): void {
  const visit = (node: unknown, path: string): void => {
    expect(node, `${path} must not contain null`).not.toBeNull();

    if (typeof node === "string") {
      for (const marker of internalStringMarkers) {
        expect(node.includes(marker), `${path} contains internal marker ${marker}`).toBe(false);
      }
      return;
    }

    if (Array.isArray(node)) {
      node.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }

    if (!node || typeof node !== "object") {
      return;
    }

    const resource = node as Record<string, unknown>;
    if (options.rejectAbstractContentResource) {
      expect(resource.type, `${path}.type must retain its authored concrete type`).not.toBe("ContentResource");
    }

    for (const [key, child] of Object.entries(resource)) {
      expect(key.startsWith("iiif-parser:"), `${path} contains internal property ${key}`).toBe(false);
      if (Array.isArray(child) && child.length === 0 && normalizedArrayDefaults.has(key)) {
        expect.fail(`${path}.${key} contains an empty normalized default`);
      }
      visit(child, `${path}.${key}`);
    }
  };

  visit(value, "$");
}
