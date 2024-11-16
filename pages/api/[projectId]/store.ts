import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../db";
import bodyParser from "body-parser";
import { runMiddleware, parseAuthString } from "../../../utils/server";
import { and, eq } from "drizzle-orm";
import { event } from "../../../db/schema";

type RavenPostBody = {
  event_id: string;
  exception?: {
    mechanism: {
      type: "onerror";
      handled: boolean;
    };
    values: {
      type: string; // Error
      value: string; // message
      stacktrace: {
        frames: {
          colno: number;
          filename: string;
          function: string;
          in_app: boolean;
          lineno: number;
        }[];
      };
    }[];
  };
  extra: {
    "session:duration"?: number;
  };
  logger: string;
  message?: string;
  platform: string;
  project: string;
  request: {
    headers: Record<string, string>;
    url: string;
  };
  transaction: string;
  breadcrumbs?: {
    values: {
      category: string;
      timestamp: number;
      message?: string;
      data?: Record<string, any>;
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

  await runMiddleware(req, res, bodyParser.text({ type: "*/*", limit: "1mb" }));
  let body: RavenPostBody;

  try {
    body = JSON.parse(req.body);
  } catch (err) {
    return res.status(400).end("Unable to decode body");
  }

  const { event_id, exception, extra, logger, platform, breadcrumbs } = body;
  const { projectId } = req.query;
  if (Number(projectId) === 5) {
    console.log("store", body);
  }

  const sentryQuery = req.headers["x-sentry-auth"]
    ? parseAuthString(String(req.headers["x-sentry-auth"]))
    : req.query;
  const { sentry_client, sentry_version, sentry_key, sentry_secret } =
    sentryQuery;
  const message = exception?.values?.[0].value ?? body.message ?? "";
  const stacktrace = exception?.values?.[0].stacktrace;
  const type = exception ? "EXCEPTION" : "MESSAGE";
  const meta = {
    breadcrumbs,
    sentry_client,
    sentry_version,
    extra,
    logger,
    platform,
  };

  // TODO make sure sentry_key/sentry_secret match project

  const existing = await db.query.event.findFirst({
    where: and(eq(event.id, event_id), eq(event.projectId, Number(projectId))),
  });

  if (existing) {
    await db
      .update(event)
      .set({
        // @ts-ignore
        count: existing.count + 1,
        lastEventAt: new Date().toISOString(),
        resolvedAt: null,
      })
      .where(eq(event.id, existing.id));
  } else {
    // @ts-ignore
    await db.insert(event).values({
      id: event_id,
      projectId: Number(projectId),
      message,
      meta,
      type,
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
