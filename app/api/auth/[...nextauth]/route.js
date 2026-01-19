import { connectionSrt } from "@/lib/db";
import { user } from "@/lib/model/users";
import { UserCredential } from "@/lib/model/userCredential";
import mongoose from "mongoose";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  providers: [
    // Admin/Staff Authentication
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
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

        // Return admin user with accounttype
        return {
          _id: foundUser._id.toString(),
          id: foundUser.id,
          fullname: foundUser.fullname,
          email: foundUser.email,
          accounttype: foundUser.accounttype,
          role: "admin", // Mark as admin
        };
      },
    }),

    // Patient Authentication
    CredentialsProvider({
      id: "patient-credentials",
      name: "Patient Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        if (mongoose.connection.readyState === 0) {
          await mongoose.connect(connectionSrt);
        }

        const foundPatient = await UserCredential.findOne({ email: cleanEmail });

        if (!foundPatient) {
          throw new Error("Invalid email or password");
        }

        if (foundPatient.password !== cleanPassword) {
          throw new Error("Invalid email or password");
        }

        // Return patient user
        return {
          _id: foundPatient._id.toString(),
          id: foundPatient.userId,
          email: foundPatient.email,
          accounttype: "P", // P for Patient
          role: "patient", // Mark as patient
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
        token.accounttype = user.accounttype;
        token.role = user.role; // Store role (admin/patient)
      }
      return token;
    },

    async session({ session, token }) {
      session.user._id = token._id;
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.fullname = token.fullname;
      session.user.accounttype = token.accounttype;
      session.user.role = token.role; // Add role to session
      return session;
    },

    async redirect({ url, baseUrl }) {
      // If user is logging in, redirect based on their role
      if (url === baseUrl || url.startsWith(baseUrl)) {
        // Check the token to determine role (we can't access session here)
        // The default will be handled by checking the role after login
        return baseUrl;
      }
      return url;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
