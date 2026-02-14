import { Prettify } from '../utility';

export type GeoJsonService = Prettify<
  {
    '@context': 'http://geojson.org/geojson-ld/geojson-context.jsonld';
    profile: never;
  } & (
    | {
        '@id': string;
      }
    | {
        id: string;
      }
  ) &
    Partial<import('geojson').GeoJSON>
>;
