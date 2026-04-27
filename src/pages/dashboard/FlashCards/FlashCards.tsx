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


const FlashCards = () => {
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState<
    Array<{ id: string; frontText: string; backText: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

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
          frontText: item.frontText ?? "",
          backText: item.backText ?? "",
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
