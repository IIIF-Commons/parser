export type Required<T> = Prettify<T extends object ? { [P in keyof T]-?: NonNullable<T[P]> } : T>;

export type SomeRequired<T, K extends keyof T> = Prettify<
  (T extends object ? { [P in K]-?: NonNullable<T[P]> } : T) & Partial<Pick<Required<T>, Exclude<keyof T, K>>>
>;

export type OmitProperties<T, K extends keyof T> = Prettify<Pick<T, Exclude<keyof T, K>>>;

export type JsonLDContext = {
  '@context'?: string | string[];
};

export type IdOrAtId<T> = { id: T } | { '@id': T };

interface Nothing {}
type Union<T, U> = T | (U & Nothing);

export type LiteralUnion<T extends string> = T | Union<string, T>;

export type Prettify<T> = { [K in keyof T]: T[K] } & unknown;
