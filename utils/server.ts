import { NextApiRequest, NextApiResponse } from "next";

export function runMiddleware(
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

export function parseAuthString(authString: string) {
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
