import { ExamHeader } from "@/components/exam-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

const ExamStart = () => {
  return (
    <SidebarProvider> 
      <div className="flex min-h-screen w-full overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <ExamHeader />
          <div className="flex-1 overflow-y-auto ">
            <Outlet /> 
          </div>
        </div>

      </div>
    </SidebarProvider>
  );
};

export default ExamStart;
