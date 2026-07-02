import type { components } from './generated/api';

/** Auth user profile returned by POST /auth/login and GET /auth/me */
export type AuthUserResponse = components['schemas']['AuthUserResponseDto'];

/** Response body from POST /auth/login */
export type AuthLoginResponse = components['schemas']['AuthLoginResponseDto'];

/** Session user stored client-side after login */
export type SessionUser = AuthUserResponse;
