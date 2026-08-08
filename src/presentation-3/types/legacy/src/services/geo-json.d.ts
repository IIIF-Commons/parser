import { Prettify } from "../utility";
import type { GeoJSON } from "../../../../../shared/geojson";
export type GeoJsonService = Prettify<
  {
    "@context": "http://geojson.org/geojson-ld/geojson-context.jsonld";
    profile: never;
  } & (
    | {
        "@id": string;
      }
    | {
        id: string;
      }
  ) &
    Partial<GeoJSON>
>;
