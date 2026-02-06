// Updated FlashCardsItem.tsx
import { useNavigate } from "react-router-dom";

type FlashCardItemProps = {
  id: string;
  question: string; 
};

const FlashCardsItem = ({ id, question }: FlashCardItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/flash-cards/flash-detail/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="p-4 relative bg-light-blue rounded-[20px] outline outline-1 outline-[#556378]/40 flex flex-col items-center gap-[10px] justify-center min-h-44 cursor-pointer hover:shadow-md transition-shadow"
    >
      <h4 className="text-center text-sm font-medium leading-7 text-Desc-464646">
        {question}
      </h4>
    </div>
  );
};

export default FlashCardsItem;