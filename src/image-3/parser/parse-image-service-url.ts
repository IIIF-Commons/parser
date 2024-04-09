export function parseImageServiceUrl(canonicalId: string, prefix = '') {
  const parsedUrl = canonicalId.match(/^(([a-zA-Z]+):\/\/([^/]+))?((.*)+)/);
  if (!parsedUrl) {
    throw new Error(`Invalid or unknown input ${canonicalId}`);
  }
  const scheme = parsedUrl[2];
  const server = parsedUrl[3];
  let path = parsedUrl[4]!;
  if (path[0] === '/') {
    path = path.substring(1);
  }
  if (prefix.length > 0) {
    if (prefix[0] === '/') {
      prefix = prefix.substring(1);
    }
    if (prefix !== path.substring(0, prefix.length)) {
      throw new Error(`Path does not start with prefix (path: ${path}, prefix: ${prefix})`);
    }
    path = path.substring(prefix.length);
  }

  return {
    scheme,
    server,
    path,
    prefix,
  } as {
    scheme: string;
    server: string;
    path: string;
    prefix: string;
  };
}
