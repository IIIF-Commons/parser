import { IdOrAtId, Prettify } from '../utility';

export type SearchService = IdOrAtId<string> & {
  '@context': 'http://iiif.io/api/search/1/context.json';
  profile: 'http://iiif.io/api/search/1/search' | 'SearchService1';
};

export type SearchServiceQueryParams = {
  q?: string;
  motivation?: string;
  date?: string;
  user?: string;
};

export type SearchServiceAutocomplete = Prettify<
  IdOrAtId<string> & {
    profile: 'http://iiif.io/api/search/1/autocomplete' | 'AutoCompleteService1';
  }
>;

export type SearchServiceAutocompleteQueryParams = Prettify<
  SearchServiceQueryParams & {
    q: string;
    min?: number;
  }
>;

export type SearchServiceAutocompleteResponse = Prettify<
  IdOrAtId<string> & {
    '@context': 'http://iiif.io/api/search/1/context.json';
    '@type': 'search:TermList';
    ignored: string[];
    terms: Array<{
      match: string;
      url: string;
      count?: number;
      label?: string;
    }>;
  }
>;

export type SearchServiceSearchResponse = {
  '@context': 'http://iiif.io/api/presentation/3/context.json' | string[];
  '@id': string;
  '@type': 'sc:AnnotationList';
  resources: Array<{
    '@id': string;
    '@type': 'oa:Annotation';
    motivation: string;
    resource: SearchServiceCommonResources | any; // this is broad.
    on: SearchServiceSearchCommonSelectors | any | Array<SearchServiceSearchCommonSelectors> | Array<any>;
  }>;
  hits?: Array<{
    '@type': 'search:Hit';
    annotations: string[];
    selectors: Array<SearchServiceCommonHitSelectors>;
    match?: string;
    before?: string;
    after?: string;
  }>;
};
export type SearchServiceCommonHitSelectors = {
  '@type': 'oa:TextQuoteSelector';
  exact: string;
  prefix?: string;
  suffix?: string;
};

export type SearchServiceSearchCommonSelectors =
  | string
  | {
      '@id': string;
      within: { '@id': string; type: string; label: string };
    };

export type SearchServiceCommonResources = {
  '@type': 'cnt:ContentAsText';
  chars: string;
};
