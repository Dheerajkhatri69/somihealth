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
  "/dashboard/gh-content": ["A"],
  "/dashboard/faq": ["A"],
  "/dashboard/footerUI": ["A"],
  "/dashboard/contactForms": ["A"],
  "/dashboard/aboutUI": ["A"],
  "/dashboard/auto-users": ["A"],
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token || {};
    const accountType = token.accountType ?? token.accounttype;
    const role = token.role;

    const url = req.nextUrl.pathname;
    const normalizedUrl = url.split("?")[0].replace(/\/$/, "");

    // Patient Dashboard Protection
    if (normalizedUrl.startsWith("/patientDashboard")) {
      // Only allow patients
      if (role !== "patient" && accountType !== "P") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      return NextResponse.next();
    }

    // Admin Dashboard Protection
    if (normalizedUrl.startsWith("/dashboard")) {
      // Redirect patients trying to access admin dashboard
      if (role === "patient" || accountType === "P") {
        return NextResponse.redirect(new URL("/patientDashboard", req.url));
      }

      // 1) exact match first
      let matchedRoute = routeRoleMap[normalizedUrl] ? normalizedUrl : undefined;

      // 2) else pick LONGEST matching parent
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

      // 4) block unknown admin account types
      if (!["A", "C", "T"].includes(accountType)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
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
  matcher: ["/dashboard", "/dashboard/:path*", "/patientDashboard", "/patientDashboard/:path*"],
};
