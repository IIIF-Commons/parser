export function getId(resource: any) {
  if (resource['@id']) {
    return resource['@id'];
  }

  if (resource.id) {
    return resource.id;
  }

  return undefined;
}
