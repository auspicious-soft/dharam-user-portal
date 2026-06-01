import { useEffect, useMemo, useState } from "react";
import PlanCard from "./PlanCard";
import { Plan, DurationTab } from "./plans";
import ReusableFilterTabs from "./ReusableFilterTabs";
import CourseSelect from "../reusableComponents/CourseSelect";
import StartFreeTrial from "./StartFreeTrial";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  normalizeUserCourses,
  type UserCourse,
} from "@/utils/userCourses";

type PlansByDuration = {
  oneMonth: Plan[];
  threeMonths: Plan[];
};

type PurchasePlanCardProps = {
  onDurationChange?: (months: 1 | 3) => void;
  allPlans: PlansByDuration;
  isLoadingPlans?: boolean;
  freeTrialPlanId?: string | null;
};

const PurchasePlanCard = ({
  onDurationChange,
  allPlans,
  isLoadingPlans = false,
  freeTrialPlanId = null,
}: PurchasePlanCardProps) => {
  const [activeTab, setActiveTab] = useState<DurationTab>("oneMonth");
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [courses, setCourses] = useState<UserCourse[]>([]);

  const currentPlans = useMemo(
    () => (activeTab === "oneMonth" ? allPlans.oneMonth : allPlans.threeMonths),
    [activeTab, allPlans.oneMonth, allPlans.threeMonths]
  );

  const getDashboardUrl = () =>
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard`
      : "/dashboard";

  const getSelectedCourseId = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("selectedCourseId") ?? ""
      : "";

  const currentDuration = activeTab === "oneMonth" ? "1 Month" : "3 Months";
  const selectedCourseId = getSelectedCourseId();
  const selectedCourse = useMemo(
    () => courses.find((course) => course._id === selectedCourseId),
    [courses, selectedCourseId]
  );
  const hasUsedFreeTrialForSelectedCourse =
    String(selectedCourse?.purchaseStatus ?? "").toUpperCase() === "FREE_TRIAL";
  const hasActiveFreeTrialForSelectedCourse =
    hasUsedFreeTrialForSelectedCourse &&
    String(selectedCourse?.status ?? "").toUpperCase() === "ACTIVE" &&
    Number(selectedCourse?.daysLeft ?? 0) > 0;
  const freeTrialNotice = hasActiveFreeTrialForSelectedCourse
    ? "You already have free trial for this course."
    : hasUsedFreeTrialForSelectedCourse
      ? "Free trial already used for this course."
      : null;

  const resolveRedirectUrl = (responseData: unknown): string | null => {
    const parsed = responseData as
      | {
          url?: string;
          checkoutUrl?: string;
          data?: { url?: string; checkoutUrl?: string };
        }
      | undefined;

    return (
      parsed?.data?.url ??
      parsed?.data?.checkoutUrl ??
      parsed?.url ??
      parsed?.checkoutUrl ??
      null
    );
  };

  const handleStartTrial = async () => {
    if (!freeTrialPlanId) {
      toast.error("Free trial plan is not available right now.");
      return;
    }
    if (hasUsedFreeTrialForSelectedCourse) {
      toast.info(freeTrialNotice ?? "Free trial already used for this course.");
      return;
    }

    const dashboardUrl = getDashboardUrl();

    setIsStartingTrial(true);
    try {
      const response = await api.post("/user/create-purchase", {
        // priceId: null,
        // type: "FREE_TRIAL",
        // amount: null,
        planId: freeTrialPlanId,
        purchaseType: "COURSE",
        success_url: dashboardUrl,
        cancel_url: dashboardUrl,
      });
      

      const redirectUrl = resolveRedirectUrl(response.data);
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      const message =
        (response.data as { message?: string })?.message ??
        "Free trial started successfully.";
      toast.success(message);
      window.location.reload();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Unable to start free trial.";
      toast.error(message);
    } finally {
      setIsStartingTrial(false);
    }
  };

  const handleBuyNow = async (planItem: Plan) => {
    if (!planItem.planId) {
      toast.error("Selected plan does not have a valid plan id.");
      return;
    }

    if (!planItem.priceId) {
      toast.error("Selected plan does not have a valid price id.");
      return;
    }

    const dashboardUrl = getDashboardUrl();

    setIsPurchasing(true);
    try {
      const response = await api.post("/user/create-purchase", {
        // priceId: planItem.priceId,
        // type: "SUBSCRIPTION",
        // amount: null,
        planId: planItem.planId,
        purchaseType: "COURSE",
        success_url: dashboardUrl,
        cancel_url: dashboardUrl,
      });

      const redirectUrl = resolveRedirectUrl(response.data);
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      const message =
        (response.data as { message?: string })?.message ??
        "Purchase request created successfully.";
      toast.success(message);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Unable to create purchase.";
      toast.error(message);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    void handleBuyNow(plan);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchCourses = async () => {
      try {
        const response = await api.get("/user/course");
        if (isMounted) {
          setCourses(normalizeUserCourses(response.data));
        }
      } catch (error) {
        console.error("Failed to load courses", error);
      }
    };

    void fetchCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    onDurationChange?.(activeTab === "oneMonth" ? 1 : 3);
  }, [activeTab, onDurationChange]);

  return (
    <div className="flex flex-col gap-6 lg:px-2.5 ">
      <div className="flex gap-3 flex-wrap items-center justify-between">
        <h2 className="text-Black_light text-lg font-bold">
          What you'll access - find the right plan for you
        </h2>
        <CourseSelect />
      </div>
      <div className="flex justify-center">
        <ReusableFilterTabs
          value={activeTab}
          onValueChange={setActiveTab}
          tabs={[
            { value: "oneMonth", label: "1 Month" },
            { value: "threeMonths", label: "3 Months" },
          ]}
        />
      </div>
      <div className="text-center text-sm font-semibold text-primary_heading">
        One-time Purchase
      </div>

      {isLoadingPlans && !currentPlans.length ? (
        <div className="text-center text-paragraph text-sm py-8">
          Loading plans...
        </div>
      ) : currentPlans.length ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 items-stretch">
          {currentPlans.map((plan) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              onSelectPlan={handleSelectPlan}
              isSubmitting={isPurchasing}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-paragraph text-sm py-8">
          No plans available for {currentDuration}.
        </div>
      )}

      <StartFreeTrial
        onStartFreeTrial={() => {
          void handleStartTrial();
        }}
        isSubmitting={isStartingTrial}
        showStartTrialButton={!hasUsedFreeTrialForSelectedCourse}
        trialNotice={freeTrialNotice}
      />
    </div>
  );
};

export default PurchasePlanCard;
