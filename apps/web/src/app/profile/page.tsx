"use client";

import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/data-display/avatar";
import { Card, CardContent } from "@/components/ui/layout/card";
import { format } from "date-fns";
import { SidebarProvider } from "@/components/ui/layout/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function ProfilePage() {
  const { session } = useAuth();

  if (!session?.user) return null;

  const user = session.user;
  const userImage = user.user_metadata?.avatar_url;
  const userName = user.user_metadata?.full_name || user.email;
  const userInitials = userName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  // Get the creation date from user metadata or app metadata
  const createdAt =
    user.created_at ||
    user.app_metadata?.created_at ||
    user.user_metadata?.created_at;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1">
          <div className="container max-w-screen-2xl p-6">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold">Profile</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your account settings and preferences.
                  </p>
                </div>
              </div>
              <Card>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={userImage} alt={userName} />
                      <AvatarFallback className="text-lg">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{userName}</h2>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {createdAt && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Member since {format(new Date(createdAt), "MMMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
