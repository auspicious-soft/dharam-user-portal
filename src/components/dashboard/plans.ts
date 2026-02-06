export type PlanName = "Silver" | "Gold" | "Platinum";

export interface Plan {
  name: PlanName;
  price: string;
  features: string[];
  popular: boolean;
}
export type DurationTab = "oneMonth" | "threeMonths";
export type DialogTab = "1Month" | "3Months";