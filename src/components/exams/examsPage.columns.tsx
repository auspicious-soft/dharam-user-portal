
import { ColumnDef } from "@tanstack/react-table";
import { FileItem } from "./examsPage.data";
import { Button } from "../ui/button";
import { ArrowRight, FastArrowRight } from "iconoir-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";

export const ExamColumns = (): ColumnDef<FileItem>[] => {
  const columns: ColumnDef<FileItem>[] = [
    {
      accessorKey: "examName",
      header: "Exam Name",
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const navigate = useNavigate();
        const isPremium = row.original.isPremium;
        const isPaused = row.original.status === "Paused";

        const handleResume = async () => {
          try {
            const resumeId = row.original.resumeId ?? row.original.id;
            const response = await api.get(
              `/user/mock-exam-questions/${resumeId}`,
              {
                params: { type: "PAUSED" },
              }
            );
            const mockExamData = (response.data as { data?: any })?.data ?? null;
            navigate(`/exams/start/${row.original.id}`, {
              state: { mockExam: mockExamData },
            });
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Failed to resume mock exam", error);
          }
        };

        return (
          <div className="flex items-center gap-2">
            <div
              onClick={() => {
                if (isPaused) {
                  void handleResume();
                  return;
                }
                if (!isPremium) {
                  navigate(
                    `/exams/mock-exams/${row.original.id}`,
                  );
                }
              }}
              className={`text-left ${
                isPremium
                  ? "cursor-not-allowed"
                  : " hover:underline cursor-pointer"
              }`}
            >
              {row.original.examName}
            </div>
            {isPremium && <></>}
          </div>
        );
      },
    },
    { accessorKey: "totalQuestions", header: "Exam Length" }, 
    { accessorKey: "examTime", header: "Exam Time" }, 
    { accessorKey: "attempts", header: "Attempts" }, 
    { accessorKey: "correctPercentage", header: "Correct Percentage" },  
  {
  accessorKey: "status",
  header: "Status",
  cell: ({ row }) => {
    const status = row.original.status;

    if (status === "Complete") {
      return (
        <span className="text-[#4CAF50] underline">
          Completed
        </span>
      );
    }

    if (status === "Paused") {
      return (
        <span className="text-[#f59e0b] underline">
          Paused
        </span>
      );
    }

    return null;
  },
},
  
    {
      header: "Action",
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const navigate = useNavigate();
        const isPremium = row.original.isPremium;
        const isPaused = row.original.status === "Paused";

        const handleResume = async () => {
          try {
            const resumeId = row.original.resumeId ?? row.original.id;
            const response = await api.get(
              `/user/mock-exam-questions/${resumeId}`,
              {
                params: { type: "PAUSED" },
              }
            );
            const mockExamData = (response.data as { data?: any })?.data ?? null;
            navigate(`/exams/start/${row.original.id}`, {
              state: { mockExam: mockExamData },
            });
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Failed to resume mock exam", error);
          }
        };

        if (isPaused) {
          return (
            <Button
              onClick={handleResume}
              size="sm"
              className="h-[32px]"
            >
              Resume
            </Button>
          );
        }
      
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
              navigate(`/exams/mock-exams/${row.original.id}`)
            }
            size="icon"
            variant="link"
            className="text-primary_blue"
          >
            <FastArrowRight className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return columns;
};
