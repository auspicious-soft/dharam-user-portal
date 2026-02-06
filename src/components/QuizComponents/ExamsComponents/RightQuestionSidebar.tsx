import { PauseExamDialog } from "@/components/exams/PauseExamDialog";
import { SubmitExamDialog } from "@/components/exams/SubmitExamDialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, PauseSolid, ShieldQuestion } from "iconoir-react";
import { useState } from "react";

interface Props {
  total: number;
  current: number;
  results: Record<number, boolean>;
  marked: Set<number>;
  onJump: (index: number) => void;
}

export const RightQuestionSidebar = ({
  total,
  current,
  results,
  marked,
  onJump,
}: Props) => {
  const getStatus = (i: number) => {
    // Marked questions (red) - highest priority
    if (marked.has(i)) return "bg-[#ff0000] text-white";

    // Completed/Answered questions (blue)
    if (results[i] !== undefined) return "bg-primary_heading text-white";

    // Not attempted (visited but skipped without answering) - grey
    if (i < current && results[i] === undefined)
      return "bg-paragraph text-white";

    // Default - white background for unvisited questions
    return "bg-white border border-gray-300 text-gray-700";
  };

  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pauseExitDialog, setPauseExitDialog] = useState(false);

  // Calculate counts
  const completedCount = Object.keys(results).length;
  const markedCount = marked.size;

  return (
    <div className="w-full bg-light-blue p-3 border-t-[1px] border-white">
      <div className="bg-primary_blue flex flex-col gap-3 p-4 rounded-[16px]">
        <div className="flex justify-between gap-4">
          <div className="">
            <h6 className="justify-start text-white text-sm font-normal leading-5">
              Completed
            </h6>
            <div className="text-center justify-start">
              <span className="text-white text-[36px] font-bold capitalize">
                {completedCount}
              </span>
              <span className="text-white text-base font-bold capitalize">
                /{total}
              </span>
            </div>
          </div>
          <div className="">
            <h6 className="justify-start text-white text-sm font-normal leading-5">
              Marked
            </h6>
            <div className="text-center justify-start">
              <span className="text-white text-[36px] font-bold capitalize">
                {markedCount}
              </span>
              <span className="text-white text-base font-bold capitalize">
                /{total}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            size="icon"
            className="rounded-[10px] !bg-white text-primary_blue w-[50px] h-[50px]"
            onClick={() => setPauseExitDialog(true)}
          >
            <PauseSolid />
          </Button>
          <Button
            className="rounded-[10px] flex-1 !bg-white text-primary_blue justify-between !px-3"
            onClick={() => setShowExitDialog(true)}
          >
            Submit Exam <ArrowRight />
          </Button>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div className="inline-flex justify-start items-center gap-2.5 ">
          <div className="relative text-paragraph ">
            <ShieldQuestion className="w-5 h-5" />
          </div>
          <p className="justify-start text-paragraph text-sm font-semibold leading-[30px]">
            Questions List
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 ">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => onJump(i)}
              className={`
              w-10 h-10 rounded-[10px] text-paragraph text-xs border-0
              flex items-center justify-center
              transition-all
              ${getStatus(i)}
              ${current === i ? "ring-1 ring-primary_blue ring-offset-1" : ""}
            `}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      <PauseExamDialog
        open={pauseExitDialog}
        onClose={() => setPauseExitDialog(false)}
      />
      <SubmitExamDialog
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
      />
    </div>
  );
};
