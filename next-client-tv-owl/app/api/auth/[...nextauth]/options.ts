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
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    pages: {
        signIn: "/sign-in",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        // Handle user registration or lookup here
        async signIn({ profile }) {
            if (!profile?.email) return false;
            try {
                await dbConnect();
                let user = await UserModel.findOne({ email: profile.email });

                if (!user) {
                    user = await UserModel.create({
                        username: profile.name,
                        email: profile.email,
                        avatar: profile.picture || null,
                        isPremium: false,
                    });
                }

                return true;
            } catch (err) {
                console.error("Error in signIn callback:", err);
                return false;
            }
        },


        async jwt({ token, user }) {
            try {
                await dbConnect();
                const dbUser = await UserModel.findOne({ email: token.email || user?.email });
                if (dbUser) {
                    token._id = dbUser._id.toString();
                    token.username = dbUser.username;
                    token.email = dbUser.email;
                    token.isPremium = dbUser.isPremium;
                    token.avatar = dbUser.avatar;
                }
            } catch (err) {
                console.error("Error in jwt callback:", err);
            }
            return token;
        },


        async session({ session, token }) {
            try {
                if (session.user) {
                    session.user._id = token._id;
                    session.user.username = token.username;
                    session.user.email = token.email;
                    session.user.isPremium = token.isPremium;
                    session.user.avatar = token.avatar;
                }
            } catch (err) {
                console.error("Error in session callback:", err);
            }
            return session;
        },

    },
};
