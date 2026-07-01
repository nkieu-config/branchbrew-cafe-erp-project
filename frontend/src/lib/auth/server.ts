import { AUTH_ENDPOINTS } from "@/lib/endpoints/auth";
import "server-only";

import { cache } from "react";
import { serverFetchAPI } from "@/lib/api/server";
import type { SessionUser } from "@/types/auth";

export const getSession = cache(async (): Promise<SessionUser | null> => {
  return serverFetchAPI<SessionUser>(AUTH_ENDPOINTS.me);
});
