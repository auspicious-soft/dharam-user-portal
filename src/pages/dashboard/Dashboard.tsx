import { useCallback, useEffect, useMemo, useState } from "react";

import StatsCard from "@/components/dashboard/StatsCard";
import { useSubscription } from "@/SubscriptionContext";
import { Button } from "@/components/ui/button";
import RatingsReviewsDialog from "@/components/dashboard/RatingsReviewsDialog";
import RecentModules from "../../components/dashboard/RecentModules";
import RecentActivities from "@/components/dashboard/RecentActivities";
import PurchasePlanCard from "@/components/dashboard/PurchasePlanCard";
import api from "@/lib/axios";
import type { Plan } from "@/components/dashboard/plans";
import { normalizeUserCourses } from "@/utils/userCourses";

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

type HomeApiData = {
  stats?: {
    inProgress?: number;
    completed?: number;
    timeSpent?: number;
    mockTestAvgScore?: number;
  };
  daysLeftForScheduledExam?: number | null;
  examDate?: string | boolean | null;
  activities?: Array<{
    message?: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  lessonProgress?: Array<{
    percentage?: number;
    createdAt?: string;
    updatedAt?: string;
    moduleId?: {
      module?: string;
    };
  }>;
  subscription?: string | boolean | null;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const clampPercentage = (value: number) =>
  Math.min(100, Math.max(0, Math.round(value)));

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
      `${plan.mockExams} Mock Exam${(plan.mockExams ?? 0) > 1 ? "s" : ""}`,
    );
  }

  if ((plan.practiceExams ?? 0) > 0) {
    features.push(
      `${plan.practiceExams} Practice Exam${
        (plan.practiceExams ?? 0) > 1 ? "s" : ""
      }`,
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
    plan.durationInMonths === 1 ? "Month" : `${plan.durationInMonths} Months`;

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
  const [isHomeLoading, setIsHomeLoading] = useState(true);
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const [isSchedulingExam, setIsSchedulingExam] = useState(false);
  const [homeData, setHomeData] = useState<HomeApiData | null>(null);
  const [homeSubscriptionStatus, setHomeSubscriptionStatus] = useState<
    boolean | null
  >(null);
  const [courseAccessNotice, setCourseAccessNotice] = useState<string | null>(
    null,
  );
  const [plansByDuration, setPlansByDuration] = useState<PlansByDuration>({
    oneMonth: [],
    threeMonths: [],
  });
  const [fetchedByDuration, setFetchedByDuration] = useState<FetchedByDuration>(
    {
      oneMonth: false,
      threeMonths: false,
    },
  );
  const mappedModules = useMemo(
    () =>
      (homeData?.lessonProgress ?? []).map((moduleProgress, index) => ({
        id: index + 1,
        name: moduleProgress.moduleId?.module?.trim() || "Module",
        lastAccessed: formatDate(
          moduleProgress.updatedAt ?? moduleProgress.createdAt,
        ),
        progress: clampPercentage(Number(moduleProgress.percentage ?? 0)),
        imageUrl: "/user-img-new.png",
      })),
    [homeData],
  );
  const mappedActivities = useMemo(
    () =>
      (homeData?.activities ?? []).map((activity, index) => ({
        id: index + 1,
        name: activity.message?.trim() || "Activity",
        lastAccessed: formatDate(activity.updatedAt ?? activity.createdAt),
        imageUrl: "/user-img-new.png",
      })),
    [homeData],
  );
  const examDateValue =
    typeof homeData?.examDate === "string" ? homeData.examDate : null;
  const shouldShowSubscribedView = homeSubscriptionStatus ?? isSubscribed;

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
        [parsed.firstname, parsed.lastname].filter(Boolean).join(" ").trim() ||
        parsed.email ||
        "User"
      );
    } catch {
      return "User";
    }
  }, []);

  const fetchHomeData = useCallback(async () => {
    const courseId = localStorage.getItem("selectedCourseId");
    if (!courseId) {
      console.warn("Skipping /user/home call: selectedCourseId not found.");
      setIsHomeLoading(false);
      return;
    }

    try {
      const response = await api.get(`/user/home/${courseId}`);
      const fetchedHomeData = (response.data as { data?: HomeApiData })?.data;
      const subscriptionValue = fetchedHomeData?.subscription;
      const hasSubscription = !(
        subscriptionValue === false ||
        subscriptionValue == null ||
        String(subscriptionValue).trim() === "" ||
        String(subscriptionValue).toUpperCase() === "FALSE"
      );

      setHomeData(fetchedHomeData ?? null);
      setHomeSubscriptionStatus(hasSubscription);
      console.log(`user/home response (courseId=${courseId}):`, response);
      console.log("Dashboard subscription resolved as:", hasSubscription);
    } catch (error) {
      console.error("Failed to fetch user home data:", error);
    } finally {
      setIsHomeLoading(false);
    }
  }, []);

  const handleScheduleExam = useCallback(
    async (date: string) => {
      setIsSchedulingExam(true);

      try {
        const response = await api.post("/user/schedule-exam", { date });
        console.log("schedule-exam response:", response);
        await fetchHomeData();
      } catch (error) {
        console.error("Failed to schedule exam:", error);
      } finally {
        setIsSchedulingExam(false);
      }
    },
    [fetchHomeData],
  );

  useEffect(() => {
    const updateUserName = () => setUserName(readUserNameFromStorage());
    updateUserName();

    window.addEventListener("storage", updateUserName);
    window.addEventListener("userUpdated", updateUserName as EventListener);

    return () => {
      window.removeEventListener("storage", updateUserName);
      window.removeEventListener(
        "userUpdated",
        updateUserName as EventListener,
      );
    };
  }, [readUserNameFromStorage]);

  useEffect(() => {
    let isCancelled = false;

    const fetchCourses = async () => {
      try {
        const response = await api.get("/user/course");
        const list = normalizeUserCourses(response.data);

        const allStatusesNull =
          list.length > 0 && list.every((course) => course.status == null);
        const allPurchaseStatusesNull =
          list.length > 0 &&
          list.every((course) => course.purchaseStatus == null);
        const hasExpiredFreeTrial = list.some(
          (course) =>
            String(course.status ?? "").toUpperCase() === "EXPIRED" &&
            String(course.purchaseStatus ?? "").toUpperCase() === "FREE_TRIAL",
        );
        const hasAnyActivePurchasedAccess = list.some(
          (course) =>
            String(course.status ?? "").toUpperCase() === "ACTIVE" &&
            course.purchaseStatus != null,
        );

        let message: string | null = null;
        if (hasExpiredFreeTrial && !hasAnyActivePurchasedAccess) {
          message = "Your free trial has ended. Please purchase a course.";
        } else if (
          list.length === 0 ||
          allStatusesNull ||
          allPurchaseStatusesNull
        ) {
          message =
            "You have not purchased any course yet. Please purchase one.";
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
    setIsHomeLoading(true);
    void fetchHomeData();
  }, [fetchHomeData]);

  useEffect(() => {
    let isCancelled = false;

    if (isHomeLoading || shouldShowSubscribedView) {
      return () => {
        isCancelled = true;
      };
    }

    const durationKey = selectedMonths === 1 ? "oneMonth" : "threeMonths";

    if (fetchedByDuration[durationKey]) {
      return () => {
        isCancelled = true;
      };
    }

    const fetchPlans = async () => {
      setIsPlansLoading(true);

      try {
        const response = await api.get(
          `/user/get-plans?months=${selectedMonths}`,
        );
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
  }, [selectedMonths, fetchedByDuration, isHomeLoading, shouldShowSubscribedView]);

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

        {isHomeLoading ? (
          <div className="p-4 text-sm text-paragraph">Loading dashboard...</div>
        ) : shouldShowSubscribedView ? (
          <>
            <StatsCard
              stats={homeData?.stats}
              daysLeftForScheduledExam={homeData?.daysLeftForScheduledExam}
              examDate={examDateValue}
              onScheduleExam={handleScheduleExam}
              isSchedulingExam={isSchedulingExam}
            />
            <RecentModules modules={mappedModules} />
            <RecentActivities activities={mappedActivities} />
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
