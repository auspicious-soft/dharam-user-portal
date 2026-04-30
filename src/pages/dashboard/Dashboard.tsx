import { useCallback, useEffect, useState } from "react";

import StatsCard from "@/components/dashboard/StatsCard";
import { useSubscription } from "@/SubscriptionContext";
import { Button } from "@/components/ui/button";
import RatingsReviewsDialog from "@/components/dashboard/RatingsReviewsDialog";
import RecentModules from "../../components/dashboard/RecentModules";
import RecentActivities from "@/components/dashboard/RecentActivities";
import PurchasePlanCard from "@/components/dashboard/PurchasePlanCard";
import api from "@/lib/axios";
import type { Plan } from "@/components/dashboard/plans";

type PlansByDuration = {
  oneMonth: Plan[];
  threeMonths: Plan[];
};

type FetchedByDuration = {
  oneMonth: boolean;
  threeMonths: boolean;
};

type ApiPlan = {
  planName: string;
  priceId?: string | null;
  stripePriceId?: string | null;
  stripePrice: number;
  currency?: string;
  durationInMonths: number;
  level?: number;
  questionOfTheDay?: boolean;
  flashCards?: boolean;
  domainAndTask?: boolean;
  digitalStudyMaterial?: boolean;
  expertVideoModule?: boolean;
  applicationSupport?: boolean;
  mockExams?: number;
  practiceExams?: number;
};

type UserCourse = {
  status?: string | null;
  purchaseStatus?: string | null;
};

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

const mapApiPlanToFeatures = (plan: ApiPlan): string[] => {
  const features: string[] = [];

  if (plan.questionOfTheDay) features.push("Question of the Day");
  if (plan.flashCards) features.push("Flash Cards");
  if (plan.domainAndTask) features.push("Domain and Task");
  if (plan.digitalStudyMaterial) features.push("Digital Study Material");
  if (plan.expertVideoModule) features.push("Expert Video Module");
  if (plan.applicationSupport) features.push("Application Support");

  if ((plan.mockExams ?? 0) > 0) {
    features.push(
      `${plan.mockExams} Mock Exam${(plan.mockExams ?? 0) > 1 ? "s" : ""}`
    );
  }

  if ((plan.practiceExams ?? 0) > 0) {
    features.push(
      `${plan.practiceExams} Practice Exam${
        (plan.practiceExams ?? 0) > 1 ? "s" : ""
      }`
    );
  }

  return features;
};

const mapApiPlanToBenefits = (plan: ApiPlan): string[] => {
  const benefits: string[] = [];

  if (plan.questionOfTheDay) benefits.push("Question of the Day");
  if (plan.flashCards) benefits.push("Flash Cards");
  if (plan.domainAndTask) benefits.push("Domain and Task");
  if (plan.digitalStudyMaterial) benefits.push("Digital Study Material");
  if (plan.expertVideoModule) benefits.push("Expert Video Module");
  if (plan.applicationSupport) benefits.push("Application Support");

  benefits.push(`Mock Exams: ${plan.mockExams ?? 0}`);
  benefits.push(`Practice Exams: ${plan.practiceExams ?? 0}`);

  return benefits;
};

const formatPlanPrice = (plan: ApiPlan) => {
  const currencyCode = (plan.currency ?? "usd").toUpperCase();
  const durationLabel =
    plan.durationInMonths === 1
      ? "Month"
      : `${plan.durationInMonths} Months`;

  try {
    const formattedPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(plan.stripePrice ?? 0);

    return `${formattedPrice}/ ${durationLabel}`;
  } catch {
    return `$${Number(plan.stripePrice ?? 0).toFixed(2)}/ ${durationLabel}`;
  }
};

const mapApiPlansToUiPlans = (apiPlans: ApiPlan[]): Plan[] => {
  const maxLevel = Math.max(...apiPlans.map((plan) => plan.level ?? 0), 0);

  return [...apiPlans]
    .sort((a, b) => (a.level ?? 0) - (b.level ?? 0))
    .map((plan, index) => ({
      name: plan.planName?.trim() || `Plan ${index + 1}`,
      price: formatPlanPrice(plan),
      priceId: plan.priceId ?? plan.stripePriceId ?? null,
      features: mapApiPlanToFeatures(plan),
      benefits: mapApiPlanToBenefits(plan),
      popular: (plan.level ?? 0) === maxLevel && maxLevel > 0,
    }));
};

