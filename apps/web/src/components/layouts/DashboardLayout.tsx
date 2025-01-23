"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/inputs/button";
import { UserAccountDropdown } from "@/components/ui/navigation/UserAccountDropdown";
import { Icons } from "@/components/ui/data-display/icons";
import { LayoutDashboard, Settings, Workflow } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    name: "Board",
    href: "/board",
    icon: LayoutDashboard
  },
  {
    name: "Integrations",
    href: "/integrations",
    icon: Settings
  }
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className='min-h-screen bg-background'>
      {/* Top Header */}
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='flex h-14 items-center px-4 md:px-6'>
          <div className='flex items-center gap-2'>
            <Workflow className='h-6 w-6' />
            <span className='hidden font-bold sm:inline-block'>
              Automation Tool
            </span>
          </div>
          <div className='ml-auto flex items-center gap-2'>
            <UserAccountDropdown />
          </div>
        </div>
      </header>

      <div className='flex'>
        {/* Left Sidebar */}
        <aside className='fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-64 border-r bg-background'>
          <nav className='space-y-1 p-4'>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2",
                      isActive && "bg-secondary"
                    )}
                  >
                    <item.icon className='h-4 w-4' />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className='flex-1 pl-64'>
          <div className='container py-6 md:py-8'>{children}</div>
        </main>
      </div>
    </div>
  );
}
