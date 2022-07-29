export function getType(resource: any) {
  if (resource['@type']) {
    return resource['@type'];
  }
  if (resource.type) {
    return resource.type;
  }

  return undefined;
}
