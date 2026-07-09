import { useEffect, useState } from "react";
import ExamsTable from "../../../components/Questions/ViewReports/ExamsTabTable";
import { ExamsItem } from "@/components/Questions/ViewReports/exams.data";
import { ExamsColumns } from "@/components/Questions/ViewReports/exams.columns";
import {
  ReportData,
  RemarkRange,
} from "@/components/Questions/ViewReports/ViewReportDialog";
import api from "@/lib/axios";
import { useLocation, useNavigate } from "react-router-dom";

type MockExamResult = {
  _id: string;
  attemptNumber?: number | null;
  mockExamId?: {
    name?: string | null;
    remarks?: Array<{
      start?: number | null;
      end?: number | null;
      remarks?: string | null;
    }> | null;
  } | null;
  currentStatus?: string | null;
  timeTaken?: string | null;
  score?: string | null;
  status?: string | null;
  remarks?: string | null;
  remarksArr?: Array<{
    start?: number | null;
    end?: number | null;
    remarks?: string | null;
  }> | null;
  createdAt?: string | null;
  overallPercentage?: number | null;
  correct?: number | null;
  incorrect?: number | null;
  unanswered?: number | null;
  scoreBreakDown?: Record<
    string,
    {
      correct?: number | null;
      total?: number | null;
      percentage?: number | null;
    }
  > | null;
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
  remarks?: string | null;
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

const mapRemarkRanges = (
  rawRemarks?: Array<{
    start?: number | null;
    end?: number | null;
    remarks?: string | null;
  }> | null,
): RemarkRange[] =>
  (rawRemarks ?? [])
    .map((remark) => ({
      start: Number(remark.start ?? 0),
      end: Number(remark.end ?? 0),
      remarks: remark.remarks ?? "",
    }))
    .filter(
      (remark) =>
        Number.isFinite(remark.start) &&
        Number.isFinite(remark.end) &&
        Boolean(remark.remarks),
    )
    .sort((a, b) => a.start - b.start);

const ViewReports = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isPracticeReports = pathname.startsWith(
    "/practice-questions/view-reports"
  );
  const [tableData, setTableData] = useState<ExamsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [mockReportMap, setMockReportMap] = useState<Record<string, ReportData>>(
    {},
  );
  const [selectedReportId, setSelectedReportId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedAttemptNumber, setSelectedAttemptNumber] = useState<number | null>(
    null,
  );

  const handleViewReport = async (exam: ExamsItem) => {
    setSelectedReportId(isPracticeReports ? "" : exam.id);
    setSelectedExamId(isPracticeReports ? exam.id : "");
    setSelectedAttemptNumber(isPracticeReports ? exam.attemptNumber : null);

    if (!isPracticeReports) {
      setReportLoading(true);
      setReportData(mockReportMap[exam.id] ?? null);
      setReportLoading(false);
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
          correct: Number(values?.correct ?? 0),
          total: Number(values?.total ?? 0),
        })
      );

      const mappedReport: ReportData = {
        score: Number(payload.overallPercentage ?? 0),
        timeSpent: payload.timeTaken ?? "-",
        correct: Number(payload.correct ?? 0),
        incorrect: Number(payload.incorrect ?? 0),
        unanswered: Number(payload.unanswered ?? 0),
        remarks: payload.remarks ?? "",
        domains,
      };

      setReportData(mappedReport);
    } catch (error) {
      console.error("Failed to load practice exam report", error);
      setReportData(null);
    } finally {
      setReportLoading(false);
    }
  };

  const handleViewQuestions = () => {
    if (isPracticeReports && (!selectedExamId || selectedAttemptNumber === null)) {
      return;
    }
    if (!isPracticeReports && !selectedReportId) return;

    const params = new URLSearchParams(
      isPracticeReports
        ? {
            type: "practice",
            examId: selectedExamId,
            attemptNumber: String(selectedAttemptNumber),
          }
        : {
            type: "mock",
            reportId: selectedReportId,
          },
    );
    const path = isPracticeReports
      ? "/practice-questions/view-reports/questions"
      : "/exams/view-reports/questions";

    navigate(`${path}?${params.toString()}`);
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
          setMockReportMap({});
          const mappedPractice: ExamsItem[] = (data as PracticeExamResult[]).map(
            (item) => ({
              id: item.examId ?? "",
              examName: item.categoryName ?? "-",
              date: formatDate(item.date ?? null),
              timeTaken: item.timeTaken ?? "-",
              attemptNumber: item.attemptNumber ?? 0,
              score: item.scoreText ?? "-",
              status: item.status ?? "-",
              currentStatus: item.status ?? "-",
            })
          );
          setTableData(mappedPractice);
          return;
        }

        const nextMockReportMap: Record<string, ReportData> = {};
        const mockResults = data as MockExamResult[];

        const mapped: ExamsItem[] = mockResults.map((item) => {
          const scoreBreakDown = item.scoreBreakDown ?? {};
          const domains = Object.entries(scoreBreakDown).map(
            ([name, values]) => ({
              name,
              percentage: Number(values?.percentage ?? 0),
              correct: Number(values?.correct ?? 0),
              total: Number(values?.total ?? 0),
            }),
          );

          const mappedReport: ReportData = {
            score: Number(item.overallPercentage ?? 0),
            timeSpent: item.timeTaken ?? "-",
            correct: Number(item.correct ?? 0),
            incorrect: Number(item.incorrect ?? 0),
            unanswered: Number(item.unanswered ?? 0),
            remarks: item.remarks ?? "",
            remarkRanges: mapRemarkRanges(
              item.remarksArr ?? item.mockExamId?.remarks,
            ),
            domains,
          };

          nextMockReportMap[item._id] = mappedReport;

          return {
            id: item._id,
            examName: item.mockExamId?.name ?? "-",
            date: formatDate(item.createdAt ?? null),
            timeTaken: item.timeTaken ?? "-",
            attemptNumber: item.attemptNumber ?? 0,
            score: `${Number(item.overallPercentage ?? 0)}%`,
            status: item.status ?? "-",
            currentStatus: item.currentStatus ?? "-",
          };
        });

        setMockReportMap(nextMockReportMap);
        setTableData(mapped);
      } catch (error) {
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
  }, [pathname, isPracticeReports]);

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
          showViewQuestions={
            isPracticeReports
              ? Boolean(selectedExamId) && selectedAttemptNumber !== null
              : Boolean(selectedReportId)
          }
          onViewQuestions={handleViewQuestions}
        />
      )}
    </div>
  );
};

export default ViewReports;
