// questions.columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { FileItem } from "./questions.data";
import { Button } from "../ui/button";
import { ArrowRight } from "iconoir-react";
import { useNavigate } from "react-router-dom";

export const QuestionsColumns = (): ColumnDef<FileItem>[] => {
  const columns: ColumnDef<FileItem>[] = [
    {
      accessorKey: "categoryName",
      header: "Category Name",
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const navigate = useNavigate();
        const isPremium = row.original.isPremium;

        return (
          <div className="flex items-center gap-2">
            <div
              onClick={() => {
                if (!isPremium) {
                  navigate(
                    `/practice-questions/questions-view/${row.original.id}`,
                  );
                }
              }}
              className={`text-left ${
                isPremium
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
      
        return isPremium ? (
          <button
            style={{
              background:
                "linear-gradient(#f0f8ff, #f0f8ff) padding-box, linear-gradient(60deg, #ff6402, #fdb22b) border-box",
              border: "1px solid transparent",
            }}
            className="px-4 py-0 rounded-[99px] text-[10px] font-medium bg-gradient-to-r from-[#ff6402] to-[#fdb22b] bg-clip-text text-[#ff6402]"
          >
            Premium
          </button>
        ) : (
          <Button
            onClick={() =>
              navigate(`/practice-questions/questions-view/${row.original.id}`)
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
