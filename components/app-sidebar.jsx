"use client"

import Link from "next/link"
import { useMemo, useState, useEffect } from "react"
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
  PanelBottom,      // Footer
  Layout,           // Header / Layout
  FileText,         // Pages
  Type,             // Typography / Copy
  Palette,          // Theme
  Shield,           // Legal
  Megaphone,        // Announcements
  Globe,            // SEO
  Link2,            // Navigation
  Images,           // Media
  ChevronRight,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "./ui/collapsible"

// ========= Existing patient section items =========
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

// ========= New frontend controls (Admin-only) =========
const frontendControls = [
  {
    title: "Header & Nav",
    icon: Layout,
    base: "/admin/nav",
    items: [
      { title: "Navigation", url: "/admin/nav/menus", icon: Link2 },
      { title: "Branding", url: "/admin/nav/branding", icon: Images },
      { title: "Top Bar", url: "/admin/nav/topbar", icon: Type },
    ],
  },
  {
    title: "Homepage",
    icon: FileText,
    base: "/admin/home",
    items: [
      { title: "Hero", url: "/admin/home/hero", icon: Images },
      { title: "Highlights", url: "/admin/home/highlights", icon: Type },
      { title: "CTA Sections", url: "/admin/home/ctas", icon: FileText },
    ],
  },
  {
    title: "Footer",
    icon: PanelBottom,
    base: "/admin/footer",
    items: [
      { title: "HIPAA Privacy", url: "/admin/footer/privacy", icon: FileText },
      { title: "Terms of Service", url: "/admin/footer/terms", icon: FileText },
      { title: "Shipping & Returns", url: "/admin/footer/refund", icon: FileText },
      { title: "Telehealth Consent", url: "/admin/footer/disclaimer", icon: FileText },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [unseenCount, setUnseenCount] = useState(0)
  const [unseenQuestionnaireCount, setUnseenQuestionnaireCount] = useState(0)
  const [unseenReferralsCount, setUnseenReferralsCount] = useState(0)
  const [userType, setUserType] = useState(null)

  // read role once from localStorage
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

  const refetchAllCounts = () => {
    if (effectiveUserType === "A" || effectiveUserType === "T") {
      fetchUnseenCount()
      fetchUnseenQuestionnaireCount()
      fetchUnseenReferralsCount()
    }
  }

  // polling
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

  useEffect(() => {
    const handler = () => refetchAllCounts()
    window.addEventListener("refreshSidebarCounts", handler)
    window.addEventListener("focus", handler)
    return () => {
      window.removeEventListener("refreshSidebarCounts", handler)
      window.removeEventListener("focus", handler)
    }
  }, [effectiveUserType])

  const filteredItems = useMemo(() => {
    return sidebarItems.filter((item) => item.allowedRoles.includes(effectiveUserType || ""))
  }, [effectiveUserType])

  // Loading skeleton
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
      <SidebarContent className="bg-secondary text-white">
        {/* ===== Section 1: Patient Data Analysis ===== */}
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
                        {item.title === "Refills" && unseenCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {unseenCount}
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
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* {effectiveUserType === "A" && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="text-slate-300 text-[1rem]">Frontend Controls</div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {frontendControls.map((group) => {
                  const open = pathname?.startsWith(group.base)
                  return (
                    <Collapsible key={group.title} defaultOpen={open} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="text-white">
                            <group.icon className="size-4" />
                            <span>{group.title}</span>
                            <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {group.items.map((sub) => {
                              const active = pathname === sub.url
                              return (
                                <SidebarMenuSubItem key={sub.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={active}
                                    className={`
            group/icon
            !text-white
            hover:!text-black
            data-[active=true]:!text-black
          `}
                                  >
                                    <Link href={sub.url} className="flex items-center gap-2">
                                      <sub.icon
                                        className={`
                size-4
                !text-white
                group-hover/icon:!text-black
                transition-colors duration-200
              `}
                                      />
                                      <span
                                        className={`
                transition-colors duration-200
                ${active ? "!text-black" : "!text-white group-hover/icon:!text-black"}
              `}
                                      >
                                        {sub.title}
                                      </span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>

                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )} */}
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
