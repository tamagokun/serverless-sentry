import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../db";
import bodyParser from "body-parser";

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

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

function parseAuthString(authString: string) {
  // format: Sentry sentry_version=7,sentry_client=sentry-cocoa/5.2.2,sentry_timestamp=1665405863,sentry_key=xxx,sentry_secret=xxx
  return authString
    .slice(7)
    .split(",")
    .reduce<Record<string, string>>((obj, pair) => {
      const [key, value] = pair.split("=");
      obj[key] = value;
      return obj;
    }, {});
}

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

  const existing = await prisma.event.findFirst({
    where: { message, projectId: Number(projectId) },
  });

  if (existing) {
    await prisma.event.update({
      where: { id: existing.id },
      data: {
        count: existing.count + 1,
        lastEventAt: new Date(),
      },
    });
  } else {
    await prisma.event.create({
      data: {
        id: event_id,
        projectId: Number(projectId),
        message,
        meta,
        type,
        stack: stacktrace,
      },
    });
  }

  return res.json({ success: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