const Dashboard = () => {
  const { isSubscribed } = useSubscription();
  const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [selectedMonths, setSelectedMonths] = useState<1 | 3>(1);
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const [courseAccessNotice, setCourseAccessNotice] = useState<string | null>(
    null
  );
  const [plansByDuration, setPlansByDuration] = useState<PlansByDuration>({
    oneMonth: [],
    threeMonths: [],
  });
  const [fetchedByDuration, setFetchedByDuration] = useState<FetchedByDuration>({
    oneMonth: false,
    threeMonths: false,
  });

  const readUserNameFromStorage = useCallback(() => {
    if (typeof window === "undefined") {
      return "User";
    }

    const rawUser = localStorage.getItem("user");
    if (!rawUser) {
      return "User";
    }

    try {
      const parsed = JSON.parse(rawUser) as {
        firstname?: string | null;
        lastname?: string | null;
        email?: string | null;
      };

      return (
        [parsed.firstname, parsed.lastname]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        parsed.email ||
        "User"
      );
    } catch {
      return "User";
    }
  }, []);

  useEffect(() => {
    const updateUserName = () => setUserName(readUserNameFromStorage());
    updateUserName();

    window.addEventListener("storage", updateUserName);
    window.addEventListener("userUpdated", updateUserName as EventListener);

    return () => {
      window.removeEventListener("storage", updateUserName);
      window.removeEventListener("userUpdated", updateUserName as EventListener);
    };
  }, [readUserNameFromStorage]);

  useEffect(() => {
    let isCancelled = false;

    const fetchCourses = async () => {
      try {
        const response = await api.get("/user/course");
        const courses = ((response.data as { data?: UserCourse[] })?.data ??
          []) as UserCourse[];
        const list = Array.isArray(courses) ? courses : [];

        const allStatusesNull =
          list.length > 0 && list.every((course) => course.status == null);
        const allPurchaseStatusesNull =
          list.length > 0 &&
          list.every((course) => course.purchaseStatus == null);
        const hasExpiredFreeTrial = list.some(
          (course) =>
            String(course.status ?? "").toUpperCase() === "EXPIRED" &&
            String(course.purchaseStatus ?? "").toUpperCase() === "FREE_TRIAL"
        );
        const hasAnyActivePurchasedAccess = list.some(
          (course) =>
            String(course.status ?? "").toUpperCase() === "ACTIVE" &&
            course.purchaseStatus != null
        );

        let message: string | null = null;
        if (hasExpiredFreeTrial && !hasAnyActivePurchasedAccess) {
          message = "Your free trial has ended. Please purchase a course.";
        } else if (
          list.length === 0 ||
          allStatusesNull ||
          allPurchaseStatusesNull
        ) {
          message = "You have not purchased any course yet. Please purchase one.";
        }

        if (!isCancelled) {
          setCourseAccessNotice(message);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };

    void fetchCourses();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const durationKey = selectedMonths === 1 ? "oneMonth" : "threeMonths";

    if (fetchedByDuration[durationKey]) {
      return () => {
        isCancelled = true;
      };
    }

    const fetchPlans = async () => {
      setIsPlansLoading(true);

      try {
        const response = await api.get(`/user/get-plans?months=${selectedMonths}`);
        const apiPlans = ((response.data as { data?: ApiPlan[] })?.data ??
          []) as ApiPlan[];
        const mappedPlans = mapApiPlansToUiPlans(apiPlans);

        if (!isCancelled) {
          setPlansByDuration((prev) => ({
            ...prev,
            [durationKey]: mappedPlans,
          }));
          setFetchedByDuration((prev) => ({
            ...prev,
            [durationKey]: true,
          }));
        }

        console.log(`get-plans response (months=${selectedMonths}):`, response);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        if (!isCancelled) {
          setIsPlansLoading(false);
        }
      }
    };

    void fetchPlans();

    return () => {
      isCancelled = true;
    };
  }, [selectedMonths, fetchedByDuration]);

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between gap-3.5">
          <h2 className="text-Black_light text-lg font-bold">
            Welcome, {userName}
          </h2>
          <Button
            className="text-primary_blue"
            variant="link"
            onClick={() => setReviewsDialogOpen(true)}
          >
            Rate & review this product
          </Button>
        </div>

        {courseAccessNotice ? (
          <div className="rounded-lg border border-[#ffddb0] bg-[#fff8ed] px-4 py-3 text-sm text-[#9a5a00]">
            {courseAccessNotice}
          </div>
        ) : null}

        {isSubscribed ? (
          <>
            <StatsCard />
            <RecentModules modules={modulesData} />
            <RecentActivities activities={activitiesData} />
          </>
        ) : (
          <PurchasePlanCard
            onDurationChange={setSelectedMonths}
            allPlans={plansByDuration}
            isLoadingPlans={isPlansLoading}
          />
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
