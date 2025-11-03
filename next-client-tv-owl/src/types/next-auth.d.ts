import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      username: string;
      email: string;
      isPremium: boolean;
      avatar: string;
    } & DefaultSession["user"];
  }

  interface Profile {
    picture: string;
  }


  interface User extends DefaultUser {
    _id: string;
    username: string;
    email: string;
    isPremium: boolean;
    avatar: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    username: string;
    email: string;
    isPremium: boolean;
    avatar: string;
  }
}

