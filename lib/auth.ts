import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import type { NextAuthConfig } from "next-auth";
import { encrypt } from "./encryption";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      gitlabId?: number;
      gitlabUsername?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    gitlabId?: number;
    gitlabUsername?: string;
  }
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "gitlab",
      name: "GitLab",
      type: "oauth",
      authorization: {
        url: "https://gitlab.com/oauth/authorize",
        params: { scope: "read_api" },
      },
      token: "https://gitlab.com/oauth/token",
      userinfo: "https://gitlab.com/api/v4/user",
      clientId: process.env.GITLAB_CLIENT_ID,
      clientSecret: process.env.GITLAB_CLIENT_SECRET,
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    },
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const p = profile as Record<string, unknown>;
        token.gitlabId = p.id as number;
        token.gitlabUsername = p.username as string;

        // Store encrypted tokens in DB
        const dbAccount = await prisma.account.findFirst({
          where: {
            provider: "gitlab",
            providerAccountId: String(token.gitlabId),
          },
        });
        if (dbAccount) {
          await prisma.account.update({
            where: { id: dbAccount.id },
            data: {
              access_token: encrypt(account.access_token!),
              refresh_token: account.refresh_token
                ? encrypt(account.refresh_token)
                : null,
              expires_at: account.expires_at,
            },
          });
        }

        // Update user with GitLab info
        await prisma.user.updateMany({
          where: { email: token.email! },
          data: {
            gitlabId: p.id as number,
            gitlabUsername: p.username as string,
          },
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.gitlabId = token.gitlabId;
        session.user.gitlabUsername = token.gitlabUsername;
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
