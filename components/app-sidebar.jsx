'use client'
import { useEffect, useState } from "react"
import { Calendar, Home, Inbox, Plus, Search, Settings, Trash } from "lucide-react"
import { useSession } from "next-auth/react"
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

const items = [
  {
    title: "Data Form",
    url: "/dashboard/addrecord",
    icon: Home,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Inbox,
  },
]

export function AppSidebar() {
  const { data: session } = useSession();

  useEffect(() => {
    // console.log("Session user:", session?.user);
  }, [session]);
  
  return (
    <Sidebar>
      <SidebarContent className="bg-secondary text-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white text-[1rem]">
            Patient Data Analysis
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {session?.user?.accounttype === 'A' && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/dashboard/closetickets">
                      <Trash />
                      <span>Close tickets</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Only show Add Staff button for admin users (role A) */}
      {session?.user?.accounttype === 'A' && (
        <SidebarFooter className="bg-secondary">
          <SidebarMenuButton asChild className="bg-white">
            <a href="/dashboard/addstaff">
              <Plus />
              <span>Add Staff</span>
            </a>
          </SidebarMenuButton>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}