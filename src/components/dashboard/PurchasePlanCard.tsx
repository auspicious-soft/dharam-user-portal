import { useEffect, useMemo, useState } from "react";
import Dialog from "./Dialog";
import PlanCard from "./PlanCard";
import PlanDialog from "./PlanDialog";
import { Plan, DurationTab, DialogTab } from "./plans";
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
};

const PurchasePlanCard = ({
  onDurationChange,
  allPlans,
  isLoadingPlans = false,
}: PurchasePlanCardProps) => {
  const [activeTab, setActiveTab] = useState<DurationTab>("oneMonth");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeDialogTab, setActiveDialogTab] = useState<DialogTab>("1Month");
  const [selectedPlanName, setSelectedPlanName] = useState<string>("");
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
    const purchasedProduct = getSelectedCourseId();
    if (!purchasedProduct) {
      toast.error("Please select a course first.");
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
        priceId: null,
        type: "FREE_TRIAL",
        amount: null,
        purchasedProduct,
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
    const purchasedProduct = getSelectedCourseId();
    if (!purchasedProduct) {
      toast.error("Please select a course first.");
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
        priceId: planItem.priceId,
        type: "SUBSCRIPTION",
        amount: null,
        purchasedProduct,
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

  const handleDialogTabChange = (tab: DialogTab) => {
    const months = tab === "1Month" ? 1 : 3;
    onDurationChange?.(months);
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setSelectedPlanName(plan.name);
    setActiveDialogTab(activeTab === "oneMonth" ? "1Month" : "3Months");
    setIsDialogOpen(true);
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

  useEffect(() => {
    if (!currentPlans.length) {
      setSelectedPlan(null);
      if (!isDialogOpen) {
        setSelectedPlanName("");
      }
      return;
    }

    const matchingPlan =
      currentPlans.find((plan) => plan.name === selectedPlanName) ??
      currentPlans[0];

    const dialogMatchesActiveTab =
      (activeTab === "oneMonth" && activeDialogTab === "1Month") ||
      (activeTab === "threeMonths" && activeDialogTab === "3Months");

    if (!isDialogOpen || dialogMatchesActiveTab) {
      setSelectedPlan(matchingPlan);
    }

    if (
      matchingPlan.name !== selectedPlanName &&
      (!isDialogOpen || dialogMatchesActiveTab)
    ) {
      setSelectedPlanName(matchingPlan.name);
    }
  }, [activeDialogTab, activeTab, currentPlans, isDialogOpen, selectedPlanName]);

  useEffect(() => {
    const dialogPlans =
      activeDialogTab === "1Month" ? allPlans.oneMonth : allPlans.threeMonths;

    if (!dialogPlans.length) {
      return;
    }

    const hasSelectedPlan = dialogPlans.some(
      (planItem) => planItem.name === selectedPlanName
    );

    if (!hasSelectedPlan) {
      setSelectedPlanName(dialogPlans[0].name);
    }
  }, [activeDialogTab, allPlans.oneMonth, allPlans.threeMonths, selectedPlanName]);

  return (
    <div className="flex flex-col gap-6 lg:px-2.5 ">
      <div className="flex gap-3 flex-wrap items-center justify-between">
        <h2 className="text-Black_light text-lg font-bold">Purchase a plan</h2>
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

      {isLoadingPlans && !currentPlans.length ? (
        <div className="text-center text-paragraph text-sm py-8">
          Loading plans...
        </div>
      ) : currentPlans.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          {currentPlans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} onSelectPlan={handleSelectPlan} />
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

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        {selectedPlan && (
          <PlanDialog
            plan={selectedPlan}
            onClose={() => setIsDialogOpen(false)}
            activeDialogTab={activeDialogTab}
            setActiveDialogTab={setActiveDialogTab}
            onDialogTabChange={handleDialogTabChange}
            isLoadingPlans={isLoadingPlans}
            allPlans={allPlans}
            selectedPlanName={selectedPlanName}
            setSelectedPlanName={setSelectedPlanName}
            onBuyNow={(planItem) => {
              void handleBuyNow(planItem);
            }}
            onStartFreeTrial={() => {
              void handleStartTrial();
            }}
            isPurchasing={isPurchasing}
            isStartingTrial={isStartingTrial}
            showStartTrialButton={!hasUsedFreeTrialForSelectedCourse}
            startTrialNotice={freeTrialNotice}
          />
        )}
      </Dialog>
    </div>
  );
};

export default PurchasePlanCard;
