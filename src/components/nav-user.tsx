import {  Link, useNavigate } from "react-router-dom";
import { logout } from "../auth/Authenticated";
import { useState } from "react";
import api from "@/lib/axios";
import { getFcmToken } from "@/lib/fcm";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuGroup,
  DropdownMenuItem,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavArrowDown } from "iconoir-react";
import { DropdownMenuGroup, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    avatar: string;
  };
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    setIsLoggingOut(true);

    let fcmToken: string | null = null;
    try {
      fcmToken = await getFcmToken({ requestPermission: false });
    } catch (tokenError) {
      console.warn("FCM token not available", tokenError);
    }

    try {
      await api.post("/user/logout", {
        fcmToken: fcmToken ?? "",
      });
    } catch (logoutError) {
      console.error("Logout API call failed", logoutError);
    } finally {
      setIsLoggingOut(false);
      setLogoutDialogOpen(false);
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                <AvatarFallback className="rounded-full">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-Desc-464646 text-sm font-medium leading-[30px]">
                  {user.name}
                </span>
              </div>
              <NavArrowDown className="ml-auto size-4 text-Desc-464646" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg outline outline-1 outline-offset-[-1px] outline-[#888888]"
            side="bottom"
            align="end"
            sideOffset={15}
          >
       <DropdownMenuGroup>
              <DropdownMenuItem asChild onSelect={() => setOpen(false)}>
                <Link to="profile" className="!w-full !p-2">
                 Profile
                </Link>
              </DropdownMenuItem>

            </DropdownMenuGroup>

            <DropdownMenuSeparator /> 

            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setOpen(false);
                setLogoutDialogOpen(true);
              }}
              className="w-full p-2"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <DialogContent className="max-w-md rounded-2xl p-7">
            <DialogHeader className="items-center space-y-4 mb-4">
              <DialogTitle className="text-center text-2xl text-Black_light md:text-3xl font-bold">
                Logout?
              </DialogTitle>
              <DialogDescription className="text-paragraph text-base font-medium text-center">
                Are you sure you want to logout?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                className="flex-1 max-h-[44px]"
                variant="outline"
                disabled={isLoggingOut}
                onClick={() => setLogoutDialogOpen(false)}
              >
                No
              </Button>
              <Button
                type="button"
                className="flex-1 max-h-[44px]"
                disabled={isLoggingOut}
                onClick={() => void handleLogout()}
              >
                {isLoggingOut ? "Logging out..." : "Yes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
