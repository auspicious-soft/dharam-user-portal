import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExamColumns } from "@/components/exams/examsPage.columns";
import ExamsPageTable from "@/components/exams/ExamsPageTable";
import { useNavigate } from "react-router-dom";
import { FileItem } from "@/components/exams/examsPage.data";
import api from "@/lib/axios";

const Exams = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const courseId = localStorage.getItem("selectedCourseId");
    if (!courseId) return;

    const fetchMockExam = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(
          "/user/mock-exam/695777e1b2583161bd12b88e",
          
        );
        const examData = (response.data as { data?: { examData?: any[] } })
          ?.data?.examData ?? [];

        const mapped: FileItem[] = (Array.isArray(examData) ? examData : [])
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((item: any) => ({
            id: item._id ?? item.id,
            examName: item.name ?? "Mock Exam",
            totalQuestions: `${item.numberOfQuestions ?? 0} Questions`,
            examTime: item.timeInMin ?? "Untimed",
            attempts: String(item.totalAttempt ?? 0),
            correctPercentage: "-",
            status: "",
            isPremium: item.isPremium ?? false,
          }));

        setData(mapped);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch mock exam", error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMockExam();
  }, []);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <h2 className="text-Black_light text-lg md:text-2xl font-bold">
          Mock Exams
        </h2>
        <Button
          onClick={() => navigate("/exams/view-reports")}
          variant="secondary"
          className="h-[44px]"
        >
          View Reports
        </Button>
      </div>

      {isLoading ? (
        <div className="p-4 text-sm text-paragraph">Loading mock exams...</div>
      ) : (
        <ExamsPageTable data={data} columns={ExamColumns()} />
      )}
    </div>
  );
};

export default Exams;
