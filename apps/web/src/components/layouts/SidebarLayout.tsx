"use client";

import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation/breadcrumb";
import { Separator } from "@/components/ui/data-display/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/layout/sidebar";

interface SidebarLayoutProps {
  children: ReactNode;
  breadcrumbs?: {
    parent?: {
      href: string;
      label: string;
    };
    current: string;
  };
}

export function SidebarLayout({ children, breadcrumbs }: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {breadcrumbs && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.parent && (
                    <>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href={breadcrumbs.parent.href}>
                          {breadcrumbs.parent.label}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                    </>
                  )}
                  <BreadcrumbItem>
                    <BreadcrumbPage>{breadcrumbs.current}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
        </header>
        <div className="flex-1 p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 
