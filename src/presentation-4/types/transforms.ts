import type { LanguageMap } from './content-resources';

export interface TransformBase {
  id?: string;
  type: string;
  label?: LanguageMap;
}

export interface RotateTransform extends TransformBase {
  type: 'RotateTransform';
  x?: number;
  y?: number;
  z?: number;
}

export interface ScaleTransform extends TransformBase {
  type: 'ScaleTransform';
  x?: number;
  y?: number;
  z?: number;
}

export interface TranslateTransform extends TransformBase {
  type: 'TranslateTransform';
  x?: number;
  y?: number;
  z?: number;
}

export type Transform = RotateTransform | ScaleTransform | TranslateTransform;

export function isTransform(value: unknown): value is Transform {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const type = (value as { type?: string }).type;
  return type === 'RotateTransform' || type === 'ScaleTransform' || type === 'TranslateTransform';
}
