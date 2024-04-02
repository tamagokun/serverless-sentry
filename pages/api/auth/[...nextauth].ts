import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "../../../db";
import { and, eq } from "drizzle-orm";
import { token } from "../../../db/schema";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        token: { label: "Token", type: "password" },
      },
      async authorize(credentials, req) {
        const row = await db.query.token.findFirst({
          where: and(
            eq(token.token, credentials.token),
            eq(token.active, true)
          ),
        });

        if (row) {
          return { id: row.token, name: row.name };
        } else {
          return null;
        }
      },
    }),
  ],
};

export default NextAuth(authOptions);
