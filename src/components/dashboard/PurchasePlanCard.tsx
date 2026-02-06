import { useState } from "react";
import Dialog from "./Dialog";
import PlanCard from "./PlanCard";
import PlanDialog from "./PlanDialog";
import { Plan, DurationTab, DialogTab } from "./plans";
import ReusableFilterTabs from "./ReusableFilterTabs";
import CourseSelect from "../reusableComponents/CourseSelect";
import StartFreeTrial from "./StartFreeTrial";

const PurchasePlanCard = () => {
  const [activeTab, setActiveTab] = useState<DurationTab>("oneMonth");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeDialogTab, setActiveDialogTab] = useState<DialogTab>("1Month");
  const [selectedPlanName, setSelectedPlanName] =
    useState<Plan["name"]>("Silver");

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setSelectedPlanName(plan.name);
    setActiveDialogTab(activeTab === "oneMonth" ? "1Month" : "3Months");
    setIsDialogOpen(true);
  };

  // ✅ 1 MONTH PLANS
  const oneMonthPlans: Plan[] = [
    {
      name: "Silver",
      price: "$24.00/ Month",
      features: [
        "30 days of simulator access",
        "Standard mock exam set",
        "Basic result analytics",
        "Instant feedback",
        "Secure exam environment",
      ],
      popular: false,
    },
    {
      name: "Gold",
      price: "$44.00/ Month",
      features: [
        "30 days of simulator access",
        "Standard mock exam set",
        "Basic result analytics",
        "Instant feedback",
        "Secure exam environment",
      ],
      popular: false,
    },
    {
      name: "Platinum",
      price: "$60.00/ Month",
      features: [
        "30 days of simulator access",
        "Standard mock exam set",
        "Basic result analytics",
        "Instant feedback",
        "Secure exam environment",
      ],
      popular: true,
    },
  ];

  // ✅ 3 MONTH PLANS
  const threeMonthPlans: Plan[] = [
    {
      name: "Silver",
      price: "$40.00/ 3 Months",
      features: [
        "90 days of simulator access",
        "Standard mock exam set",
        "Basic result analytics",
        "Instant feedback",
        "Secure exam environment",
      ],
      popular: false,
    },
    {
      name: "Gold",
      price: "$59.00/ 3 Months",
      features: [
        "90 days of simulator access",
        "Standard mock exam set",
        "Basic result analytics",
        "Instant feedback",
        "Secure exam environment",
      ],
      popular: false,
    },
    {
      name: "Platinum",
      price: "$100.00/ 3 Months",
      features: [
        "90 days of simulator access",
        "Standard mock exam set",
        "Basic result analytics",
        "Instant feedback",
        "Secure exam environment",
      ],
      popular: true,
    },
  ];

  // ✅ Only required plans
  const allPlans: {
    oneMonth: Plan[];
    threeMonths: Plan[];
  } = {
    oneMonth: oneMonthPlans,
    threeMonths: threeMonthPlans,
  };

  const currentPlans =
    activeTab === "oneMonth" ? oneMonthPlans : threeMonthPlans;

  const currentDuration = activeTab === "oneMonth" ? "1 Month" : "3 Months";

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

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        {currentPlans.map((plan) => (
          <PlanCard
            key={plan.name}
            plan={plan}
            onSelectPlan={handleSelectPlan}
          />
        ))}
      </div>

      <StartFreeTrial />

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        {selectedPlan && (
          <PlanDialog
            plan={selectedPlan}
            onClose={() => setIsDialogOpen(false)}
            duration={currentDuration}
            activeDialogTab={activeDialogTab}
            setActiveDialogTab={setActiveDialogTab}
            allPlans={allPlans}
            selectedPlanName={selectedPlanName}
            setSelectedPlanName={setSelectedPlanName}
          />
        )}
      </Dialog>
    </div>
  );
};

export default PurchasePlanCard;
