export function buildAbsoluteUrl(route: string, params: Record<string, string>) {
  const paramEntries = Object.entries(params);
  const path = paramEntries.reduce((acc, [key, value]) => acc.replace(`$${key}`, value), route);
  const absoluteUrl = `${globalThis.location.origin}${path}`;
  return absoluteUrl;
}
