import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/models/User";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing Google OAuth environment variables");
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    pages: {
        signIn: "/sign-in",
    },
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async signIn({ account, profile }) {
            if (!profile?.email) return false;
            return true;
        },
        async jwt({ token, user }) {
            await dbConnect();

            if (user && user.email) {
                let dbUser = await UserModel.findOne({ email: user.email });
                if (!dbUser) {
                    dbUser = await UserModel.create({
                        username: user.name,
                        email: user.email,
                        isPremium: false,
                    });
                }

                token._id = dbUser._id.toString();
                token.username = dbUser.username;
                token.email = dbUser.email;
                token.isPremium = dbUser.isPremium;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user._id = token._id;
                session.user.username = token.username;
                session.user.email = token.email;
                session.user.isPremium = token.isPremium;
            }
            return session;
        }

    }
}