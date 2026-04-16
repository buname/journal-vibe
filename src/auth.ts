import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
});
