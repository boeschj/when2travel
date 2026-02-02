export function buildAbsoluteUrl(route: string, params: Record<string, string>) {
  const path = Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`$${key}`, value),
    route
  )
  return `${window.location.origin}${path}`
}
