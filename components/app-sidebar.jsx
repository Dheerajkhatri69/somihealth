"use client"

import Link from "next/link"
import { useMemo, useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import {
  History,
  Home,
  Inbox,
  Plus,
  Trash,
  UserRoundPlus,
  FilePlus2,
  AudioWaveform,
  FilePlus,
  Settings2,
  Globe,
  ShoppingCart,
  ChartCandlestick,
  ScanHeart,
  HelpCircle,
  Contact,
  Footprints,
  RectangleEllipsis,
  TicketSlash,
  KeyRound,
  Columns3,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

const sidebarItems = [
  { title: "Data Form", url: "/dashboard/addrecord", icon: Home, allowedRoles: ["A", "T"] },
  { title: "Dashboard", url: "/dashboard", icon: Inbox, allowedRoles: ["A", "T", "C"] },
  { title: "Follow up", url: "/dashboard/followup", icon: UserRoundPlus, allowedRoles: ["A", "T", "C"] },
  { title: "New Patients", url: "/dashboard/questionnaire", icon: FilePlus2, allowedRoles: ["A", "T"] },
  { title: "Abandonment", url: "/dashboard/abandonment", icon: AudioWaveform, allowedRoles: ["A"] },
  { title: "Refills", url: "/dashboard/refills", icon: FilePlus, allowedRoles: ["A", "T"] },
  { title: "Referrals", url: "/dashboard/referrals", icon: Settings2, allowedRoles: ["A"] },
  { title: "Email History", url: "/dashboard/emailhistorytable", icon: History, allowedRoles: ["A"] },
  { title: "Close tickets", url: "/dashboard/closetickets", icon: Trash, allowedRoles: ["A"] },
]

const frontendItems = [
  { title: "Website Home", url: "/dashboard/websitehome", icon: Globe, allowedRoles: ["A"] },
  { title: "Products", url: "/dashboard/products", icon: ShoppingCart, allowedRoles: ["A"] },
  { title: "Feature Banner", url: "/dashboard/feature-banners", icon: TicketSlash, allowedRoles: ["A"] },
  { title: "Pricing Page", url: "/dashboard/pricing", icon: ChartCandlestick, allowedRoles: ["A"] },
  { title: "GH Content", url: "/dashboard/gh-content", icon: ScanHeart, allowedRoles: ["A"] },
  { title: "Login Page Content", url: "/dashboard/login-page", icon: KeyRound, allowedRoles: ["A"] },
  { title: "FAQ Component", url: "/dashboard/faq", icon: HelpCircle, allowedRoles: ["A"] },
  { title: "Footer", url: "/dashboard/footerUI", icon: Footprints, allowedRoles: ["A"] },
  { title: "Footer Pages", url: "/dashboard/footer", icon: Columns3, allowedRoles: ["A"] },
  { title: "Contact Forms/UI", url: "/dashboard/contactForms", icon: Contact, allowedRoles: ["A"] },
  { title: "About UI", url: "/dashboard/aboutUI", icon: RectangleEllipsis, allowedRoles: ["A"] },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [unseenCount, setUnseenCount] = useState(0)
  const [unseenQuestionnaireCount, setUnseenQuestionnaireCount] = useState(0)
  const [unseenReferralsCount, setUnseenReferralsCount] = useState(0)
  const [unseenContactFormsCount, setUnseenContactFormsCount] = useState(0)  // 👈 NEW
  const [unseenRefillsAbandonedCount, setUnseenRefillsAbandonedCount] = useState(0);

  const [userType, setUserType] = useState(null)

  useEffect(() => {
    const storedType = typeof window !== "undefined" ? localStorage.getItem("usertype") : null
    if (storedType) setUserType(storedType)
  }, [])

  const effectiveUserType = userType

  const fetchUnseenCount = async () => {
    try {
      const res = await fetch("/api/refills")
      const data = await res.json()
      const unseen = (data?.result ?? []).filter((r) => r.seen === false)
      setUnseenCount(unseen.length)
    } catch (e) {
      console.error("Failed to fetch unseen refills count", e)
    }
  }

  const fetchUnseenQuestionnaireCount = async () => {
    try {
      const res = await fetch("/api/questionnaire")
      const data = await res.json()
      const unseen = (data?.result ?? []).filter((q) => q.seen === false)
      setUnseenQuestionnaireCount(unseen.length)
    } catch (e) {
      console.error("Failed to fetch unseen questionnaire count", e)
    }
  }

  const fetchUnseenReferralsCount = async () => {
    try {
      const res = await fetch("/api/referrals")
      const data = await res.json()
      const referrals = data?.referrals ?? []
      const unseen = referrals.filter((r) => r.seen === false)
      setUnseenReferralsCount(unseen.length)
    } catch (e) {
      console.error("Failed to fetch unseen referrals count", e)
    }
  }
  // 👇 NEW: contact form unseen (= seen === true) count
  const fetchUnseenContactFormsCount = async () => {
    try {
      // adjust path "/api/contactForm" if your route is named differently
      const res = await fetch("/api/contact?mode=newCount");
      const data = await res.json();
      setUnseenContactFormsCount(data?.count ?? 0);
    } catch (e) {
      console.error("Failed to fetch unseen contact forms count", e);
    }
  };
  const fetchUnseenRefillsAbandonedCount = async () => {
    try {
      // This hits your new API for seen-count of RefillsAbandoned
      const res = await fetch("/api/followup/abandoned/seen-count");
      const data = await res.json();

      // count = NEW ones (seen=true by default)
      setUnseenRefillsAbandonedCount(data?.count ?? 0);
    } catch (e) {
      console.error("Failed to fetch refill-abandonment count", e);
    }
  };

  const refetchAllCounts = useCallback(() => {
    if (effectiveUserType === "A" || effectiveUserType === "T") {
      fetchUnseenCount();
      fetchUnseenQuestionnaireCount();
      fetchUnseenReferralsCount();
      fetchAbandonmentCount();
      fetchUnseenContactFormsCount();
      fetchUnseenRefillsAbandonedCount();
    }
  }, [effectiveUserType]);  // <-- only real dependency


  useEffect(() => {
    const handler = () => refetchAllCounts();

    window.addEventListener("refreshSidebarCounts", handler);
    window.addEventListener("focus", handler);

    return () => {
      window.removeEventListener("refreshSidebarCounts", handler);
      window.removeEventListener("focus", handler);
    };
  }, [effectiveUserType, refetchAllCounts]);

  useEffect(() => {
    if (effectiveUserType === "A" || effectiveUserType === "T") {
      fetchUnseenCount()
      const id = setInterval(fetchUnseenCount, 30000)
      return () => clearInterval(id)
    }
  }, [effectiveUserType])

  useEffect(() => {
    if (effectiveUserType === "A" || effectiveUserType === "T") {
      fetchUnseenQuestionnaireCount()
      const id = setInterval(fetchUnseenQuestionnaireCount, 30000)
      return () => clearInterval(id)
    }
  }, [effectiveUserType])

  useEffect(() => {
    if (effectiveUserType === "A" || effectiveUserType === "T") {
      fetchUnseenReferralsCount()
      const id = setInterval(fetchUnseenReferralsCount, 30000)
      return () => clearInterval(id)
    }
  }, [effectiveUserType])

  // 👇 NEW effect for contact forms
  useEffect(() => {
    if (effectiveUserType === "A") {               // probably only admin needs this
      fetchUnseenContactFormsCount();
      const id = setInterval(fetchUnseenContactFormsCount, 30000);
      return () => clearInterval(id);
    }
  }, [effectiveUserType]);
  useEffect(() => {
    if (effectiveUserType === "A" || effectiveUserType === "T") {
      fetchUnseenRefillsAbandonedCount();
      const id = setInterval(fetchUnseenRefillsAbandonedCount, 30000);
      return () => clearInterval(id);
    }
  }, [effectiveUserType]);

  const filteredItems = useMemo(() => {
    return sidebarItems.filter((item) => item.allowedRoles.includes(effectiveUserType || ""))
  }, [effectiveUserType])

  const filteredFrontendItems = useMemo(() => {
    return frontendItems.filter((item) => item.allowedRoles.includes(effectiveUserType || ""))
  }, [effectiveUserType])

  // components/sidebar/AppSidebar.jsx (snippets only: add state, fetcher, effects, badge)
  const [abandonmentCount, setAbandonmentCount] = useState(0);

  const fetchAbandonmentCount = async () => {
    try {
      const res = await fetch("/api/abandoned/seen-count"); // default 0,1
      const data = await res.json();
      setAbandonmentCount(data?.count ?? 0);
    } catch (e) {
      console.error("Failed to fetch abandonment count", e);
    }
  };


  useEffect(() => {
    if (effectiveUserType === "A" || effectiveUserType === "T") {
      fetchAbandonmentCount();
      const id = setInterval(fetchAbandonmentCount, 30000);
      return () => clearInterval(id);
    }
  }, [effectiveUserType]);


  if (effectiveUserType === null) {
    return (
      <Sidebar>
        <SidebarContent className="bg-secondary text-white">
          <SidebarGroup>
            <SidebarGroupLabel className="h-20 flex flex-col items-start">
              <h1 className="font-tagesschrift text-4xl mb-2 text-white z-20 font-bold">somi</h1>
              <div className="text-slate-300 text-[1rem]">Patient Data Analysis</div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[...Array(3)].map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuButton asChild>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5 bg-gray-400" />
                        <Skeleton className="h-4 w-28 bg-gray-400" />
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <SidebarContent className="bg-secondary text-white"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <SidebarGroup>
          <SidebarGroupLabel className="h-20 flex flex-col items-start">
            <h1 className="font-tagesschrift text-4xl mb-2 text-white z-20 font-bold">somi</h1>
            <div className="text-slate-300 text-[1rem]">Patient Data Analysis</div>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className={isActive ? "bg-white text-black" : ""}>
                      <Link href={item.url} className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2">
                          <item.icon size={20} />
                          <span>{item.title}</span>
                        </span>
                        {item.title === "Refills" && (unseenCount + unseenRefillsAbandonedCount) > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {unseenCount + unseenRefillsAbandonedCount}
                          </span>
                        )}
                        {item.title === "New Patients" && unseenQuestionnaireCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {unseenQuestionnaireCount}
                          </span>
                        )}
                        {item.title === "Referrals" && unseenReferralsCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {unseenReferralsCount}
                          </span>
                        )}
                        {item.title === "Abandonment" && abandonmentCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {abandonmentCount}
                          </span>
                        )}

                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Frontend Website Section */}

        {effectiveUserType === "A" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-300 text-sm font-medium">
              Frontend Website
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredFrontendItems.map((item) => {
                  const isActive = pathname === item.url || (item.url.includes('#') && pathname === item.url.split('#')[0])
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className={isActive ? "bg-white text-black" : ""}>
                        <Link href={item.url} className="flex items-center justify-between w-full">
                          <span className="flex items-center gap-2">
                            <item.icon size={20} />
                            <span>{item.title}</span>
                          </span>

                          {/* 👇 New badge for Contact Forms/UI */}
                          {item.title === "Contact Forms/UI" && unseenContactFormsCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {unseenContactFormsCount}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {effectiveUserType === "A" && (
        <SidebarFooter className="bg-secondary">
          <SidebarMenuButton
            asChild
            className={pathname === "/dashboard/addstaff" ? "bg-white text-black" : "text-white"}
          >
            <Link href="/dashboard/addstaff">
              <Plus />
              <span>Add Staff</span>
            </Link>
          </SidebarMenuButton>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
