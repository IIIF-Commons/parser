/**
 * IIIF Presentation API 4.0 - Transform Types
 *
 * This file defines TypeScript types for 3D transform resources in Presentation 4.
 * These are used for positioning, rotating, and scaling resources within Scenes.
 * See: https://preview.iiif.io/api/prezi-4/presentation/4.0/model/#transforms
 */

// Base Transform type
export interface TransformBase {
  id?: string;
  type: string;
  label?: any;
}

// RotateTransform: rotates a resource around x, y, z axes (degrees)
export interface RotateTransform extends TransformBase {
  type: 'RotateTransform';
  x?: number; // degrees, default 0
  y?: number; // degrees, default 0
  z?: number; // degrees, default 0
}

// ScaleTransform: scales a resource along x, y, z axes (multiplicative)
export interface ScaleTransform extends TransformBase {
  type: 'ScaleTransform';
  x?: number; // scale factor, default 1
  y?: number; // scale factor, default 1
  z?: number; // scale factor, default 1
}

// TranslateTransform: moves a resource along x, y, z axes (units)
export interface TranslateTransform extends TransformBase {
  type: 'TranslateTransform';
  x?: number; // units, default 0
  y?: number; // units, default 0
  z?: number; // units, default 0
}

// Union type for all transforms
export type Transform =
  | RotateTransform
  | ScaleTransform
  | TranslateTransform;

// Array of transforms (applied in order)
export type TransformList = Transform[];

// Utility type guard
export function isTransform(obj: any): obj is Transform {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.type === 'string' &&
    (
      obj.type === 'RotateTransform' ||
      obj.type === 'ScaleTransform' ||
      obj.type === 'TranslateTransform'
    )
  );
}
