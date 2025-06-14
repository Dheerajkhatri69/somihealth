import { connectionSrt } from "@/lib/db";
import { user } from "@/lib/model/users";
import mongoose from "mongoose";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        id: { label: "ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { id, password } = credentials;

          if (!id || !password) {
            throw new Error("Missing credentials");
          }

          const cleanId = id.trim();
          const cleanPassword = password.trim();

          if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
          }

          const foundUser = await user.findOne({ id: cleanId });

          if (!foundUser) {
            throw new Error("Invalid ID");
          }

          if (foundUser.password !== cleanPassword) {
            throw new Error("Invalid password");
          }

          return {
            _id: foundUser._id.toString(),
            id: foundUser.id,
            fullname: foundUser.fullname,
            email: foundUser.email,
            accounttype: foundUser.accounttype,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
    error: "/auth/error",
  },

  debug: process.env.NODE_ENV === "development",

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.id = user.id;
        token.email = user.email;
        token.fullname = user.fullname;
        token.accounttype = user.accounttype;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          _id: token._id,
          id: token.id,
          email: token.email,
          fullname: token.fullname,
          accounttype: token.accounttype,
        };
      }
      return session;
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };