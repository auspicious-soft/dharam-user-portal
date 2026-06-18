export interface Plan {
  planId?: string | null;
  name: string;
  description?: string | null;
  price: string;
  accessLabel: string;
  priceId?: string | null;
  features: string[];
  benefits: string[];
  popular: boolean;
  isPurchased?: boolean;
  expiryDate?: string | null;
}
export type DurationTab = "oneMonth" | "threeMonths";
export type DialogTab = "1Month" | "3Months";
