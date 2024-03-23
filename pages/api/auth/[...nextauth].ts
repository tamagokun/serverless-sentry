import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        token: { label: "Token", type: "password" },
      },
      async authorize(credentials, req) {
        const token = await prisma.token.findFirst({
          where: {
            token: credentials.token,
            active: true,
          },
        });

        if (token) {
          return { id: token.token, name: token.name };
        } else {
          return null;
        }
      },
    }),
  ],
};

export default NextAuth(authOptions);
