import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
  },
  providers: [Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;

      // Check if this Google account is ALREADY linked to some user (corrupted data from allowDangerousEmailAccountLinking)
      const existingAccount = await prisma.account.findFirst({
        where: { provider: "google", providerAccountId: account.providerAccountId },
        include: { user: true },
      });

      if (existingAccount && existingAccount.user.email !== user.email) {
        // The account is linked to a user with a DIFFERENT email — create a fresh user for this Google account
        const newUser = await prisma.user.create({
          data: { email: user.email, name: user.name, image: user.image, firstName: user.name?.split(" ")[0], lastName: user.name?.split(" ").slice(1).join(" ") || null },
        });
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: { userId: newUser.id },
        });
        return true;
      }

      // User with this email already exists — link the Google account if not already linked
      const existing = await prisma.user.findUnique({ where: { email: user.email } });
      if (existing) {
        const hasGoogle = await prisma.account.findFirst({
          where: { userId: existing.id, provider: "google" },
        });
        if (!hasGoogle) {
          await prisma.account.create({
            data: {
              userId: existing.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token ?? null,
              refresh_token: account.refresh_token ?? null,
              expires_at: account.expires_at ?? null,
              token_type: account.token_type ?? null,
              scope: account.scope ?? null,
              id_token: account.id_token ?? null,
              session_state: (account.session_state as string | null) ?? null,
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.age = (user as any).age;
      }
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (dbUser) {
          token.name = dbUser.name;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.age = dbUser.age;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.name = (token as any).name;
        session.user.firstName = (token as any).firstName;
        session.user.lastName = (token as any).lastName;
        session.user.age = (token as any).age;
      }
      return session;
    },
  },
});
