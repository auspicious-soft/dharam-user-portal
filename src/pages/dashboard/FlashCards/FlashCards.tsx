import FlashCardsItem from "@/components/flashCards/FlashCardsItem";
import React, { useState } from "react";
import { flashCardsData } from "@/components/flashCards/flashCards.data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TableSearch from "@/components/reusableComponents/TableSearch";


const FlashCards = () => {
  const [cards] = useState(flashCardsData);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between flex-col lg:flex-row gap-4 items-center">
        <h2 className="justify-start text-2xl font-bold w-full lg:w-auto">
          Flash Cards
        </h2>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-3 mt-3">
        <Select>
          <SelectTrigger className="max-w-72 py-[11px]">
            <SelectValue placeholder="Select A Category" />
          </SelectTrigger>
          <SelectContent> 
            <SelectItem value="Category1">Category 1</SelectItem>
            <SelectItem value="Category2">Category 2</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1 md:gap-3 items-center">
          <TableSearch />
        </div>  
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <FlashCardsItem
            key={card.id}
            id={card.id}
           question={card.question.question}
          />
        ))}
      </div>
    </div>
  );
};

export default FlashCards;
