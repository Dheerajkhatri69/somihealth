import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const routeRoleMap = {
  "/dashboard/addrecord": ["A", "T"],
  "/dashboard": ["A", "T", "C"],
  "/dashboard/followup": ["A", "T", "C"],
  "/dashboard/questionnaire": ["A", "T"],
  "/dashboard/abandonment": ["A"],
  "/dashboard/refills": ["A", "T"],
  "/dashboard/referrals": ["A"],
  "/dashboard/emailhistorytable": ["A"],
  "/dashboard/closetickets": ["A"]
};

export default withAuth(
  function middleware(req) {
    const accountType = req.nextauth.token?.accounttype;
    const url = req.nextUrl.pathname;

    // Find the matching route (exact match or startsWith for subpages)
    const normalizedUrl = url.split("?")[0].replace(/\/$/, "");
    const matchedRoute = Object.keys(routeRoleMap).find(route =>
      normalizedUrl === route || normalizedUrl.startsWith(route + "/")
    );

    if (matchedRoute) {
      const allowedRoles = routeRoleMap[matchedRoute];
      if (!allowedRoles.includes(accountType)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
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
