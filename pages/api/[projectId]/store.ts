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
  const { sentry_client, sentry_version, sentry_key, projectId } = req.query;
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

  // TODO check clientToken/secureToken in query OR in Auth header
  console.log(req.query);
  console.log(req.headers.authorization);

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
