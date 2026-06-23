// questions.columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { FileItem } from "./questions.data";
import { Button } from "../ui/button";
import { ArrowRight } from "iconoir-react";
import { useNavigate } from "react-router-dom";

type QuestionsColumnsOptions = {
  onBuyPremiumExam?: (exam: FileItem) => void;
  purchasingExamId?: string | null;
};

export const QuestionsColumns = ({
  onBuyPremiumExam,
  purchasingExamId = null,
}: QuestionsColumnsOptions = {}): ColumnDef<FileItem>[] => {
  const columns: ColumnDef<FileItem>[] = [
    {
      accessorKey: "categoryName",
      header: "Category Name",
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const navigate = useNavigate();
        const isPremium = row.original.isPremium;
        const hasQuestions = Number(row.original.questionCount ?? 0) > 0;

        return (
          <div className="flex items-center gap-2">
            <div
              onClick={() => {
                if (!isPremium && hasQuestions) {
                  navigate(
                    `/practice-questions/questions-view/${row.original.id}`,
                    { state: { examName: row.original.categoryName } }
                  );
                }
              }}
              className={`text-left ${
                isPremium || !hasQuestions
                  ? "cursor-not-allowed"
                  : " hover:underline cursor-pointer"
              }`}
            >
              {row.original.categoryName}
            </div>
            {isPremium && <></>}
          </div>
        );
      },
    },
    { accessorKey: "totalQuestions", header: "Exam Length" }, 
    { accessorKey: "examTime", header: "Exam Time" }, 
    {
      header: "Action",
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const navigate = useNavigate();
        const isPremium = row.original.isPremium;
        const hasQuestions = Number(row.original.questionCount ?? 0) > 0;
      
        if (!hasQuestions) {
          return (
            <div className="max-w-[190px] text-xs font-medium leading-5 text-paragraph">
              There is no question to start exam.
            </div>
          );
        }

        return isPremium ? (
          <button
            onClick={() => onBuyPremiumExam?.(row.original)}
            disabled={purchasingExamId === row.original.id}
            style={{
              background:
                "linear-gradient(#f0f8ff, #f0f8ff) padding-box, linear-gradient(60deg, #ff6402, #fdb22b) border-box",
              border: "1px solid transparent",
            }}
            className="px-4 py-0 rounded-[99px] text-[10px] font-medium bg-gradient-to-r from-[#ff6402] to-[#fdb22b] bg-clip-text text-[#ff6402]"
          >
            {purchasingExamId === row.original.id ? "Processing..." : "Premium"}
          </button>
        ) : (
          <Button
            onClick={() =>
              navigate(`/practice-questions/questions-view/${row.original.id}`, {
                state: { examName: row.original.categoryName },
              })
            }
            size="icon"
            variant="link"
            className="text-primary_blue"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return columns;
};
