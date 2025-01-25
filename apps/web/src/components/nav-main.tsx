"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/layout/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  const { isCollapsed } = useSidebar()
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarMenu className="flex flex-col items-center gap-1">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.url)
          return (
            <SidebarMenuItem key={item.title} className={cn(
              "w-full",
              isCollapsed ? "flex justify-center" : "px-2"
            )}>
              <Link href={item.url} legacyBehavior passHref>
                {isCollapsed ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton 
                          className={cn(
                            "h-9 w-9 p-0 justify-center",
                            isActive && "bg-primary/10 text-primary"
                          )}
                        >
                          {item.icon && (
                            <div className="flex h-9 w-9 items-center justify-center">
                              <item.icon className="h-4 w-4" />
                            </div>
                          )}
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={10}>
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <SidebarMenuButton 
                    className={cn(
                      "w-full",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    {item.icon && (
                      <div className="flex h-9 w-9 items-center justify-center">
                        <item.icon className="h-4 w-4" />
                      </div>
                    )}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </Link>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
} 
