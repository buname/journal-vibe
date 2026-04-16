"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export function UserMenu({ user }: UserMenuProps) {
  const initials =
    user.name?.slice(0, 2).toUpperCase() ??
    user.email?.slice(0, 2).toUpperCase() ??
    "ME";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full p-0"
          aria-label="Open account menu"
        >
          {user.image ? (
            // OAuth avatars use third-party URLs; keep lightweight without image optimization config.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium",
              )}
            >
              {initials}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name ?? "Account"}
            </p>
            {user.email ? (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
