import React from "react";
import { Button } from "../ui/button";

interface Module {
  id: number;
  name: string;
  lastAccessed: string;
  progress: number; // value between 0 and 100
  imageUrl?: string;
}

interface RecentModulesProps {
  modules: Module[];
}

const RecentModules: React.FC<RecentModulesProps> = ({ modules }) => {
  return (
    <div className="p-4 md:p-[30px] bg-light-blue rounded-[10px] flex flex-col gap-5">
      <h2 className="justify-start text-Black_light text-lg font-bold">
        Recent Modules
      </h2>
      <div className="space-y-3">
        {modules.map((module) => (
          <div
            key={module.id}
            className="p-5 bg-white rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex items-center gap-3">
                {module.imageUrl && (
                  <img
                    src={module.imageUrl}
                    alt={module.name}
                    className="w-14 h-14 object-cover rounded-[10px]"
                  />
                )}
                <div className="flex flex-col gap-2">
                  <h3 className="justify-start text-Black_light text-sm font-bold">
                    {module.name}
                  </h3>
                  <p className="justify-start text-Primary-Font text-xs font-medium">
                    Last Accessed On {module.lastAccessed}
                  </p>
                </div>
              </div>
              <div className="max-w-96 w-full">
                <div className="text-paragraph text-[10px] font-normal text-right">
                  {module.progress}% Progress
                </div>
                <div className="w-full bg-[#ececec] h-2 rounded-full mt-2">
                  <div
                    className="bg-[#6aa56d] h-2 rounded-full"
                    style={{ width: `${module.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="lg:min-w-60 lg:text-right">
              <Button variant="secondary" className="max-h-[44px]">
                Launch Course
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentModules;
