// middleware.js
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const routeRoleMap = {
  "/dashboard/addrecord": ["A", "T"],
  "/dashboard": ["A", "T", "C"],
  "/dashboard/followup": ["A", "T", "C"],
  "/dashboard/questionnaire": ["A", "T"],
  "/dashboard/abandonment": ["A"],
  "/dashboard/refills": ["A", "T"],
  "/dashboard/followup/abandonment": ["A"],
  "/dashboard/referrals": ["A"],
  "/dashboard/emailhistorytable": ["A"],
  "/dashboard/closetickets": ["A"],
  "/dashboard/addstaff": ["A"],
  "/dashboard/profile": ["A"],
  "/dashboard/websitehome": ["A"],
  "/dashboard/products": ["A"],
  "/dashboard/faq": ["A"],
  "/dashboard/footerUI": ["A"],
  "/dashboard/contactForms": ["A"],
  "/dashboard/aboutUI": ["A"],
};

export default withAuth(
  function middleware(req) {
    // read both possible casings from your JWT
    const token = req.nextauth.token || {};
    const accountType = token.accountType ?? token.accounttype;

    const url = req.nextUrl.pathname;
    const normalizedUrl = url.split("?")[0].replace(/\/$/, ""); // strip trailing slash

    // 1) exact match first
    let matchedRoute = routeRoleMap[normalizedUrl] ? normalizedUrl : undefined;

    // 2) else pick LONGEST matching parent (/dashboard/foo/bar -> /dashboard/foo beats /dashboard)
    if (!matchedRoute) {
      const candidates = Object.keys(routeRoleMap).filter(
        (route) => route !== "/" && normalizedUrl.startsWith(route + "/")
      );
      if (candidates.length) {
        candidates.sort((a, b) => b.length - a.length);
        matchedRoute = candidates[0];
      }
    }

    // 3) enforce allowed roles for matched route
    if (matchedRoute) {
      const allowedRoles = routeRoleMap[matchedRoute];
      if (!allowedRoles.includes(accountType)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // 4) optionally block unknown account types
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
  matcher: ["/dashboard", "/dashboard/:path*"],
};
