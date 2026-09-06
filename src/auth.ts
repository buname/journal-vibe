import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";

import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";

const LOCAL_DEV_EMAIL = "local@journal.local";
const LOCAL_DEV_FALLBACK_ID = "local-dev-user";

async function resolveLocalDevUserId(): Promise<string | null> {
  try {
    const user = await prisma.user.upsert({
      where: { email: LOCAL_DEV_EMAIL },
      create: { email: LOCAL_DEV_EMAIL, name: "Journal" },
      update: {},
    });
    return user.id;
  } catch {
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers: [
    ...authConfig.providers,
    ...(process.env.NODE_ENV === "development"
      ? [
          Credentials({
            id: "local",
            name: "Local",
            credentials: {
              enter: { type: "hidden" },
            },
            async authorize() {
              const email = "local@journal.local";
              try {
                const user = await prisma.user.upsert({
                  where: { email },
                  create: { email, name: "Journal" },
                  update: {},
                });
                return {
                  id: user.id,
                  email: user.email ?? email,
                  name: user.name ?? "Journal",
                };
              } catch {
                return {
                  id: "local-dev-user",
                  email,
                  name: "Journal",
                };
              }
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      } else if (token.sub === LOCAL_DEV_FALLBACK_ID) {
        const resolved = await resolveLocalDevUserId();
        if (resolved) {
          token.sub = resolved;
        }
      }
      return token;
    },
  },
});
