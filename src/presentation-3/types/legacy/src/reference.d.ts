import { Prettify } from './utility';

export type Reference<T = string> = Prettify<{
  type: T;
  id: string;
}>;

export type PolyEntity = Reference | string;
