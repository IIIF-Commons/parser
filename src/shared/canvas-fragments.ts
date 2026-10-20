export function splitCanvasFragment(originalUrl?: string): string[] {
  const [url, fragment] = (originalUrl || "").split("#");
  if (!fragment || !isValidCanvasFragment(fragment)) {
    return [originalUrl || "", ""] as const;
  }
  return [url as string, fragment] as const;
}

export function isValidCanvasFragment(fragment: string): boolean {
  return /(?:^|&)(?:xywh|t)=/.test(fragment);
}
