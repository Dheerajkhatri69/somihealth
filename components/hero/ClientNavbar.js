"use client"; // This is a Client Component

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ClientNavbar() {
  const pathname = usePathname();

  // Hide Navbar for /adminDashboard or /dashboard
  const hideNavbar = pathname.startsWith("/dashboard") || pathname.startsWith("/referrals") || pathname.startsWith("/refills") || pathname.startsWith("/getstarted") || pathname.startsWith("/pricing");

  return !hideNavbar ? <Navbar /> : null;
}