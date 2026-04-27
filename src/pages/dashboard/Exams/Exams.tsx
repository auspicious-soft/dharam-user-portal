import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExamColumns } from "@/components/exams/examsPage.columns";
import ExamsPageTable from "@/components/exams/ExamsPageTable";
import { useNavigate } from "react-router-dom";
import { FileItem } from "@/components/exams/examsPage.data";
import api from "@/lib/axios";

type MockExam = {
  _id?: string | null;
  name?: string | null;
  numberOfQuestions?: number | null;
  timeInMin?: string | null;
  isPremium?: boolean | null;
  totalAttempt?: number | null;
  order?: number | null;
};

type PausedExam = {
  _id?: string | null;
  attemptNumber?: number | null;
  mockExamId?: MockExam | null;
  currentStatus?: string | null;
  timeTaken?: string | null;
  timeLeft?: string | null;
  overallPercentage?: number | null;
};

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
          `/user/mock-exam/${courseId}`
        );
        const payload = (response.data as {
          data?: {
            examData?: MockExam[];
            pausedExams?: PausedExam[];
          };
        })?.data;

        const examData = payload?.examData ?? [];
        const pausedExams = payload?.pausedExams ?? [];

        const mappedPaused: FileItem[] = (Array.isArray(pausedExams)
          ? pausedExams
          : []
        ).map((item) => {
          const mock = item.mockExamId ?? {};
          const percentage =
            typeof item.overallPercentage === "number"
              ? `${item.overallPercentage}%`
              : "-";

          return {
            id: mock._id ?? item._id ?? "",
            resumeId: item._id ?? "",
            examName: mock.name ?? "Mock Exam",
            totalQuestions: `${mock.numberOfQuestions ?? 0} Questions`,
            examTime: item.timeLeft ?? mock.timeInMin ?? "Untimed",
            attempts: String(item.attemptNumber ?? 0),
            correctPercentage: percentage,
            status: "Paused",
            isPremium: mock.isPremium ?? false,
          };
        });

        const mappedExams: FileItem[] = (Array.isArray(examData) ? examData : [])
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((item) => ({
            id: item._id ?? "",
            examName: item.name ?? "Mock Exam",
            totalQuestions: `${item.numberOfQuestions ?? 0} Questions`,
            examTime: item.timeInMin ?? "Untimed",
            attempts: String(item.totalAttempt ?? 0),
            correctPercentage: "-",
            status: "",
            isPremium: item.isPremium ?? false,
          }));

        setData([...mappedPaused, ...mappedExams]);
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
