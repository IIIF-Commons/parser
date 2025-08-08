/**
 * Presentation API 4.0 Utilities
 *
 * This file contains utility functions and constants specific to the IIIF Presentation API 4.0 implementation.
 * Utilities here should be v4-specific or generic helpers that are not tightly coupled to v3 logic.
 *
 * As the implementation matures, consider extracting shared utilities to a common location if they are
 * useful for both v3 and v4.
 */

// Constants for v4 (add more as needed)
export const EMPTY_ARRAY: any[] = Object.freeze([]);
export const EMPTY_OBJECT: object = Object.freeze({});

// Utility: Check if an object is a plain object (not an array, function, etc.)
export function isPlainObject(obj: any): obj is Record<string, any> {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

// Utility: Deep freeze an object (for immutability)
export function deepFreeze<T>(obj: T): T {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    // @ts-ignore
    if (
      obj[prop] !== null &&
      (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') &&
      !Object.isFrozen(obj[prop])
    ) {
      // @ts-ignore
      deepFreeze(obj[prop]);
    }
  });
  return obj;
}

// Utility: Shallow clone (for safe mutation)
export function shallowClone<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.slice() as any;
  }
  if (isPlainObject(obj)) {
    return { ...obj };
  }
  return obj;
}

// Utility: Ensure value is an array
export function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

// Utility: No-op placeholder for future expansion
export function noop(..._args: any[]): void {}

// Add more v4-specific utilities as the implementation progresses.
