// Based on: https://iiif.io/api/discovery/1.0/

import { InternationalString } from './iiif/descriptive';
import { Manifest } from './resources/manifest';
import { Prettify } from './utility';

export type ChangeDiscoveryActivityRequest = {
  startTime?: string; // xsd:dateTime
  summary?: string;
  actor?: ChangeDiscoveryActor;
  target?: ChangeDiscoveryBaseObject;
  object: ChangeDiscoveryBaseObject;
};

export type ChangeDiscoveryActivity = Prettify<
  {
    id: string;
    endTime: string; // xsd:dateTime
    startTime?: string; // xsd:dateTime
    summary?: string;
    actor?: ChangeDiscoveryActor;
    target?: ChangeDiscoveryBaseObject;
  } & (
    | {
        type: Exclude<ChangeDiscoveryActivityType, 'Move'>;
        object: ChangeDiscoveryBaseObject;
      }
    | {
        type: 'Move';
        object: ChangeDiscoveryBaseObject;
        target: ChangeDiscoveryBaseObject;
      }
  )
>;

export type ChangeDiscoveryBaseObject = {
  id: string;
  canonical?: string;
  name?: string; // Non-standard.
  type: 'Collection' | 'Manifest' | 'Canvas'; // Technically also: Range, Canvas etc.
  seeAlso?: ChangeDiscoverySeeAlso[];
  provider?: Manifest['provider'];
};

type ChangeDiscoveryActor = {
  id: string;
  type: 'Person' | 'Application' | 'Organization';
};

export type ChangeDiscoveryGenesisRequest = {
  ids: string[];
};

export type ChangeDiscoveryGenesisResponse = {
  prefix: string;
  ids: string[];
};

export type ChangeDiscoveryImplementationState = {
  processItems: any[];
  lastCrawl: number;
  onlyDelete: boolean;
};

export type ActivityCollectionProcessor = (
  collection: ActivityOrderedCollection,
  state: ChangeDiscoveryImplementationState
) => ChangeDiscoveryImplementationState;

export type ActivityPageProcessor = (
  page: ActivityOrderedCollectionPage,
  state: ChangeDiscoveryImplementationState
) => ChangeDiscoveryImplementationState;

export type ChangeDiscoveryActivityType = 'Create' | 'Update' | 'Delete' | 'Move' | 'Add' | 'Remove';

export type ChangeDiscoverySeeAlso = {
  id: string;
  type: 'Dataset';
  format: string;
  label: InternationalString;
  profile: string;
};

export type ActivityOrderedCollection = {
  '@context': 'http://iiif.io/api/discovery/1/context.json' | string[];
  id: string;
  type: 'OrderedCollection';
  first?: {
    id: string;
    type: 'OrderedCollectionPage';
  };
  last: {
    id: string;
    type: 'OrderedCollectionPage';
  };
  totalItems?: number;
  seeAlso?: ChangeDiscoverySeeAlso[];
  partOf?: Array<{
    id: string;
    type: 'OrderedCollection';
  }>;
  rights: string;
  // Non-standard
  totalPages?: number;
};

export type ActivityOrderedCollectionPage = {
  '@context': 'http://iiif.io/api/discovery/1/context.json' | string[];
  id: string;
  type: 'OrderedCollectionPage';
  partOf?: {
    id: string;
    type: 'OrderedCollection';
  };
  startIndex?: number;
  next?: {
    id: string;
    type: 'OrderedCollectionPage';
  };
  prev?: {
    id: string;
    type: 'OrderedCollectionPage';
  };
  orderedItems: ChangeDiscoveryActivity[];
};
