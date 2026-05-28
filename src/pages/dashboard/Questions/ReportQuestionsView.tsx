import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ReportQuestionReview from "@/components/Questions/ViewReports/ReportQuestionReview";
import {
  normalizeReportQuestions,
} from "@/components/Questions/ViewReports/reportQuestions";
import type { ReportQuestionItem } from "@/components/Questions/ViewReports/reportQuestions";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

type ExamReportQuestionsResponse = {
  data?: unknown;
};

const ReportQuestionsView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState<ReportQuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const reportType = searchParams.get("type") === "mock" ? "mock" : "practice";
  const reportId = searchParams.get("reportId") ?? "";
  const examId = searchParams.get("examId") ?? "";
  const attemptNumber = searchParams.get("attemptNumber") ?? "";

  const fallbackPath = useMemo(
    () =>
      reportType === "mock"
        ? "/exams/view-reports"
        : "/practice-questions/view-reports",
    [reportType],
  );

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackPath);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchQuestions = async () => {
      const hasRequiredParams =
        reportType === "mock"
          ? Boolean(reportId)
          : Boolean(examId) && Boolean(attemptNumber);

      if (!hasRequiredParams) {
        setQuestions([]);
        setErrorMessage("Missing report details.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const response =
          reportType === "mock"
            ? await api.get("/user/exam-report-questions", {
                params: { reportId },
              })
            : await api.get("/user/practice-exam-result-board-question", {
                params: { examId, attemptNumber: Number(attemptNumber) },
              });

        if (!isMounted) return;

        const payload = (response.data as ExamReportQuestionsResponse)?.data;
        setQuestions(normalizeReportQuestions(payload));
      } catch (error) {
        console.error("Failed to fetch report questions", error);
        if (isMounted) {
          setQuestions([]);
          setErrorMessage("Failed to load report questions.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchQuestions();

    return () => {
      isMounted = false;
    };
  }, [attemptNumber, examId, reportId, reportType]);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center gap-5">
        <Button
          variant="outline"
          size="icon"
          onClick={handleBack}
          className="p-2 rounded-full border hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-Black_light text-xl lg:text-2xl font-bold">
          Question Review
        </h1>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-[#d9e8ff] bg-[#f7fbff] p-5 text-sm text-paragraph">
          Loading questions...
        </div>
      ) : errorMessage ? (
        <div className="rounded-lg border border-[#d9e8ff] bg-[#f7fbff] p-5 text-sm text-paragraph">
          {errorMessage}
        </div>
      ) : (
        <ReportQuestionReview questions={questions} />
      )}
    </div>
  );
};

export default ReportQuestionsView;
