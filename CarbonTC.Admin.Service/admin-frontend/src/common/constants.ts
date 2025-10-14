// src/routes/routes.config.ts

/**
 * Base path để dễ deploy dưới subpath (vd: /admin).
 * Để trống "" nếu app chạy ở root domain.
 * Configure qua VITE_ADMIN_BASE_PATH trong file .env
 */
export const BASE_PATH = import.meta.env.VITE_ADMIN_BASE_PATH ?? '';

/**
 * Tiện ích nối path chuẩn hóa dấu gạch chéo
 * @internal
 */
const join = (...parts: string[]) =>
  parts
    .join('/')
    .replace(/\/\/+/g, '/')
    .replace(/\/+$/g, '')
    .replace(/^\/?/, '/');

/**
 * Route paths cho Admin Service
 */
export const ROUTES = {
  ADMIN: {
    BASE: join(BASE_PATH, ''),
    DASHBOARD: join(BASE_PATH, 'dashboard'),
    LISTING_AND_ORDERS: join(BASE_PATH, 'listing-and-orders'),

    USERS: join(BASE_PATH, 'users'),
    // USER_DETAIL: join(BASE_PATH, 'users/:id'),

    DISPUTES: join(BASE_PATH, 'disputes'),
    // DISPUTE_DETAIL: join(BASE_PATH, 'disputes/:id'),

    REPORTS: join(BASE_PATH, 'reports'),

    CERTIFICATES: join(BASE_PATH, 'certificates'),
    // CERTIFICATE_DETAIL: join(BASE_PATH, 'certificates/:id'),

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

/**
 * Build dynamic route path by replacing parameters
 * @example
 * buildPath("/users/:id", { id: "abc123" }) // "/users/abc123"
 * buildPath("/disputes/:disputeId/messages/:msgId", {
 *   disputeId: "d1",
 *   msgId: "m1"
 * }) // "/disputes/d1/messages/m1"
 */
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

/**
 * Type-safe route path getter with optional params
 * @example
 * getRoutePath('DASHBOARD') // "/admin/dashboard"
 * getRoutePath('USER_DETAIL', { id: '123' }) // "/admin/users/123"
 */
export function getRoutePath(
  routeKey: AdminRouteKey,
  params?: Record<string, string | number>,
): string {
  const path = ROUTES.ADMIN[routeKey];

  if (!params) return path;

  return buildPath(path, params);
}
