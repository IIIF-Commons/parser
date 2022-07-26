export function removeUndefinedProperties(obj: any) {
  for (const prop in obj) {
    if (typeof obj[prop] === 'undefined' || obj[prop] === null) {
      delete obj[prop];
    }
  }
  return obj;
}
