import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const accountType = req.nextauth.token?.accounttype;
    const url = req.nextUrl.pathname;

    // Restrict Clinician and Technician from accessing certain routes
    const restrictedPaths = ["/dashboard/addstaff", "/dashboard/closetickets"];

    if (
      restrictedPaths.includes(url) &&
      (accountType === "C" || accountType === "T")
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Optionally restrict access to unknown account types
    if (!["A", "C", "T"].includes(accountType)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
