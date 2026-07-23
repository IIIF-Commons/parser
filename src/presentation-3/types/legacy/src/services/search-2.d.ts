// Based on: https://iiif.io/api/search/2.0/

import { InternationalString } from '../iiif/descriptive';
import { Annotation, TextQuoteSelector } from '../resources/annotation';
import { AnnotationCollection } from '../resources/annotationCollection';
import { AnnotationPage } from '../resources/annotationPage';
import { Prettify } from '../utility';

// https://iiif.io/api/registry/motivations/
export interface Search2QueryParams {
  q?: string;
  motivation?: 'contextualizing' | 'highlighting' | 'commenting' | 'tagging';
  date?: string;
  user?: string;
}

export interface Search2AutocompleteQueryParams extends Search2QueryParams {
  min?: number;
}

export type Search2AnnotationPage = Prettify<
  AnnotationPage & {
    /** The Annotation Page must have a partOf property. The value is a JSON object, which is the embedded Annotation Collection resource, following the structure defined below. */
    partOf: Prettify<
      AnnotationCollection & {
        total?: number;
        first: { id: string; type: 'AnnotationPage' };
        last?: { id: string; type: 'AnnotationPage' };
      }
    >;
    /**
     * The Annotation Page may have a startIndex property, which is the position of the first Annotation in this page’s items list, relative to the overall ordering of Annotations across all pages within the Annotation Collection. The value is a zero-based integer.
     */
    startIndex?: number;
    next?: { id: string; type: 'AnnotationPage' };
    prev?: { id: string; type: 'AnnotationPage' };
    /** If the server has ignored any of the parameters in the request, then an ignored property must be present, and must contain a list of the ignored parameters. Servers may omit ignored query parameters from the id of the Annotation Page. */
    ignored?: string[];
    /**
     * Clients may require additional information about the matches in order to generate a rich user experience for search. This additional
     * information about matches in search results is provided by further Annotations in a property called annotations. This structure
     *  maintains the distinction in the Presentation API, where the main content annotations are listed in items and additional
     * annotations such as comments are listed in annotations. The value of annotations is an array containing a single Annotation
     * Page, in which all of the Annotations reference Annotations in the items property.
     */
    annotations?: AnnotationPage[];
  }
>;

export type Search2ContextualizingAnnotation = Prettify<
  Annotation & {
    motivation: 'contextualizing';
    target: {
      type: 'SpecificResource';
      source: string;
      selector: TextQuoteSelector[];
    };
  }
>;

export interface TermPage {
  '@context': 'http://iiif.io/api/search/2/context.json';
  type: 'TermPage';
  ignored?: string[];
  items: Term;
}

/*
Term resources have the following properties:

type - The Term may have a type property. If present, the value must be Term. The use of the property is not recommended to keep the response shorter.
value - The Term must have a value property. The value is a the string form of the term.
total - The Term may have a total property. The value is an integer, which is the number of times the term occurs in the index.
label - The Term may have a label property. The value is a JSON object which follows the definition of a language map. This label should be displayed to the user instead of the value, for example when the value is a URI or a string that has been manipulated with stemming or other normalization.
language - The Term may have a language property. The value is a string conforming to the BCP 47 language code specification, and gives the language of the term string in the value property.
service - The Term may have a service property. The value is an array of JSON objects, where each object is a Service. The Term must include an entry for the full link to the related SearchService2, when the value cannot be used directly in the q parameter. In this case, the id of the service is the full link including the q and other parameters.
*/
export interface Term {
  /** The Term may have a type property. If present, the value must be Term. The use of the property is not recommended to keep the response shorter. */
  type: 'Term';
  /** The Term must have a value property. The value is a the string form of the term. */
  value: string;
  /** The Term may have a total property. The value is an integer, which is the number of times the term occurs in the index. */
  total?: number;
  /** The Term may have a label property. The value is a JSON object which follows the definition of a language map. This label should be displayed to the user instead of the value, for example when the value is a URI or a string that has been manipulated with stemming or other normalization. */
  label?: InternationalString;
  /** The Term may have a language property. The value is a string conforming to the BCP 47 language code specification, and gives the language of the term string in the value property. */
  language?: string;
  /** The Term may have a service property. The value is an array of JSON objects, where each object is a Service. The Term must include an entry for the full link to the related SearchService2, when the value cannot be used directly in the q parameter. In this case, the id of the service is the full link including the q and other parameters. */
  service?: Search2Service[];
}

// An alias
export type Search2AutocompleteResponse = TermPage;

export interface AutoCompleteService2 {
  id: string;
  type: 'AutoCompleteService2';
  label?: InternationalString;
}

export interface Search2Service {
  id: string;
  type: 'SearchService2';
  profile?: string; // For compatibility with other services
  label?: InternationalString;
  service?: [AutoCompleteService2];
}
