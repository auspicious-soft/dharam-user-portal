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

type FlashCard = {
  id: string;
  categoryId: string;
  frontText: string;
  backText: string;
  price?: number | null;
};

type FlashCategoryApiItem = {
  _id?: string;
  id?: string;
  categoryName?: string;
  status?: string | null;
  price?: number | string | null;
};

type FlashCardApiItem = {
  _id?: string;
  id?: string;
  categoryId?: string;
  frontText?: unknown;
  backText?: unknown;
  price?: number | string | null;
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
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [purchasingFlashCardId, setPurchasingFlashCardId] = useState<
    string | null
  >(null);

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

  useEffect(() => {
    const courseId =
      localStorage.getItem("selectedCourseId")

    const fetchCategories = async () => {
      try {
        const response = await api.get("/user/flashcard-categories", {
          params: { courseId },
        });
        const data =
          (response.data as { data?: FlashCategoryApiItem[] })?.data ?? [];
        const mapped = (Array.isArray(data) ? data : []).flatMap((item) => {
          const id = item._id ?? item.id;
          if (!id) return [];

          return [
            {
              id,
              name: item.categoryName ?? "Category",
              status: item.status ?? null,
              price:
                typeof item.price === "number"
                  ? item.price
                  : item.price != null
                    ? Number(item.price)
                    : null,
            },
          ];
        });
        setCategories(mapped);
        setSelectedCategoryId((currentCategoryId) =>
          currentCategoryId || mapped[0]?.id || ""
        );
      } catch (error) {
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
        const data =
          (response.data as { data?: FlashCardApiItem[] })?.data ?? [];
        const mapped = (Array.isArray(data) ? data : []).flatMap((item) => {
          const id = item._id ?? item.id;
          const categoryId = item.categoryId ?? selectedCategoryId;
          if (!id || !categoryId) return [];

          return [
            {
              id,
              categoryId,
              frontText: htmlToText(item.frontText),
              backText: htmlToText(item.backText),
              price:
                typeof item.price === "number"
                  ? item.price
                  : item.price != null
                    ? Number(item.price)
                    : null,
            },
          ];
        });
        if (isActive) {
          setCards(mapped);
        }
      } catch (error) {
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

  const handleBuyFlashCard = async (flashCard: FlashCard) => {
    setPurchasingFlashCardId(flashCard.id);
    try {
      const callbackUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/flash-cards`
          : "/flash-cards";

      const response = await api.post("/user/create-purchase", {
        type: "INDIVIDUAL",
        amount: flashCard.price ?? selectedCategory?.price ?? null,
        purchasedProduct: flashCard.categoryId,
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
      setPurchasingFlashCardId(null);
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
              isLocked={areAllCategoriesInactive || isSelectedCategoryInactive}
              isPurchasing={purchasingFlashCardId === card.id}
              onPurchase={() => {
                void handleBuyFlashCard(card);
              }}
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
