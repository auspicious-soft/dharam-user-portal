// FlashCardDetail.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MCQRenderer } from "@/components/QuizComponents/MCQRenderer";
import { flashCardsData } from "@/components/flashCards/flashCards.data";
import { ArrowLeft } from "lucide-react";

const FlashCardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  // Find the flash card by id
  const flashCard = flashCardsData.find((card) => card.id === id);

  if (!flashCard) {
    return (
      <div className="flex flex-col gap-5">
        <div className="p-6 text-center text-gray-500">
          Flash card not found
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setShowResult(true);
      setIsFlipping(false);
    }, 300);
  };

  const handleBack = () => {
    navigate("/flash-cards");
  };

  return (
    <div className="flex flex-col gap-5">
     <div className="flex items-center gap-5">
        <Button
          variant="outline"
          size="icon"
          onClick={handleBack}
         className="p-2 rounded-full border hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
         <h1 className="justify-start text-Black_light text-xl lg:text-2xl font-bold">
          Flash Card
        </h1>
      </div>

      <div className="inline-flex flex-col justify-start min-h-[71vh]">
        <div className="perspective-1000 w-full max-w-3xl m-auto">
          <div
            className={`relative w-full transition-transform duration-600 transform-style-3d ${
              isFlipping ? "rotate-y-180" : ""
            }`}
            style={{
              transformStyle: "preserve-3d",
              transition: "transform 0.6s",
              transform: showResult ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front of card - Question */}
            <div
              className="self-stretch p-4 md:p-5 bg-[#f0f8ff] rounded-[20px] inline-flex flex-col justify-start gap-2.5 w-full backface-hidden"
              style={{
                backfaceVisibility: "hidden",
                display: showResult ? "none" : "flex",
              }}
            >
              <div className="flex justify-end gap-4">
                <Button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                  variant="link"
                  className="text-primary_heading"
                >
                  Submit
                </Button>
              </div>

              <p className="justify-start text-paragraph text-base leading-6">
                {flashCard.question.question}
              </p>

              {/* <div className="mb-4">
                <span className="px-[18px] bg-white rounded-[99px] outline outline-1 outline-offset-[-1px] outline-paragraph inline-flex justify-start items-center gap-2.5 text-paragraph text-xs font-medium leading-[30px]">
                  Max Selections: 1
                </span>
              </div> */}

              <div className="mt-4">
                <MCQRenderer
                  question={flashCard.question}
                  selectedAnswer={selectedAnswer}
                  setSelectedAnswer={setSelectedAnswer}
                  showResult={false}
                />
              </div>
            </div>

            {/* Back of card - Solution */}
            {showResult && flashCard.question.qExplanation && (
              <div
                className="self-stretch p-4 md:p-5 bg-[#f0f8ff] rounded-[20px] min-h-[334px] flex items-center justify-center w-full backface-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  position: showResult ? "relative" : "absolute",
                  top: 0,
                  left: 0,
                }}
              >
                <div className="self-stretch inline-flex flex-col border border-light-blue justify-center items-start w-full gap-2.5">
                  <div className="justify-start text-Desc-464646 text-base font-semibold leading-5 mb-2">
                    Solution
                  </div>

                  <div className="px-4 py-2 bg-[#6aa56d] rounded-lg inline-flex justify-center items-center gap-2.5">
                    <div className="justify-start text-white text-sm font-medium leading-6">
                      Option {flashCard.question.correctAnswer.toUpperCase()} is
                      correct answer
                    </div>
                  </div>

                  <p className="justify-start text-paragraph text-sm font-medium">
                    Explanation: {flashCard.question.qExplanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backfaceVisibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default FlashCardDetail;
