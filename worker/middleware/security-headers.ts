import { createMiddleware } from "hono/factory";

const SECURITY_HEADERS = {
  // Prevents browsers from MIME-sniffing a response away from the declared content-type
  "X-Content-Type-Options": "nosniff",
  // Prevents the page from being rendered inside an iframe (clickjacking protection)
  "X-Frame-Options": "DENY",
  // Sends full URL as referrer for same-origin, only origin for cross-origin requests
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Forces HTTPS for 1 year — defense-in-depth since Cloudflare already handles TLS
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
} as const;

export const securityHeaders = createMiddleware(async (c, next) => {
  await next();

  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    c.res.headers.set(header, value);
  }
});
