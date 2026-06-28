/** Routes that use a compact icon rail instead of the full sidebar on desktop. */
export function isImmersiveRoute(pathname: string) {
  return pathname.startsWith("/pos/terminal") || pathname === "/kds";
}
