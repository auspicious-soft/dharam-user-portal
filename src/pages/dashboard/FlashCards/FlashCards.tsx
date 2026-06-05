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
import { getPublicUrlForKey } from "@/utils/s3Upload";

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
  frontImage?: string;
  backImage?: string;
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
  frontImage?: unknown;
  backImage?: unknown;
  price?: number | string | null;
};

const normalizeFlashCardHtml = (value: unknown): string => {
  const raw = String(value ?? "");
  if (!raw) return "";

  if (typeof window === "undefined") {
    return raw;
  }

  const doc = new DOMParser().parseFromString(raw, "text/html");
  const allowedTags = new Set([
    "B",
    "BR",
    "EM",
    "I",
    "LI",
    "OL",
    "P",
    "SPAN",
    "STRONG",
    "U",
    "UL",
    "TABLE",
    "THEAD",
    "TBODY",
    "TFOOT",
    "TR",
    "TH",
    "TD",
    "COLGROUP",
    "COL",
  ]);
  const blockedTags = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT"]);

  doc.body.querySelectorAll("*").forEach((element) => {
    if (blockedTags.has(element.tagName)) {
      element.remove();
      return;
    }

    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    const htmlElement = element as HTMLElement;
    const color = htmlElement.style.color;
    const backgroundColor = htmlElement.style.backgroundColor;
    const textAlign = htmlElement.style.textAlign;
    const width = htmlElement.style.width;
    const height = htmlElement.style.height;
    const padding = htmlElement.style.padding;
    const margin = htmlElement.style.margin;
    const borderCollapse = htmlElement.style.borderCollapse;

    Array.from(element.attributes).forEach((attribute) => {
      element.removeAttribute(attribute.name);
    });

    const style: string[] = [];
    if (color) style.push(`color: ${color}`);
    if (backgroundColor) style.push(`background-color: ${backgroundColor}`);
    if (textAlign) style.push(`text-align: ${textAlign}`);
    if (width) style.push(`width: ${width}`);
    if (height) style.push(`height: ${height}`);
    if (padding) style.push(`padding: ${padding}`);
    if (margin) style.push(`margin: ${margin}`);
    if (borderCollapse) style.push(`border-collapse: ${borderCollapse}`);
    if (style.length) {
      element.setAttribute("style", style.join("; "));
    }
  });

  return doc.body.innerHTML.trim();
};

const resolveAssetUrl = (value: unknown): string | undefined => {
  const raw = String(value ?? "").trim();
  if (!raw) return undefined;
  return /^https?:\/\//i.test(raw) ? raw : getPublicUrlForKey(raw);
};

const FlashCards = () => {
  const [categories, setCategories] = useState<FlashCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isCardsLoading, setIsCardsLoading] = useState(false);
  const [purchasingFlashCardId, setPurchasingFlashCardId] = useState<
    string | null
  >(null);

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const isSelectedCategoryInactive =
    String(selectedCategory?.status ?? "").toUpperCase() === "INACTIVE";
  const areAllCategoriesInactive =
    categories.length > 0 &&
    categories.every(
      (category) => String(category.status ?? "").toUpperCase() === "INACTIVE",
    );

  useEffect(() => {
    const courseId = localStorage.getItem("selectedCourseId");

    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
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
        setSelectedCategoryId(
          (currentCategoryId) => currentCategoryId || mapped[0]?.id || "",
        );
      } catch (error) {
        console.error("Failed to fetch flashcard categories", error);
        setCategories([]);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    void fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setIsCardsLoading(false);
      setCards([]);
      return;
    }

    let isActive = true;
    setIsCardsLoading(true);

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
              frontText: normalizeFlashCardHtml(item.frontText),
              backText: normalizeFlashCardHtml(item.backText),
              frontImage: resolveAssetUrl(item.frontImage),
              backImage: resolveAssetUrl(item.backImage),
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
          setIsCardsLoading(false);
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
        <Select
          value={selectedCategoryId}
          onValueChange={setSelectedCategoryId}
        >
          <SelectTrigger
            className="max-w-72 py-[11px]"
            disabled={isCategoriesLoading || categories.length === 0}
          >
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

      {isCategoriesLoading ? (
        <div className="p-4 text-sm text-paragraph">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="p-4 text-sm text-paragraph">
          No flashcard categories available.
        </div>
      ) : isCardsLoading ? (
        <div className="p-4 text-sm text-paragraph">Loading flashcards...</div>
      ) : cards.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cards.map((card) => (
            <FlashCardsItem
              key={card.id}
              frontText={card.frontText}
              backText={card.backText}
              frontImage={card.frontImage}
              backImage={card.backImage}
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
