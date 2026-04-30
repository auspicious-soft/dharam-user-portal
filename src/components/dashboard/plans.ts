export interface Plan {
  name: string;
  price: string;
  priceId?: string | null;
  features: string[];
  benefits: string[];
  popular: boolean;
}
export type DurationTab = "oneMonth" | "threeMonths";
export type DialogTab = "1Month" | "3Months";
