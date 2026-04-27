import { useEffect, useState } from "react";
import ExamsTable from "../../../components/Questions/ViewReports/ExamsTabTable";
import { ExamsItem } from "@/components/Questions/ViewReports/exams.data";
import { ExamsColumns } from "@/components/Questions/ViewReports/exams.columns";
import { ReportData } from "@/components/Questions/ViewReports/ViewReportDialog";
import api from "@/lib/axios";
import { useLocation } from "react-router-dom";

type MockExamResult = {
  _id: string;
  attemptNumber?: number | null;
  mockExamId?: {
    name?: string | null;
  } | null;
  currentStatus?: string | null;
  timeTaken?: string | null;
  score?: string | null;
  createdAt?: string | null;
};

type PracticeExamResult = {
  examId?: string | null;
  categoryName?: string | null;
  date?: string | null;
  timeTaken?: string | null;
  attemptNumber?: number | null;
  scoreText?: string | null;
  status?: string | null;
};

type PracticeExamBoard = {
  correct?: number | null;
  incorrect?: number | null;
  unanswered?: number | null;
  overallPercentage?: number | null;
  timeTaken?: string | null;
  scoreBreakDown?: Record<
    string,
    {
      correct?: number | null;
      total?: number | null;
      percentage?: number | null;
    }
  > | null;
};

const ViewReports = () => {
  const { pathname } = useLocation();
  const isPracticeReports = pathname.startsWith(
    "/practice-questions/view-reports"
  );
  const [tableData, setTableData] = useState<ExamsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const handleViewReport = async (exam: ExamsItem) => {
    if (!isPracticeReports) {
      return;
    }

    try {
      setReportLoading(true);
      setReportData(null);
      const response = await api.get("/user/practice-exam-result-board", {
        params: {
          examId: exam.id,
          attemptNumber: exam.attemptNumber,
        },
      });

      const payload = (response.data as { data?: PracticeExamBoard })?.data;
      if (!payload) {
        setReportData(null);
        return;
      }

      const scoreBreakDown = payload.scoreBreakDown ?? {};
      const domains = Object.entries(scoreBreakDown).map(
        ([name, values]) => ({
          name,
          percentage: Number(values?.percentage ?? 0),
        })
      );

      const mappedReport: ReportData = {
        score: Number(payload.overallPercentage ?? 0),
        timeSpent: payload.timeTaken ?? "-",
        correct: Number(payload.correct ?? 0),
        incorrect: Number(payload.incorrect ?? 0),
        unanswered: Number(payload.unanswered ?? 0),
        domains,
      };

      setReportData(mappedReport);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load practice exam report", error);
      setReportData(null);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchReports = async () => {
      try {
        setIsLoading(true);

        const endpoint = isPracticeReports
          ? "/user/all-practice-exam-result-board"
          : "/user/all-mock-exam-result";

        const response = await api.get(endpoint);
        const data = (response.data as { data?: unknown })?.data ?? [];

        if (!isMounted || !Array.isArray(data)) {
          return;
        }

        const formatDate = (raw?: string | null) => {
          if (!raw) return "-";
          const d = new Date(raw);
          if (Number.isNaN(d.getTime())) return "-";
          const day = String(d.getDate()).padStart(2, "0");
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const year = d.getFullYear();
          return `${day}-${month}-${year}`;
        };

        if (isPracticeReports) {
          const mappedPractice: ExamsItem[] = (data as PracticeExamResult[]).map(
            (item) => ({
              id: item.examId ?? "",
              examName: item.categoryName ?? "-",
              date: formatDate(item.date ?? null),
              timeTaken: item.timeTaken ?? "-",
              attemptNumber: item.attemptNumber ?? 0,
              score: item.scoreText ?? "-",
              status: item.status ?? "Unfinished",
            })
          );
          setTableData(mappedPractice);
          return;
        }

        const mapped: ExamsItem[] = data.map((item) => {
          const status =
            item.currentStatus === "COMPLETED" ? "Completed" : "Unfinished";
          return {
            id: item._id,
            examName: item.mockExamId?.name ?? "-",
            date: formatDate(item.createdAt ?? null),
            timeTaken: item.timeTaken ?? "-",
            attemptNumber: item.attemptNumber ?? 0,
            score: item.score ?? "-",
            status,
          };
        });

        setTableData(mapped);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to load mock exam results", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReports();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <h2 className="text-Black_light text-lg md:text-2xl font-bold md:leading-[46px]">
          Reports
        </h2>
      </div>
      {isLoading ? (
        <div className="text-sm text-paragraph">Loading reports...</div>
      ) : (
        <ExamsTable
          data={tableData}
          columns={ExamsColumns}
          onViewReport={handleViewReport}
          reportData={reportData}
          reportLoading={reportLoading}
        />
      )}
    </div>
  );
};

export default ViewReports;
