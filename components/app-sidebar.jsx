'use client'
import { useMemo, useState, useEffect } from "react"
import { History, Home, Inbox, Plus, Trash, UserRoundPlus, FilePlus2 , AudioWaveform, FilePlus} from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"

const sidebarItems = [
  {
    title: "Data Form",
    url: "/dashboard/addrecord",
    icon: Home,
    allowedRoles: ['A', 'T']
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Inbox,
    allowedRoles: ['A', 'T', 'C'] // A: Admin, T: Technician, S: Staff
  },
  {
    title: "Follow up",
    url: "/dashboard/followup",
    icon: UserRoundPlus,
    allowedRoles: ['A', 'T', 'C']
  },
  {
    title: "New Patients",
    url: "/dashboard/questionnaire",
    icon: FilePlus2,
    allowedRoles: ['A', 'T']
  },
  {
    title: "Abandonment",
    url: "/dashboard/abandonment",
    icon: AudioWaveform,
    allowedRoles: ['A']
  },
  {
    title: "Refills",
    url: "/dashboard/refills",
    icon: FilePlus,
    allowedRoles: ['A', 'T']
  },
  {
    title: "Email History",
    url: "/dashboard/emailhistorytable",
    icon: History,
    allowedRoles: ['A']
  },
  {
    title: "Close tickets",
    url: "/dashboard/closetickets",
    icon: Trash,
    allowedRoles: ['A']
  }
]

export function AppSidebar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [unseenCount, setUnseenCount] = useState(0);
  const [unseenQuestionnaireCount, setUnseenQuestionnaireCount] = useState(0);

  useEffect(() => {
    if (session?.user?.accounttype === 'A' || session?.user?.accounttype === 'T') {
      const fetchUnseenCount = async () => {
        try {
          const response = await fetch('/api/refills/unseen');
          const data = await response.json();
          if (data.success) {
            setUnseenCount(data.count);
          }
        } catch (error) {
          console.error("Failed to fetch unseen refills count", error);
        }
      };
      fetchUnseenCount();
      const interval = setInterval(fetchUnseenCount, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.accounttype === 'A' || session?.user?.accounttype === 'T') {
      const fetchUnseenQuestionnaireCount = async () => {
        try {
          const response = await fetch('/api/questionnaire/unseen');
          const data = await response.json();
          if (data.success) {
            setUnseenQuestionnaireCount(data.count);
          }
        } catch (error) {
          console.error("Failed to fetch unseen questionnaire count", error);
        }
      };
      fetchUnseenQuestionnaireCount();
      const interval = setInterval(fetchUnseenQuestionnaireCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const filteredItems = useMemo(() => {
    return sidebarItems.filter(item =>
      item.allowedRoles.includes(session?.user?.accounttype || '')
    )
  }, [session?.user?.accounttype])
  if (status === 'loading') {
    return (
      <Sidebar>
        <SidebarContent className="bg-secondary text-white">
          <SidebarGroup>
            <SidebarGroupLabel className="h-20 flex flex-col items-start">
              <h1 className="font-tagesschrift text-4xl mb-2 text-white z-20 font-bold">
                somi
              </h1>
              <div className="text-slate-300 text-[1rem]">
                Patient Data Analysis
              </div>
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

  // const filteredItems = sidebarItems.filter(item =>
  //   item.allowedRoles.includes(session?.user?.accounttype || '')
  // )

  return (
    <Sidebar>
      <SidebarContent className="bg-secondary text-white">
        <SidebarGroup>
          <SidebarGroupLabel className="h-20 flex flex-col items-start">
            <h1 className="font-tagesschrift text-4xl mb-2 text-white z-20 font-bold">
              somi
            </h1>
            <div className="text-slate-300 text-[1rem]">
              Patient Data Analysis
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={isActive ? 'bg-white text-black' : ''}
                    >
                      <a href={item.url} className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2">
                          <item.icon size={20} />
                          <span>{item.title}</span>
                        </span>
                        {item.title === 'Refills' && unseenCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {unseenCount}
                          </span>
                        )}
                        {item.title === 'New Patients' && unseenQuestionnaireCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {unseenQuestionnaireCount}
                          </span>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
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