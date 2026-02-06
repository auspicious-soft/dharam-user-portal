import React from "react";
import {  X } from "lucide-react";
import { Plan, DialogTab } from "./plans";
import { CheckCircleSolid, FlashSolid } from "iconoir-react";
import { Button } from "../ui/button";

interface PlanDialogProps {
  plan: Plan;
  onClose: () => void;
  duration: string;
  activeDialogTab: DialogTab;
  setActiveDialogTab: React.Dispatch<React.SetStateAction<DialogTab>>;
  allPlans: {
    oneMonth: Plan[];
    threeMonths: Plan[];
  };
  selectedPlanName: Plan["name"];
  setSelectedPlanName: React.Dispatch<
    React.SetStateAction<Plan["name"]>
  >;
}

const PlanDialog = ({
  plan,
  onClose,
  activeDialogTab,
  setActiveDialogTab,
  allPlans,
  selectedPlanName,
  setSelectedPlanName,
}: PlanDialogProps) => {
  const planDetails = {
    Silver: {
      features: [
        "Question of the Day",
        "PgMP Practice Test",
        "PgMP Knowledge Encyclopedia"
      ]
    },
    Gold: {
      features: [
        "Question of the Day",
        "PgMP Practice Test",
        "PgMP Knowledge Encyclopedia",
        "PgMP Insider Tips"
      ]
    },
    Platinum: {
      features: [
        "Question of the Day",
        "PgMP Practice Test",
        "PgMP Knowledge Encyclopedia",
        "PgMP Insider Tips",
        "PgMP Challenger 1 Mock Exam"
      ]
    }
  };

  // Get current plans based on active dialog tab
  const currentDialogPlans = activeDialogTab === '1Month' ? allPlans.oneMonth : allPlans.threeMonths;
  
  // Get the currently selected plan object
  const currentPlan = currentDialogPlans.find(p => p.name === selectedPlanName) || plan;

  const whatYouGet = [
    {
      title: "One Full Length Mock Exam (170 Questions):",
      description: "Tackle an extensive mock exam mirroring the complexity and format of the actual test for thorough preparation."
    },
    {
      title: "Two Practice Test (100 Questions):",
      description: "Sharpen your skills with specialized practice tests to boost confidence and mastery."
    },
    {
      title: "Essential Formulas, Glossary, Confusion Buster, Acronyms and Exam Tips:",
      description: "Access a curated suite of resources, including essential formulas, a glossary, key acronyms, confusion busters and exam tips for a strategic advantage."
    }
  ];

  return (
    <div className="p-3 lg:p-7 !pt-0 flex flex-col gap-7">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-6 top-4 md:right-14 md:top-8 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-white"
      >
        <X size={18} />
      </button>

      {/* Header with gradient background */}
      <div className="w-full p-4 md:p-7 rounded-bl-[32px] rounded-br-[32px] bg-primary_blue inline-flex flex-col justify-end items-start gap-2">
        <h2 className="justify-start text-white text-lg md:text-xl font-bold">
          Upgrade Your Plan
        </h2>
        <h3 className="justify-start text-white text-lg md:text-xl font-bold">
          PgMP {currentPlan.name} Plan
        </h3>
        
        {/* Plan Features in two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 w-full mt-2 pb-2.5">
          {planDetails[currentPlan.name].features.map((feature, index) => (
            <div key={index} className="flex gap-2 justify-start text-white text-xs md:text-sm font-medium leading-[18px] md:leading-[22px] items-center">
              <span className="text-[#FFC107] relative top-[1px]"><FlashSolid className="w-4 h-4" /></span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Selection Tabs */}
      <div className="text-center">
        <h3 className="text-center justify-start text-primary_heading text-2xl lg:text-3xl font-bold mb-4">Select a Plan</h3>
        <div className="flex justify-center">
        <div className="flex gap-[2px] bg-primary_blue p-[2px] rounded-full"> 
          <button 
            onClick={() => setActiveDialogTab('1Month')}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${activeDialogTab === '1Month' ? 'bg-white text-primary_blue' : 'text-white'}`}
          >
            1 Month
          </button>
          <button 
            onClick={() => setActiveDialogTab('3Months')}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${activeDialogTab === '3Months' ? 'bg-white text-primary_blue' : 'text-white'}`}
          >
            3 Months
          </button>
        </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-[10px]">
          {currentDialogPlans.map((planItem) => (
            <button
              key={planItem.name}
              onClick={() => setSelectedPlanName(planItem.name)}
              className={`px-4 py-3 bg-white rounded-[10px] border flex gap-2 items-start w-full text-left  ${
                planItem.name === selectedPlanName
                  ? 'border-Black_light'
                  : 'border-[#f0f8ff] hover:border-blue-300'
              }`}
            >
       
              <div className="flex-1">
              <h4 className="justify-start text-primary_heading text-[22px] font-bold mb-1">{planItem.name}</h4>
              <p className="self-stretch justify-start text-Black_light text-base font-medium">{planItem.price}</p>
              <p className="self-stretch justify-start text-paragraph text-xs font-normal">One time purchase</p>
              </div>
                     {planItem.name === selectedPlanName && (
                <div className="flex justify-center mb-2">
                  <div className=" text-Black_light">
                    <CheckCircleSolid className="w-6" />
                  </div>
                </div>
              )}  
            </button>
          ))}
        </div>
      </div>

      {/* What You Get Section */}
      <div className="space-y-1">
        <h3 className="justify-start text-primary_heading text-base font-bold">What You Get</h3>
        <p className="self-stretch justify-start text-paragraph text-sm font-normal leading-7">
          This one-month subscription offers a meticulously designed preparation plan for PgMP certification, ensuring comprehensive and systematic readiness.
        </p>
        
        <ul className="space-y-1 list-disc ml-5">
          {whatYouGet.map((item, index) => (
            <li key={index} className="self-stretch justify-start text-paragraph text-sm font-normal leading-7">
              <span className="font-semibold">{item.title}</span>{' '}
              <span className="">{item.description}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 mt-4">
        <Button className="w-full max-h-[44px]">
          Buy Now
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 lg:gap-5">
          <Button variant="outline" className="underline max-h-[44px]">
            Or Start a Free Trial
          </Button>
          <Button variant="outline" className="underline max-h-[44px]">
            Use Freemium
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanDialog;
