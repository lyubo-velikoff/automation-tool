"use client";

import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Header } from "@/components/ui/Header";

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
    <>
      <Header />
      <div className='flex min-h-[calc(100vh-3.5rem)] bg-muted/50'>
        <div className='container max-w-2xl mx-auto py-10 px-4 md:px-6'>
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='flex items-center space-x-4'>
                <Avatar className='h-20 w-20'>
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback className='text-lg'>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className='text-2xl font-bold'>{userName}</h2>
                  <p className='text-sm text-muted-foreground'>{user.email}</p>
                </div>
              </div>
              {createdAt && (
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground'>
                    Member since {format(new Date(createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
