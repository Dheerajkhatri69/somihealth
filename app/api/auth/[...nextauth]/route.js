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
        const { id, password } = credentials;

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

        // ✅ Important: include accounttype here
        return {
          _id: foundUser._id.toString(),
          id: foundUser.id,
          fullname: foundUser.fullname,
          email: foundUser.email,
          accounttype: foundUser.accounttype, // <-- include this
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.id = user.id;
        token.email = user.email;
        token.fullname = user.fullname;
        token.accounttype = user.accounttype; // ✅ now this exists
      }
      return token;
    },

    async session({ session, token }) {
      session.user._id = token._id;
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.fullname = token.fullname;
      session.user.accounttype = token.accounttype; // ✅ finally added to session
      return session;
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
