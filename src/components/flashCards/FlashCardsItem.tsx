import { useState } from "react";

type FlashCardItemProps = {
  frontText: string;
  backText: string;
  isLocked?: boolean;
  isPurchasing?: boolean;
  onPurchase?: () => void;
};

const FlashCardsItem = ({
  frontText,
  backText,
  isLocked = false,
  isPurchasing = false,
  onPurchase,
}: FlashCardItemProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      onClick={() => {
        if (!isLocked) {
          setIsFlipped((prev) => !prev);
        }
      }}
      className={`relative min-h-44 ${isLocked ? "" : "cursor-pointer"}`}
    >
      <div className="w-full h-full [perspective:1000px]">
        <div
          className={`relative w-full h-full transition-transform duration-500 ${
            isLocked ? "opacity-80" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center p-4 bg-light-blue rounded-[20px] outline outline-1 outline-[#556378]/40 hover:shadow-md transition-shadow overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <h4 className="w-full max-h-full overflow-y-auto break-words whitespace-pre-wrap text-center text-sm font-medium leading-6 text-Desc-464646">
              {isLocked ? "Premium content" : frontText}
            </h4>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center p-4 bg-light-blue rounded-[20px] outline outline-1 outline-[#556378]/40 hover:shadow-md transition-shadow overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <h4 className="w-full max-h-full overflow-y-auto break-words whitespace-pre-wrap text-center text-sm font-medium leading-6 text-Desc-464646">
              {isLocked ? "Premium content" : backText}
            </h4>
          </div>
        </div>
      </div>
      {isLocked ? (
        <div className="absolute inset-0 rounded-[20px] bg-white/25 flex items-center justify-center">
          <button
            type="button"
            className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#ff6402] to-[#fdb22b] disabled:opacity-70"
            onClick={(event) => {
              event.stopPropagation();
              onPurchase?.();
            }}
            disabled={isPurchasing}
          >
            {isPurchasing ? "Processing..." : "Premium"}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default FlashCardsItem;
