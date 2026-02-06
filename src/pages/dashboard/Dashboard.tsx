import React, { useState } from "react";

import StatsCard from "@/components/dashboard/StatsCard";
import { useSubscription } from "@/SubscriptionContext";
import { Button } from "@/components/ui/button";
import RatingsReviewsDialog from "@/components/dashboard/RatingsReviewsDialog";
import RecentModules from "../../components/dashboard/RecentModules";
import RecentActivities from "@/components/dashboard/RecentActivities";
import PurchasePlanCard from "@/components/dashboard/PurchasePlanCard";
const modulesData = [
  {
    id: 1,
    name: "Name of the Module",
    lastAccessed: "Jan 14, 2026",
    progress: 20,
    imageUrl: "/user-img-new.png",
  },
  {
    id: 2,
    name: "Name of the Module",
    lastAccessed: "Jan 10, 2026",
    progress: 20,
    imageUrl: "/user-img-new.png",
  },
];

const activitiesData = [
  {
    id: 1,
    name: "You completed mock exam",
    lastAccessed: "Jan 14, 2026",
    imageUrl: "/user-img-new.png",
  },
  {
    id: 2,
    name: "You practiced questions",
    lastAccessed: "Jan 10, 2026",
    imageUrl: "/user-img-new.png",
  },
];


const Dashboard = () => {
  const { isSubscribed } = useSubscription();
  const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false);
  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between gap-3.5">
          <h2 className="text-Black_light text-lg font-bold">Welcome, Arisu</h2>
          <Button className="text-primary_blue" variant="link"
           onClick={() => setReviewsDialogOpen(true)}
          >
            Rate & review this product
          </Button>
        </div>

        {isSubscribed ? (
          <>
             <StatsCard />
             <RecentModules modules={modulesData} />
             <RecentActivities activities={activitiesData} />
          </>
        ) : (
          <PurchasePlanCard />
        )}
        </div>

      <RatingsReviewsDialog
        open={reviewsDialogOpen}
        setOpen={setReviewsDialogOpen}
      />
    </>
  );
};

export default Dashboard;
