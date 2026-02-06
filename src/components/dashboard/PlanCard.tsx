import React from "react";
import { Check } from "lucide-react";
import { Plan } from "./plans";
import PlanBg from "@/assets/plan-bg.jpg";
import { Button } from "../ui/button";

interface PlanCardProps {
  plan: Plan;
  onSelectPlan: (plan: Plan) => void;
}

const PlanCard = ({ plan, onSelectPlan }: PlanCardProps) => {
  return (
    <div
      className={`px-5 pt-10 pb-5 rounded-[20px] inline-flex flex-col gap-6 md:gap-10 relative
    ${
      plan.popular
        ? "bg-primary_heading text-white pt-[60px]"
        : "bg-light-blue pt-10"
    }`}
      style={
        !plan.popular
          ? undefined
          : {
              backgroundImage: `url(${PlanBg})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "top right",
              backgroundSize: "cover",
            }
      }
    >
      {plan.popular && (
        <div className="flex justify-end absolute top-2.5 right-2.5">
          <div className=" bg-white text-paragraph text-xs font-bold px-4 py-2 rounded-xl tracking-wide ">
            MOST POPULAR
          </div>
        </div>
      )}

      <div
        className={`self-stretch justify-start text-[26px] font-bold pb-3 border-b-[1px]  w-full
          ${
            plan.popular
              ? "text-white border-white/20"
              : "text-primary_heading border-[#CEE2FF]"
          }`}
      >
        {plan.name}
      </div>

      <div
        className={`flex flex-col gap-5 
           ${plan.popular ? "lg:mb-10" : ""}`}
      >
        <div className="text-xl font-semibold capitalize leading-6">
          {plan.price}
        </div>

        <div className="flex flex-col gap-3">
          {plan.features.map((feature, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 text-sm leading-6
              ${plan.popular ? "text-white" : "text-paragraph"}`}
            >
              <Check size={20} />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
      <Button
        variant="outline"
        onClick={() => onSelectPlan(plan)}
        className={`font-medium max-h-[44px]
              ${
                plan.popular
                  ? "bg-white text-primary_blue border-none"
                  : "border border-primary_blue text-primary_blue bg-transparent"
              }`}
      >
        Choose Plan
      </Button>
    </div>
  );
};

export default PlanCard;
