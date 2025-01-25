"use client"

import * as React from "react"
import { Collapsible } from "@/components/ui/layout/collapsible"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/data-display/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface SidebarLayoutProps {
  children: React.ReactNode
  breadcrumbs?: {
    parent?: {
      href: string
      label: string
    }
    current: string
  }
}

interface SidebarContextValue {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function Sidebar({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isCollapsed } = useSidebar()

  return (
    <Collapsible
      open={!isCollapsed}
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-background",
        "transform-gpu transition-[width] duration-200 ease-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    >
      {children}
    </Collapsible>
  )
}

export function SidebarHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isCollapsed } = useSidebar()
  return (
    <div
      className={cn(
        "flex h-14 items-center border-b",
        isCollapsed ? "justify-center" : "px-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "flex-1 overflow-hidden hover:overflow-auto",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isCollapsed } = useSidebar()
  return (
    <div
      className={cn(
        "flex h-14 items-center border-t",
        isCollapsed ? "justify-center" : "px-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarRail() {
  return (
    <div className="absolute inset-y-0 right-0 w-[1px] bg-border" />
  )
}

export function SidebarInset({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isCollapsed } = useSidebar()
  
  return (
    <div
      className={cn(
        "transform-gpu transition-[margin] duration-200 ease-out",
        isCollapsed ? "lg:ml-16" : "lg:ml-64",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarTrigger({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  
  return (
    <button
      type="button"
      onClick={() => setIsCollapsed(!isCollapsed)}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
    </button>
  )
}

export function SidebarGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isCollapsed } = useSidebar()
  return (
    <div
      className={cn(
        "py-2",
        isCollapsed ? "px-1" : "px-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarGroupLabel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-xs font-semibold text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarMenu({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("grid gap-1", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "default" | "lg"
  tooltip?: string
}

export function SidebarMenuButton({
  className,
  children,
  size = "default",
  tooltip,
  ...props
}: SidebarMenuButtonProps) {
  return (
    <button
      className={cn(
        "group flex w-full items-center gap-2 rounded-lg px-2 text-left text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        size === "lg" ? "h-12" : "h-9",
        className
      )}
      {...props}
      title={tooltip}
    >
      {children}
    </button>
  )
}

export function SidebarMenuItem({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarMenuAction({
  className,
  children,
  showOnHover = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { showOnHover?: boolean }) {
  return (
    <div
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2",
        showOnHover && "opacity-0 group-hover:opacity-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarMenuSub({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("grid gap-1 px-6 py-1.5", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarMenuSubItem({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarMenuSubButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "w-full rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarLayout({ children, breadcrumbs }: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex w-full flex-col">
          <header className="flex h-16 shrink-0 items-center border-b">
            <div className="flex h-full items-center gap-2 px-4">
              <SidebarTrigger>
                <ChevronLeft className="h-4 w-4" />
              </SidebarTrigger>
              {breadcrumbs && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <nav className="flex items-center gap-1 text-sm">
                    {breadcrumbs.parent && (
                      <>
                        <a
                          href={breadcrumbs.parent.href}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {breadcrumbs.parent.label}
                        </a>
                        <span className="text-muted-foreground">/</span>
                      </>
                    )}
                    <span>{breadcrumbs.current}</span>
                  </nav>
                </>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export {
  type SidebarContextValue,
} 

