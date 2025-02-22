"use client";

import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/data-display/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/navigation/dropdown-menu";
import { Button } from "@/components/ui/inputs/button";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { Switch } from "@/components/ui/inputs/switch";
import Link from "next/link";

export function UserAccountDropdown() {
  const { theme, setTheme } = useTheme();
  const { session, signOut } = useAuth();

  if (!session?.user) return null;

  const user = session.user;
  const userImage = user.user_metadata?.avatar_url;
  const userName = user.user_metadata?.full_name || user.email;
  const userInitials = userName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{userName}</p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href='/profile' className='flex items-center'>
              <User className='mr-2 h-4 w-4' />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setTheme(theme === "light" ? "dark" : "light");
            }}
            className='flex items-center justify-between cursor-pointer'
          >
            <div className='flex items-center'>
              {theme === "light" ? (
                <Moon className='mr-2 h-4 w-4' />
              ) : (
                <Sun className='mr-2 h-4 w-4' />
              )}
              <span>Dark Mode</span>
            </div>
            <Switch
              checked={theme === "dark"}
              className='pointer-events-none'
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className='mr-2 h-4 w-4' />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
