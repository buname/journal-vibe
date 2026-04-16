import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isAuthed = Boolean(auth?.user);
      const pathname = nextUrl.pathname;
      const isProtected =
        pathname.startsWith("/journal") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/trades") ||
        pathname.startsWith("/backtests") ||
        pathname.startsWith("/notebook");

      if (isProtected && !isAuthed) {
        return false;
      }
      return true;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
