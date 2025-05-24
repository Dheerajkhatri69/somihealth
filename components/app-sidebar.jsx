'use client'
import { useEffect } from "react"
import { Calendar, History, Home, Inbox, Plus, Search, Settings, Trash, UserRoundPlus } from "lucide-react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
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
import Image from "next/image"
import logo from '@/public/logo/somilogo.png';
const items = [
  // {
  //   title: "Data Form",
  //   url: "/dashboard/addrecord",
  //   icon: Home,
  // },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Inbox,
  },
  {
    title: "Follow up",
    url: "/dashboard/followup",
    icon: UserRoundPlus,
  },
]

export function AppSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname() // 🔹 Get current route

  useEffect(() => {
    // console.log("Session user:", session?.user);
  }, [session]);

  return (
    <Sidebar>
      <SidebarContent className="bg-secondary text-white">
        <SidebarGroup>
          <SidebarGroupLabel className="h-20 flex flex-col items-start mb-4">
            {/* <Image src={logo} alt="Logo" width={60} height={60} /> */}
            <h1 className="font-tagesschrift text-4xl mb-2 text-white z-20 font-bold">
            Somi
          </h1>
            <div className="text-slate-300 text-[1rem] ">
              Patient Data Analysis
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              {(session?.user?.accounttype === 'A' || session?.user?.accounttype === 'T') && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={pathname === "/dashboard/addrecord" ? "bg-white text-black" : ""}
                  >
                    <a href="/dashboard/addrecord">
                      <Home size={20} />
                      <span>Data Form</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={isActive ? 'bg-white text-black' : ''}
                    >
                      <a href={item.url}>
                        <item.icon size={20} />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {(session?.user?.accounttype === 'A') && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={pathname === "/dashboard/emailhistorytable" ? "bg-white text-black" : ""}
                  >
                    <a href="/dashboard/emailhistorytable">
                      <History size={20} />
                      <span>Email History</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {session?.user?.accounttype === 'A' && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={pathname === "/dashboard/closetickets" ? "bg-white text-black" : ""}
                  >
                    <a href="/dashboard/closetickets">
                      <Trash size={20} />
                      <span>Close tickets</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {session?.user?.accounttype === 'A' && (
        <SidebarFooter className="bg-secondary">
          <SidebarMenuButton
            asChild
            className={pathname === "/dashboard/addstaff" ? "bg-white text-black" : "text-white"}
          >
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
