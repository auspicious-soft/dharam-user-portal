import {  Link, useNavigate } from "react-router-dom";
import { logout } from "../auth/Authenticated";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login", { replace: true });
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

            <DropdownMenuItem onSelect={handleLogout} className="w-full p-2">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
