import { IdOrAtId, Prettify } from '../utility';

export type AuthAccessTokenService = Prettify<
  IdOrAtId<string> & {
    profile: 'http://iiif.io/api/auth/1/token' | 'AuthTokenService1';
  }
>;

export type AuthAccessTokenServiceResponse = {
  accessToken: string;
  expiresIn?: number;
};

export type AuthAccessTokenServiceError = {
  error: 'invalidRequest' | 'missingCredentials' | 'invalidCredentials' | 'invalidOrigin' | 'unavailable';
  description?: string;
};

type AuthAbstractService = Prettify<
  IdOrAtId<string> & {
    label: string;
    confirmLabel?: string;
    header?: string;
    description?: string;
    failureHeader?: string;
    failureDescription?: string;
  }
>;

export type AuthClickThroughService = Prettify<
  IdOrAtId<string> & {
    profile: 'http://iiif.io/api/auth/1/clickthrough';
    service: AuthAccessTokenService;
  }
>;

export type AuthLogoutService = Prettify<
  AuthAbstractService & {
    profile: 'http://iiif.io/api/auth/1/logout' | 'AuthLogoutService1';
  }
>;

export type AuthLoginService = Prettify<
  AuthAbstractService & {
    profile: 'http://iiif.io/api/auth/1/login' | 'AuthCookieService1';
    service: Array<AuthLoginService | AuthLogoutService>;
  }
>;

export type AuthKioskService = Prettify<
  AuthAbstractService & {
    profile: 'http://iiif.io/api/auth/1/kiosk';
    service: AuthAccessTokenService;
  }
>;

export type AuthExternalService = Prettify<
  AuthAbstractService & {
    profile: 'http://iiif.io/api/auth/1/external';
    service: AuthAccessTokenService;
  }
>;

export type AuthService = AuthLoginService | AuthClickThroughService | AuthKioskService | AuthExternalService;
