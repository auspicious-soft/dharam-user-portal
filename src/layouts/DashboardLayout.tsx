import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { readSelectedCourseHasAccess } from "@/utils/courseAccess";
import { useCallback, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const enforceCourseAccess = useCallback(() => {
    const hasCourseAccess = readSelectedCourseHasAccess();
    if (!hasCourseAccess && window.location.pathname !== "/dashboard") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    enforceCourseAccess();
  }, [enforceCourseAccess, location.pathname]);

  useEffect(() => {
    window.addEventListener("storage", enforceCourseAccess);
    window.addEventListener("courseChanged", enforceCourseAccess as EventListener);

    return () => {
      window.removeEventListener("storage", enforceCourseAccess);
      window.removeEventListener(
        "courseChanged",
        enforceCourseAccess as EventListener,
      );
    };
  }, [enforceCourseAccess]);

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
