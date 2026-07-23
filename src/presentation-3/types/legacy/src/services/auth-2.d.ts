// Based on IIIF Auth v2.0
// https://iiif.io/api/auth/2.0/

import { InternationalString } from '../iiif/descriptive';

/**
 * The user will be required to visit the user interface of an external authentication system
 */
type Active = 'active';

/**
 * The user will not be required to interact with an authentication system, the client is expected to use the access service automatically.
 */
type Kiosk = 'kiosk';

/**
 * The user is expected to have already acquired the authorizing aspect, and no access service will be used.
 */
type External = 'external';

export type AuthAccessService2 = AuthAccessService2_Active | AuthAccessService2_Kiosk | AuthAccessService2_External;

interface AuthAccessService2_Common {
  id: string;
  type: 'AuthAccessService2';

  // This wasn't clear in the spec. It looked like only `active` was allow to have a logout service.
  service:
    | [AuthAccessTokenService2]
    | [AuthAccessTokenService2, AuthLogoutService2]
    | [AuthLogoutService2, AuthAccessTokenService2];
}

/**
 * This pattern requires the user to interact in the opened tab. Typical scenarios are:
 *
 * - The user interface presents a login process, in which the user provides credentials to the
 *   content provider and the content provider sets an access cookie.
 * - The user interface presents a usage agreement, a content advisory notice, or some other form
 *   of clickthrough interaction in which credentials are not required, but deliberate confirmation of
 *   terms is required, to set an access cookie.
 * - The access service stores the result of a user interaction in browser local storage, which is
 *   later available to the token service.
 *
 */
export interface AuthAccessService2_Active extends AuthAccessService2_Common {
  profile: 'active';
  /** The name of the access service */
  label: InternationalString;
  /** Heading text to be shown with the user interface element that opens the access service. */
  heading?: InternationalString;
  /** Additional text to be shown with the user interface element that opens the access service. */
  note?: InternationalString;
  /** The label for the user interface element that opens the access service. */
  confirmLabel?: InternationalString;

  // See note above.
  // service:
  //   | [AuthAccessTokenService2]
  //   | [AuthAccessTokenService2, AuthLogoutService2]
  //   | [AuthLogoutService2, AuthAccessTokenService2];
}

/**
 * This pattern requires no user interaction in the opened tab. This pattern supports exhibitions,
 * in-gallery interactives and other IIIF user experiences on managed devices that are configured in
 * advance.
 *
 * For the kiosk pattern the interaction has the following steps:
 *
 * - There is no user interaction before opening the access service URI.
 * - he client must immediately open the URI from id with the added origin query parameter. This
 *   must be done in a new window or tab.
 * - After the opened window or tab is closed, the client must then use the related access token
 *   service, as described below.
 *
 * Non-user-driven clients simply access the URI from id to obtain any access cookie, and then use the related access token service, as described below.
 */
export interface AuthAccessService2_Kiosk extends AuthAccessService2_Common {
  profile: 'kiosk';
  // See note above.
  // service: [AuthAccessTokenService2];

  // This isn't mentioned in the specification, but is in the demos.
  label: InternationalString;
}

export interface AuthAccessService2_External extends AuthAccessService2_Common {
  profile: 'external';
  /** The name of the access service */
  label: InternationalString;

  // See note above.
  // service: [AuthAccessTokenService2];
}

export interface AuthAccessTokenService2 {
  id: string;
  type: 'AuthAccessTokenService2';
  /** Default heading text to render if an error occurs. If the access token service returns an error object, the heading property of the error object must be used instead if supplied */
  errorHeading?: InternationalString;
  /** Default additional text to render if an error occurs. If the access token service returns an error object, the note property of the error object must be used instead if supplied. If present, errorHeading must also be present */
  errorNote?: InternationalString;
}

export interface AuthAccessToken2 {
  '@context': 'http://iiif.io/api/auth/2/context.json';
  type: 'AuthAccessToken2';
  /** The message identifier supplied by the client. */
  messageId: string;
  /** The access token to be sent to the probe service. */
  accessToken: string;
  /** The number of seconds until the token ceases to be valid. */
  expiresIn: number;
}

export interface AuthAccessTokenError2 {
  '@context': 'http://iiif.io/api/auth/2/context.json';
  type: 'AuthAccessTokenError2';
  profile: 'invalidRequest' | 'invalidOrigin' | 'missingAspect' | 'expiredAspect' | 'unavailable';
  /** The message identifier supplied by the client. */
  messageId: string;
  heading?: InternationalString;
  note?: InternationalString;
}

export interface AuthProbeService2 {
  id: string;
  type: 'AuthProbeService2';
  profile?: string; // For compatibility with other services
  service: AuthAccessService2[];
  errorHeading?: InternationalString;
  errorNote?: InternationalString;
}

export interface Auth2LocationResource {
  id: string;
  type: string;
  service: any[];
}

export interface Auth2SubstituteResource {
  id: string;
  label: InternationalString;
  type: string;
  service: AuthProbeService2[];
}

export interface AuthProbeResult2 {
  '@context': 'http://iiif.io/api/auth/2/context.json';

  type: 'AuthProbeResult2';
  status: number;
  substitute: Auth2SubstituteResource;
  location: Auth2LocationResource;
  heading: InternationalString;
  note: InternationalString;
}

export interface AuthLogoutService2 {
  id: string;
  type: 'AuthLogoutService2';
  label: InternationalString;
}

export type AccessTokenServiceRequest<S extends AuthAccessTokenService2, Origin extends string> =
  | `${S['id']}?origin=${Origin}&messageId=${string}`
  | `${S['id']}?&messageId=${string}&origin=${Origin}`;
