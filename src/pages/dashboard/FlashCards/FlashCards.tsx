import FlashCardsItem from "@/components/flashCards/FlashCardsItem";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TableSearch from "@/components/reusableComponents/TableSearch";
import api from "@/lib/axios";
import { toast } from "sonner";

type FlashCategory = {
  id: string;
  name: string;
  status?: string | null;
  price?: number | null;
};

const htmlToText = (value: unknown): string => {
  const raw = String(value ?? "");
  if (!raw) return "";

  if (typeof window === "undefined") {
    return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const doc = new DOMParser().parseFromString(raw, "text/html");
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
};

const FlashCards = () => {
  const [categories, setCategories] = useState<FlashCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState<
    Array<{ id: string; frontText: string; backText: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasingCategory, setIsPurchasingCategory] = useState(false);

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId
  );
  const isSelectedCategoryInactive =
    String(selectedCategory?.status ?? "").toUpperCase() === "INACTIVE";
  const areAllCategoriesInactive =
    categories.length > 0 &&
    categories.every(
      (category) => String(category.status ?? "").toUpperCase() === "INACTIVE"
    );
  const shouldShowPremiumButton =
    areAllCategoriesInactive || isSelectedCategoryInactive;

  useEffect(() => {
    const courseId =
      localStorage.getItem("selectedCourseId")

    const fetchCategories = async () => {
      try {
        const response = await api.get("/user/flashcard-categories", {
          params: { courseId },
        });
        const data = (response.data as { data?: any[] })?.data ?? [];
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item._id ?? item.id,
          name: item.categoryName ?? "Category",
          status: item.status ?? null,
          price:
            typeof item.price === "number"
              ? item.price
              : item.price != null
                ? Number(item.price)
                : null,
        }));
        setCategories(mapped);
        if (!selectedCategoryId && mapped.length > 0) {
          setSelectedCategoryId(mapped[0].id);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch flashcard categories", error);
        setCategories([]);
      }
    };

    void fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) return;

    let isActive = true;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const response = await api.get("/user/flashcards", {
          params: { categoryId: selectedCategoryId, search },
        });
        const data = (response.data as { data?: any[] })?.data ?? [];
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item._id ?? item.id,
          frontText: htmlToText(item.frontText),
          backText: htmlToText(item.backText),
        }));
        if (isActive) {
          setCards(mapped);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch flashcards", error);
        if (isActive) {
          setCards([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [selectedCategoryId, search]);

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

  const handleBuyFlashCategory = async () => {
    if (!selectedCategory) {
      toast.error("Please select a flashcard category first.");
      return;
    }

    setIsPurchasingCategory(true);
    try {
      const callbackUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/flash-cards`
          : "/flash-cards";

      const response = await api.post("/user/create-purchase", {
        type: "INDIVIDUAL",
        amount: selectedCategory.price ?? null,
        purchasedProduct: selectedCategory.id,
        purchaseType: "FLASH_CARDS",
        success_url: callbackUrl,
        cancel_url: callbackUrl,
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
      setIsPurchasingCategory(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between flex-col lg:flex-row gap-4 items-center">
        <h2 className="justify-start text-2xl font-bold w-full lg:w-auto">
          Flash Cards
        </h2>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-3 mt-3">
        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
          <SelectTrigger className="max-w-72 py-[11px]">
            <SelectValue placeholder="Select A Category" />
          </SelectTrigger>
          <SelectContent> 
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 md:gap-3 items-center">
          {shouldShowPremiumButton ? (
            <button
              className="px-4 py-2 min-h-[40px] rounded-full text-xs font-semibold bg-gradient-to-r from-[#ff6402] to-[#fdb22b] text-white disabled:opacity-70"
              onClick={() => {
                void handleBuyFlashCategory();
              }}
              disabled={isPurchasingCategory}
            >
              {isPurchasingCategory ? "Processing..." : "Premium"}
            </button>
          ) : null}
          <TableSearch
            value={search}
            onChange={setSearch}
            placeholder="Search flashcards"
          />
        </div>  
      </div>

      {isLoading ? (
        <div className="p-4 text-sm text-paragraph">Loading flashcards...</div>
      ) : cards.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <FlashCardsItem
              key={card.id}
              frontText={card.frontText}
              backText={card.backText}
              isLocked={isSelectedCategoryInactive}
            />
          ))}
        </div>
      ) : (
        <div className="p-4 text-sm text-paragraph">
          No flashcards available for this category.
        </div>
      )}
    </div>
  );
};

export default FlashCards;
