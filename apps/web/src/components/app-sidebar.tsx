"use client"

import * as React from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { LayoutDashboard, Network, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/layout/sidebar"

// Navigation data
const navigation = [
  {
    title: "Workflows",
    url: "/workflows",
    icon: LayoutDashboard,
  },
  {
    title: "Connections",
    url: "/connections",
    icon: Network,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isCollapsed } = useSidebar()
  const [user, setUser] = React.useState<{
    name: string
    email: string
    avatar: string
  } | null>(null)
  const supabase = createClientComponentClient()

  React.useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser({
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          avatar: authUser.user_metadata?.avatar_url || '',
        })
      }
    }
    getUser()
  }, [supabase])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex h-11 items-center justify-center">
          <Link 
            href="/"
            className={cn(
              "flex items-center",
              isCollapsed ? "h-9 w-9 justify-center" : "w-full gap-2 px-2"
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <span className="text-sm font-semibold hover:text-primary">
                Automation
              </span>
            )}
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation} />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex h-11 items-center justify-center">
          {user && <NavUser user={user} />}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
} 

