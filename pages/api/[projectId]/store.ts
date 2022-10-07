import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../db";

type RavenPostBody = {
  event_id: string;
  exception: {
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
  platform: string;
  project: string;
  request: {
    headers: Record<string, string>;
    url: string;
  };
  transaction: string;
};

// /api/0/store/?sentry_version&sentry_client&sentry_key
export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { event_id, exception, extra, logger, platform } =
    req.body as RavenPostBody;
  const { sentry_client, sentry_version, sentry_key, projectId } = req.query;
  const message = exception.values?.[0].value;
  const stacktrace = exception.values?.[0].stacktrace;
  const meta = {
    sentry_client,
    sentry_version,
    extra,
    logger,
    platform,
  };

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
        stack: stacktrace,
      },
    });
  }

  return res.json({ success: true });
}
