import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      isPremium: boolean;
      avatar: string | null;
    } & DefaultSession["user"];
  }

  interface Profile {
    picture: string;
  }


  interface User extends DefaultUser {
    id: string;
    username: string;
    email: string;
    isPremium: boolean;
    avatar: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    email: string;
    isPremium: boolean;
    avatar: string | null;
  }
}

