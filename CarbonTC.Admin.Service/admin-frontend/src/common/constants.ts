export const BASE_PATH = import.meta.env.VITE_ADMIN_BASE_PATH ?? '';

export const DRAWER_WIDTH = 240;
export const HEIGHT_HEADER_SIDE_BAR = 70;

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const join = (...parts: string[]) =>
  parts
    .join('/')
    .replace(/\/\/+/g, '/')
    .replace(/\/+$/g, '')
    .replace(/^\/?/, '/');

export const ROUTES = {
  ADMIN: {
    BASE: join(BASE_PATH, ''),
    DASHBOARD: join(BASE_PATH, 'dashboard'),
    LISTING_AND_ORDERS: join(BASE_PATH, 'listing-and-orders'),

    USERS: join(BASE_PATH, 'users'),
    USER_DETAIL: join(BASE_PATH, 'users/:id'),

    DISPUTES: join(BASE_PATH, 'disputes'),
    DISPUTE_DETAIL: join(BASE_PATH, 'disputes/:id'),

    REPORTS: join(BASE_PATH, 'reports'),

    CERTIFICATES: join(BASE_PATH, 'certificates'),
    CERTIFICATE_DETAIL: join(BASE_PATH, 'certificates/:id'),

    WALLET: join(BASE_PATH, 'wallet'),
    SETTINGS: join(BASE_PATH, 'settings'),
    PROFILE: join(BASE_PATH, 'profile'),
  },
  OTHER: {
    NOT_FOUND: '*',
  },
} as const;

export type AdminRouteKey = keyof typeof ROUTES.ADMIN;

export type AdminRoutePath = (typeof ROUTES.ADMIN)[AdminRouteKey];

export const toRelative = (absPath: string) => absPath.replace(/^\//, '');

export function buildPath<T extends Record<string, string | number>>(
  template: string,
  params: T,
): string {
  let result = template;

  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(new RegExp(`:${key}\\b`, 'g'), String(value));
  });

  if (import.meta.env.DEV) {
    const missingParams = result.match(/:\w+/g);
    if (missingParams) {
      console.warn(
        `[buildPath] Missing route params in "${template}": ${missingParams.join(', ')}`,
      );
    }
  }

  return result;
}

export function getRoutePath(
  routeKey: AdminRouteKey,
  params?: Record<string, string | number>,
): string {
  const path = ROUTES.ADMIN[routeKey];

  if (!params) return path;

  return buildPath(path, params);
}
