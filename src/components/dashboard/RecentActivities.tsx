import React from "react";
import { Button } from "../ui/button";

interface Activitie {
  id: number;
  name: string;
  lastAccessed: string;
  imageUrl?: string;
}

interface RecentActivitiesProps {
  activities: Activitie[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  return (
    <div className="p-4 md:p-[30px] bg-light-blue rounded-[10px] flex flex-col gap-5">
      <h2 className="justify-start text-Black_light text-lg font-bold">
       Recent Activities
      </h2>
      <div className="space-y-3">
        {activities.map((activitie) => (
          <div
            key={activitie.id}
            className="p-5 bg-white rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="grid grid-cols-1 gap-4 w-full">
              <div className="flex items-center gap-3">
                {activitie.imageUrl && (
                  <img
                    src={activitie.imageUrl}
                    alt={activitie.name}
                    className="w-14 h-14 object-cover rounded-[10px]"
                  />
                )}
                <div className="flex flex-col gap-2">
                  <h3 className="justify-start text-Black_light text-sm font-bold">
                    {activitie.name}
                  </h3>
                  <p className="justify-start text-Primary-Font text-xs font-medium">
                    Last Accessed On {activitie.lastAccessed}
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:min-w-60 lg:text-right">
              <Button variant="secondary" className="max-h-[44px] min-w-[126px]">
                View Report
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;
