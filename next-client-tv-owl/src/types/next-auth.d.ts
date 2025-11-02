import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      username: string;
      email: string;
      isPremium: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    _id: string;
    username: string;
    email: string;
    isPremium: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    username: string;
    email: string;
    isPremium: boolean;
  }
}
