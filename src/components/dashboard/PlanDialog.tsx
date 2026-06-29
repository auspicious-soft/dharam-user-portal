import { Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";
import { Plan, DialogTab } from "./plans";
import { CheckCircleSolid, FlashSolid } from "iconoir-react";
import { Button } from "../ui/button";

interface PlanDialogProps {
  plan: Plan;
  onClose: () => void;
  activeDialogTab: DialogTab;
  setActiveDialogTab: Dispatch<SetStateAction<DialogTab>>;
  onDialogTabChange?: (tab: DialogTab) => void;
  isLoadingPlans?: boolean;
  allPlans: {
    oneMonth: Plan[];
    threeMonths: Plan[];
  };
  selectedPlanName: Plan["name"];
  setSelectedPlanName: Dispatch<SetStateAction<Plan["name"]>>;
  onBuyNow?: (plan: Plan) => void;
  onStartFreeTrial?: () => void;
  isPurchasing?: boolean;
  isStartingTrial?: boolean;
  showStartTrialButton?: boolean;
  startTrialNotice?: string | null;
}

const PlanDialog = ({
  plan,
  onClose,
  activeDialogTab,
  setActiveDialogTab,
  onDialogTabChange,
  isLoadingPlans = false,
  allPlans,
  selectedPlanName,
  setSelectedPlanName,
  onBuyNow,
  onStartFreeTrial,
  isPurchasing = false,
  isStartingTrial = false,
  showStartTrialButton = true,
  startTrialNotice = null,
}: PlanDialogProps) => {
  const handleDialogTabClick = (tab: DialogTab) => {
    setActiveDialogTab(tab);
    onDialogTabChange?.(tab);
  };

  const currentDialogPlans =
    activeDialogTab === "1Month" ? allPlans.oneMonth : allPlans.threeMonths;

  const currentPlan =
    currentDialogPlans.find((item) => item.name === selectedPlanName) ??
    currentDialogPlans[0] ??
    plan;

  const headerFeatures = currentPlan.features;
  const planBenefits = currentPlan.benefits;

  return (
    <div className="p-3 lg:p-7 !pt-0 flex flex-col gap-7">
      <button
        onClick={onClose}
        className="absolute right-6 top-4 md:right-14 md:top-8 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-white"
      >
        <X size={18} />
      </button>

      <div className="w-full p-4 md:p-7 rounded-bl-[32px] rounded-br-[32px] bg-primary_blue inline-flex flex-col justify-end items-start gap-2">
        <h2 className="justify-start text-white text-lg md:text-xl font-bold">
          Upgrade Your Plan
        </h2>
        <h3 className="justify-start text-white text-lg md:text-xl font-bold">
          PgMP {currentPlan.name} Plan
        </h3>
        {currentPlan.description ? (
          <div
            className="max-w-3xl text-sm font-normal leading-6 text-white/85 [&_a]:underline [&_ol]:ml-5 [&_ol]:list-decimal [&_p:not(:last-child)]:mb-2 [&_strong]:font-semibold [&_ul]:ml-5 [&_ul]:list-disc"
            dangerouslySetInnerHTML={{ __html: currentPlan.description }}
          />
        ) : null}

        {headerFeatures.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 w-full mt-2 pb-2.5">
            {headerFeatures.map((feature, index) => (
              <div
                key={`${feature}-${index}`}
                className="flex gap-2 justify-start text-white text-xs md:text-sm font-medium leading-[18px] md:leading-[22px] items-center"
              >
                <span className="text-[#FFC107] relative top-[1px]">
                  <FlashSolid className="w-4 h-4" />
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="text-center">
        <h3 className="text-center justify-start text-primary_heading text-2xl lg:text-3xl font-bold mb-4">
          Select a Plan
        </h3>
        <div className="flex justify-center">
          <div className="flex gap-[2px] bg-primary_blue p-[2px] rounded-full">
            <button
              onClick={() => handleDialogTabClick("1Month")}
              className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
                activeDialogTab === "1Month"
                  ? "bg-white text-primary_blue"
                  : "text-white"
              }`}
            >
              1 Month
            </button>
            <button
              onClick={() => handleDialogTabClick("3Months")}
              className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
                activeDialogTab === "3Months"
                  ? "bg-white text-primary_blue"
                  : "text-white"
              }`}
            >
              3 Months
            </button>
          </div>
        </div>

        {isLoadingPlans && !currentDialogPlans.length ? (
          <p className="text-sm text-paragraph mt-[10px]">Loading plans...</p>
        ) : currentDialogPlans.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-[10px]">
            {currentDialogPlans.map((planItem) => (
              <button
                key={planItem.name}
                onClick={() => setSelectedPlanName(planItem.name)}
                className={`px-4 py-3 bg-white rounded-[10px] border flex gap-2 items-start w-full text-left ${
                  planItem.name === selectedPlanName
                    ? "border-Black_light"
                    : "border-[#f0f8ff] hover:border-blue-300"
                }`}
              >
                <div className="flex-1">
                  <h4 className="justify-start text-primary_heading text-[22px] font-bold mb-1">
                    {planItem.name}
                  </h4>
                  <p className="self-stretch justify-start text-Black_light text-base font-medium">
                    {planItem.price}
                  </p>
                  <p className="self-stretch justify-start text-paragraph text-xs font-normal">
                    {planItem.accessLabel}
                  </p>
                  {planItem.description ? (
                    <div
                      className="mt-2 self-stretch justify-start text-paragraph text-xs font-normal leading-5 [&_a]:underline [&_ol]:ml-4 [&_ol]:list-decimal [&_p:not(:last-child)]:mb-1.5 [&_strong]:font-semibold [&_ul]:ml-4 [&_ul]:list-disc"
                      dangerouslySetInnerHTML={{ __html: planItem.description }}
                    />
                  ) : null}
                </div>
                {planItem.name === selectedPlanName && (
                  <div className="flex justify-center mb-2">
                    <div className="text-Black_light">
                      <CheckCircleSolid className="w-6" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-paragraph mt-[10px]">
            No plans available for this duration.
          </p>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="justify-start text-primary_heading text-base font-bold">
          What's Included
        </h3>

        {planBenefits.length ? (
          <div className="space-y-1">
            {planBenefits.map((benefit, index) => (
              <p
                key={`${benefit}-benefit-${index}`}
                className="self-stretch justify-start text-paragraph text-sm font-normal leading-7"
              >
                {benefit}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-paragraph">No included benefits.</p>
        )}
      </div>

      <div className="space-y-2.5 mt-4">
        <Button
          className="w-full max-h-[44px]"
          onClick={() => onBuyNow?.(currentPlan)}
          disabled={isPurchasing}
        >
          {isPurchasing ? "Processing..." : "Buy Now"}
        </Button>
        {showStartTrialButton ? (
          <div className="grid grid-cols-1 gap-2.5 lg:gap-5">
            <Button
              variant="outline"
              className="underline max-h-[44px]"
              onClick={onStartFreeTrial}
              disabled={isStartingTrial}
            >
              {isStartingTrial ? "Starting trial..." : "Or Start a Free Trial"}
            </Button>
          </div>
        ) : (
          <p className="text-center text-sm font-medium text-paragraph">
            {startTrialNotice ?? "You already have free trial for this course."}
          </p>
        )}
      </div>
    </div>
  );
};

export default PlanDialog;
