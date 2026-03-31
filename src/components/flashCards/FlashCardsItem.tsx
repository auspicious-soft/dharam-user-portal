import { useState } from "react";

type FlashCardItemProps = {
  frontText: string;
  backText: string;
};

const FlashCardsItem = ({ frontText, backText }: FlashCardItemProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      onClick={() => setIsFlipped((prev) => !prev)}
      className="relative min-h-44 cursor-pointer"
    >
      <div className="w-full h-full [perspective:1000px]">
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center p-4 bg-light-blue rounded-[20px] outline outline-1 outline-[#556378]/40 hover:shadow-md transition-shadow"
            style={{ backfaceVisibility: "hidden" }}
          >
            <h4 className="text-center text-sm font-medium leading-7 text-Desc-464646">
              {frontText}
            </h4>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center p-4 bg-light-blue rounded-[20px] outline outline-1 outline-[#556378]/40 hover:shadow-md transition-shadow"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <h4 className="text-center text-sm font-medium leading-7 text-Desc-464646">
              {backText}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCardsItem;
