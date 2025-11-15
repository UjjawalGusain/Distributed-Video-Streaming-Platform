import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";
import { UserResponse, ApiResponse } from "@/src/types/ApiResponse";
import jwt from "jsonwebtoken";


if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing Google OAuth environment variables");
}

if (!process.env.BASE_URL_NODE_SERVER) {
    throw new Error("Missing Base Url environment variable");
}

if(!process.env.NEXTAUTH_SECRET) {
    throw new Error("Missing NEXT AUTH Secret environment variable");
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
        async signIn({ profile }) {
            if (!profile?.email) return false;
            try {

                const { data: userData } = await axios.post<ApiResponse<UserResponse>>(`${process.env.BASE_URL_NODE_SERVER}/api/auth/user`, {
                    username: profile.name,
                    email: profile.email,
                    avatar: profile.picture ?? null,
                });

                if (!userData.success) {
                    throw new Error("Could not create new user");
                }

                return true;
            } catch (err) {
                console.error("Error in signIn callback:", err);
                return false;
            }
        },


        async jwt({ token, user, profile }) {
            try {
                if (user || profile) {
                    const { data: dbUser } = await axios.post<ApiResponse<UserResponse>>(
                        `${process.env.BASE_URL_NODE_SERVER}/api/auth/user`,
                        {
                            username: user?.name || profile?.name,
                            email: user?.email || profile?.email,
                            avatar: user?.image || profile?.picture || null,
                        }
                    );


                    if (!dbUser.success) {
                        throw new Error("Could not find the user in db for jwt creation");
                    }

                    if (dbUser) {
                        token.id = dbUser.data.id.toString();
                        token.username = dbUser.data.username;
                        token.email = dbUser.data.email;
                        token.isPremium = dbUser.data.isPremium;
                        token.avatar = dbUser.data.avatar;
                    }

                    token.raw = jwt.sign(
                        { id: token.id, email: token.email },
                        process.env.NEXTAUTH_SECRET as string,
                        { expiresIn: "7d" }
                    );
                }
            } catch (err) {
                console.error("Error in jwt callback:", err);
            }
            return token;
        },


        async session({ session, token }) {
            try {
                if (session.user) {
                    session.user.id = token.id;
                    session.user.username = token.username;
                    session.user.email = token.email;
                    session.user.isPremium = token.isPremium;
                    session.user.avatar = token.avatar;

                    session.user.jwt = token.raw;
                }
            } catch (err) {
                console.error("Error in session callback:", err);
            }
            return session;
        },
    },
};
