import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <SiteHeader /> 
          <div className="flex-1 overflow-y-auto px-4 py-[26px] md:px-[30px]">
            <Outlet />
          </div>
        </div>

      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
