import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../db";
import type { Readable } from "node:stream";
import zlib from "node:zlib";

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

function getBody(body: string) {
  let parsedBody = null;

  const tests = [
    () => body,
    () => {
      return zlib.inflateSync(Buffer.from(body, "base64")).toString();
    },
    // () => body.toString("utf8"), // raw json
    // () => zlib.inflateSync(body).toString(),
    // () => body.toString("base64"),
  ];

  for (const testString of tests) {
    try {
      const stringValue = testString();
      //   console.log(stringValue);
      parsedBody = JSON.parse(stringValue);
      return parsedBody;
    } catch (err) {
      //   console.log(err);
      parsedBody = null;
    }
  }

  return parsedBody;
}

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// /api/0/store/?sentry_version&sentry_client&sentry_key
export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  console.log(req.headers["content-encoding"]);
  console.log(req.headers["content-type"]);

  //   console.log(req.headers);
  const bodyBuffer = await buffer(req);
  const rawBody = bodyBuffer.toString("utf-8");

  //   console.log(zlib.inflateSync(bodyBuffer).toString());

  const body: RavenPostBody = getBody(rawBody);
  if (!body) {
    // console.log(rawBody);
    return res.status(400).end("Unable to decode body");
  }

  const { event_id, exception, extra, logger, platform, breadcrumbs } = body;
  const { sentry_client, sentry_version, sentry_key, projectId } = req.query;
  const message = exception?.values?.[0].value ?? body.message ?? "";
  const stacktrace = exception?.values?.[0].stacktrace;
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
