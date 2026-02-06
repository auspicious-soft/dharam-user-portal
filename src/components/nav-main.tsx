import { NavLink, useLocation } from "react-router-dom";
import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
};

export function NavMain({ items }: { items: NavItem[] }) {
  const { pathname } = useLocation();
    const { toggleSidebar, isMobile } = useSidebar();

   const isItemActive = (url: string) =>
    pathname === url || pathname.startsWith(url + "/");

  const handleNavClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="hidden md:block">
           {items.map((item) => {
            const isActive = isItemActive(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={
                    isActive
                      ? "!bg-primary_heading !text-white"
                      : "hover:!bg-primary_blue hover:!text-white !text-paragraph"
                  }
                >
                  <NavLink
                    to={item.url}
                    end
                    className="items-center gap-[10px] px-4 py-[15px] font-medium flex"
                  >
                    {item.icon && <item.icon  />}
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

          <SidebarMenu className="md:hidden">
           {items.map((item) => {
            const isActive = isItemActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={
                    isActive
                      ? "!bg-primary_heading !text-white"
                      : "hover:!bg-primary_blue hover:!text-white !text-paragraph"
                  }
                >
                 <NavLink
                    to={item.url}
                     onClick={handleNavClick} 
                    className="flex items-center gap-[10px] px-4 py-[15px] font-medium"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
