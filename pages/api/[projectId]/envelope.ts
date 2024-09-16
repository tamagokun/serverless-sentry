import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../db";
import bodyParser from "body-parser";
import { runMiddleware, parseAuthString } from "../../../utils/server";
import { and, eq } from "drizzle-orm";
import { event } from "../../../db/schema";
import { Breadcrumb, StackFrame } from "../../../types";

type SentryPostBody = {
  event_id: string;
  sent_at: string;
  sdk: {
    name: string;
    version: string;
    integrations?: string[];
    packages?: { name: string; version: string }[];
  };
  trace: {
    environment: string;
    release: string;
    public_key: string;
    trace_id: string;
    replay_id: string;
    sample_rate: string;
    transaction: string;
    sampled: string;
  };
  type: string;
  contexts: {
    trace: {
      data: {};
      op: string;
      span_id: string;
      tags: Record<string, any>;
      trace_id: string;
      origin: string;
    };
  };
  spans: {
    data: Record<string, any>;
    description: string;
    op: string;
    parent_span_id: string;
    span_id: string;
    start_timestamp: number;
    timestamp: number;
    trace_id: string;
    origin: string;
  }[];
  start_timestamp: number;
  tags: Record<string, any>;
  timestamp: number;
  transaction: string;
  transaction_info: Record<string, any>;
  measurements: Record<string, { value: number; unit: string }>;
  platform: string;
  request: {
    url: string;
    headers: Record<string, string>;
  };
  environment: string;
  release: string;
  breadcrumbs: Breadcrumb[];
  exception?: {
    values: {
      type: string;
      value: string;
      stacktrace: {
        frames: StackFrame[];
      };
      mechanism: {
        type: string;
        handled: boolean;
        data: Record<string, any>;
      };
    }[];
  };
};

// /api/0/store/?sentry_version&sentry_client&sentry_key
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  await runMiddleware(req, res, bodyParser.text({ type: "*/*", limit: "2mb" }));
  let body: SentryPostBody;

  try {
    const chunks = req.body.split("\n");
    for (const chunk of chunks) {
      body = {
        ...(body ?? {}),
        ...JSON.parse(chunk),
      };
    }
  } catch (err) {
    return res.status(400).end("Unable to decode body");
  }

  const ignoreTypes = ["session", "client_report", "transaction"];

  const { event_id, platform, release, breadcrumbs, tags, type, exception } =
    body;
  const { projectId } = req.query;

  if (ignoreTypes.includes(type)) {
    return res.json({ success: true });
  }

  const sentryQuery = req.headers["x-sentry-auth"]
    ? parseAuthString(String(req.headers["x-sentry-auth"]))
    : req.query;
  const { sentry_client, sentry_version, sentry_key, sentry_secret } =
    sentryQuery;
  const message = exception?.values?.[0].value ?? "";
  const stacktrace = exception?.values?.[0].stacktrace;
  const eventType = exception ? "EXCEPTION" : "MESSAGE";
  const meta = {
    breadcrumbs,
    sentry_client,
    sentry_version,
    release,
    tags,
    platform,
  };

  // TODO make sure sentry_key/sentry_secret match project
  // TODO better fingerprinting for event "count" metrics
  // TODO do we want to support perf metrics? i.e. transactions?

  const existing = await db.query.event.findFirst({
    where: and(eq(event.id, event_id), eq(event.projectId, Number(projectId))),
  });

  if (existing) {
    await db
      .update(event)
      .set({
        count: existing.count + 1,
        lastEventAt: new Date().toISOString(),
        resolvedAt: null,
      })
      .where(eq(event.id, existing.id));
  } else {
    await db.insert(event).values({
      id: event_id,
      projectId: Number(projectId),
      message,
      meta,
      type: eventType,
      stack: stacktrace,
    });
  }

  return res.json({ success: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
