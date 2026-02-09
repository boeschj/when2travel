import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import escapeHtml from "escape-html";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { logger } from "hono/logger";

import { plans } from "./db/schema";
import type { Bindings } from "./lib/env";
import { dbMiddleware } from "./middleware/db";
import { securityHeaders } from "./middleware/security-headers";
import { plansRoutes } from "./routes/plans";
import { responsesRoutes } from "./routes/responses";

const PRODUCTION_ORIGINS = [
  "https://planthetrip.huskers15.workers.dev",
  "https://justplanthetrip.com",
  "https://www.justplanthetrip.com",
];

const DEV_ORIGINS = ["http://localhost:5173", "http://localhost:8787", "http://localhost:8788"];

const BASE_URL = "https://justplanthetrip.com";

type OgVariant = "respond" | "results";

function getAllowedOrigins(environment: string): string[] {
  const isDevelopment = environment !== "production";
  return isDevelopment ? [...PRODUCTION_ORIGINS, ...DEV_ORIGINS] : PRODUCTION_ORIGINS;
}

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", logger());
app.use("*", securityHeaders);
app.use(
  "*",
  createMiddleware<{ Bindings: Bindings }>(async (c, next) => {
    const allowedOrigins = getAllowedOrigins(c.env.ENVIRONMENT);
    const corsHandler = cors({
      origin: allowedOrigins,
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    });
    return corsHandler(c, next);
  }),
);
app.use("/api/*", dbMiddleware);

const api = new Hono<{ Bindings: Bindings }>()
  .route("/plans", plansRoutes)
  .route("/responses", responsesRoutes)
  .get("/health", c => {
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

app.route("/api", api);

function formatDateRange(startRange: string, endRange: string) {
  const startDate = new Date(startRange);
  const endDate = new Date(endRange);
  const formattedStart = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const formattedEnd = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return { formattedStart, formattedEnd };
}

function buildOgTitle(planName: string, variant: OgVariant) {
  if (variant === "respond") {
    return `Join ${planName} on PlanTheTrip`;
  }
  return `${planName} - PlanTheTrip`;
}

function buildOgDescription(
  numDays: number,
  formattedStart: string,
  formattedEnd: string,
  variant: OgVariant,
) {
  if (variant === "respond") {
    return `Add your availability for the ${numDays}-day trip between ${formattedStart} and ${formattedEnd}!`;
  }
  return `View availability for the ${numDays}-day trip between ${formattedStart} and ${formattedEnd}.`;
}

function buildOgUrl(planId: string, variant: OgVariant) {
  if (variant === "respond") {
    return `${BASE_URL}/plan/${planId}/respond`;
  }
  return `${BASE_URL}/plan/${planId}`;
}

function replaceMetaTags(
  html: string,
  unsafeTitle: string,
  unsafeDescription: string,
  url: string,
) {
  const title = escapeHtml(unsafeTitle);
  const description = escapeHtml(unsafeDescription);

  return html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta property="og:title" content=".*?" \/>/,
      `<meta property="og:title" content="${title}" />`,
    )
    .replace(
      /<meta property="og:description" content=".*?" \/>/,
      `<meta property="og:description" content="${description}" />`,
    )
    .replace(
      /<meta property="og:url" content=".*?" \/>/,
      `<meta property="og:url" content="${url}" />`,
    )
    .replace(
      /<meta name="twitter:title" content=".*?" \/>/,
      `<meta name="twitter:title" content="${title}" />`,
    )
    .replace(
      /<meta name="twitter:description" content=".*?" \/>/,
      `<meta name="twitter:description" content="${description}" />`,
    )
    .replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${description}" />`,
    );
}

async function fetchIndexHtml(env: Bindings, requestUrl: string) {
  const assetResponse = await env.ASSETS.fetch(new Request(new URL("/", requestUrl)));
  return assetResponse.text();
}

async function fetchPlanById(env: Bindings, planId: string) {
  const db = drizzle(env.planthetrip_d1);
  const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
  return plan;
}

async function buildOgHtml(env: Bindings, requestUrl: string, planId: string, variant: OgVariant) {
  const plan = await fetchPlanById(env, planId);
  const html = await fetchIndexHtml(env, requestUrl);

  if (!plan) {
    return html;
  }

  const { formattedStart, formattedEnd } = formatDateRange(plan.startRange, plan.endRange);
  const title = buildOgTitle(plan.name, variant);
  const description = buildOgDescription(plan.numDays, formattedStart, formattedEnd, variant);
  const url = buildOgUrl(planId, variant);

  return replaceMetaTags(html, title, description, url);
}

async function servePlanPage(
  env: Bindings,
  requestUrl: string,
  planId: string,
  variant: OgVariant,
) {
  try {
    const html = await buildOgHtml(env, requestUrl, planId, variant);
    return new Response(html, { headers: { "Content-Type": "text/html" } });
  } catch {
    const fallbackHtml = await fetchIndexHtml(env, requestUrl);
    return new Response(fallbackHtml, { headers: { "Content-Type": "text/html" } });
  }
}

app.get("/plan/:planId/respond", async c => {
  const planId = c.req.param("planId");
  return servePlanPage(c.env, c.req.url, planId, "respond");
});

app.get("/plan/:planId", async c => {
  const planId = c.req.param("planId");
  return servePlanPage(c.env, c.req.url, planId, "results");
});

app.get("*", c => c.env.ASSETS.fetch(c.req.raw));

app.notFound(c => {
  return c.json({ error: "Not Found" }, 404);
});

app.onError((err, c) => {
  console.error(`Error: ${err.message}`, err.stack);
  return c.json({ error: "Internal Server Error" }, 500);
});

export type AppType = typeof api;

export default app;
