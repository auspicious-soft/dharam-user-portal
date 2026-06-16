import React from "react";
import { Check } from "lucide-react";
import { Plan } from "./plans";
import PlanBg from "@/assets/plan-bg.jpg";
import { Button } from "../ui/button";

interface PlanCardProps {
  plan: Plan;
  onSelectPlan: (plan: Plan) => void;
  isSubmitting?: boolean;
}

const PlanCard = ({ plan, onSelectPlan, isSubmitting = false }: PlanCardProps) => {
  const formattedExpiryDate = plan.expiryDate
    ? new Date(plan.expiryDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const isHighlighted = plan.popular && !plan.isPurchased;

  return (
    <div
      className={`px-5 pt-10 pb-5 rounded-[20px] flex h-full min-w-0 flex-col gap-6 md:gap-10 relative border-2
    ${
      plan.isPurchased
        ? "bg-white text-Black_light border-primary_heading shadow-sm pt-[60px]"
        : isHighlighted
          ? "bg-primary_heading text-white border-primary_heading pt-[60px]"
          : "bg-light-blue border-transparent pt-10"
    }`}
      style={
        !isHighlighted
          ? undefined
          : {
              backgroundImage: `url(${PlanBg})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "top right",
              backgroundSize: "cover",
            }
      }
    >
      {plan.isPurchased ? (
        <div className="flex justify-end absolute top-2.5 right-2.5">
          <div className="bg-primary_heading text-white text-xs font-bold px-4 py-2 rounded-xl tracking-wide">
            PURCHASED
          </div>
        </div>
      ) : null}

      {isHighlighted && (
        <div className="flex justify-end absolute top-2.5 right-2.5">
          <div className=" bg-white text-paragraph text-xs font-bold px-4 py-2 rounded-xl tracking-wide ">
            MOST POPULAR
          </div>
        </div>
      )}

      <div
        className={`self-stretch justify-start text-[26px] font-bold pb-3 border-b-[1px]  w-full
          ${
            isHighlighted
              ? "text-white border-white/20"
              : "text-primary_heading border-[#CEE2FF]"
          }`}
      >
        {plan.name}
      </div>

      <div
        className="flex flex-1 flex-col gap-5"
      >
        <div className="flex flex-col gap-1">
          <div className="text-xl font-semibold leading-6">
            {plan.price}
          </div>
          <div
            className={`text-sm font-medium ${
              isHighlighted ? "text-white/80" : "text-paragraph"
            }`}
          >
            {plan.accessLabel}
          </div>
          {plan.isPurchased && formattedExpiryDate ? (
            <div className="text-xs font-semibold text-primary_heading">
              Active until {formattedExpiryDate}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">What's Included</p>
          {plan.benefits.length ? (
            plan.benefits.map((benefit, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-sm leading-6
              ${isHighlighted ? "text-white" : "text-paragraph"}`}
              >
                <Check size={20} />
                <span>{benefit}</span>
              </div>
            ))
          ) : (
            <p className={`${isHighlighted ? "text-white" : "text-paragraph"} text-sm`}>
              No included benefits.
            </p>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        onClick={() => onSelectPlan(plan)}
        disabled={isSubmitting || plan.isPurchased}
        className={`mt-auto font-medium max-h-[44px]
              ${
                plan.isPurchased
                  ? "border border-primary_heading bg-primary_heading text-white"
                  : isHighlighted
                  ? "bg-white text-primary_blue border-none"
                  : "border border-primary_blue text-primary_blue bg-transparent"
              }`}
      >
        {plan.isPurchased
          ? "Purchased"
          : isSubmitting
            ? "Processing..."
            : "Choose Plan"}
      </Button>
    </div>
  );
};

export default PlanCard;
