import { useEffect, useState } from "react";
import ExamsTable from "../../../components/Questions/ViewReports/ExamsTabTable";
import { ExamsItem } from "@/components/Questions/ViewReports/exams.data";
import { ExamsColumns } from "@/components/Questions/ViewReports/exams.columns";
import {
  ReportData,
  ReportQuestionItem,
} from "@/components/Questions/ViewReports/ViewReportDialog";
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

type ExamReportQuestionsResponse = {
  data?: unknown;
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
  const [mockReportMap, setMockReportMap] = useState<Record<string, ReportData>>(
    {},
  );
  const [selectedReportId, setSelectedReportId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedAttemptNumber, setSelectedAttemptNumber] = useState<number | null>(
    null,
  );
  const [viewQuestionsLoading, setViewQuestionsLoading] = useState(false);
  const [showQuestionsScreen, setShowQuestionsScreen] = useState(false);
  const [reportQuestions, setReportQuestions] = useState<ReportQuestionItem[]>([]);

  const normalizeReportQuestions = (raw: unknown): ReportQuestionItem[] => {
    if (!Array.isArray(raw)) return [];

    return raw.map((item, index) => {
      const row = (item ?? {}) as Record<string, unknown>;
      const question = (row.questionId ?? {}) as Record<string, unknown>;
      const dnd = (question.dnd ?? {}) as Record<string, unknown>;

      return {
        _id: String(row._id ?? index),
        examId: row.examId ? String(row.examId) : undefined,
        isCorrect:
          row.isCorrect === null
            ? null
            : typeof row.isCorrect === "boolean"
              ? row.isCorrect
              : undefined,
        isAttempted:
          typeof row.isAttempted === "boolean" ? row.isAttempted : undefined,
        questionId: {
          _id: String(question._id ?? ""),
          question: question.question ? String(question.question) : "",
          type: question.type ? String(question.type) : "",
          explaination: question.explaination
            ? String(question.explaination)
            : "",
          maxSelection:
            typeof question.maxSelection === "number"
              ? question.maxSelection
              : undefined,
          mcq: Array.isArray(question.mcq)
            ? question.mcq.map((option, optionIndex) => {
                const mcqOption = (option ?? {}) as Record<string, unknown>;
                return {
                  _id: mcqOption._id
                    ? String(mcqOption._id)
                    : `${index}-${optionIndex}`,
                  text: mcqOption.text ? String(mcqOption.text) : "",
                  isCorrect:
                    typeof mcqOption.isCorrect === "boolean"
                      ? mcqOption.isCorrect
                      : false,
                };
              })
            : [],
          fib: Array.isArray(question.fib)
            ? question.fib.map((blank, blankIndex) => {
                const fibItem = (blank ?? {}) as Record<string, unknown>;
                return {
                  _id: fibItem._id
                    ? String(fibItem._id)
                    : `${index}-fib-${blankIndex}`,
                  answer: fibItem.answer ? String(fibItem.answer) : "",
                  correctOrder:
                    typeof fibItem.correctOrder === "number"
                      ? fibItem.correctOrder
                      : undefined,
                };
              })
            : [],
          dnd: {
            pairs: Array.isArray(dnd.pairs)
              ? dnd.pairs.map((pair, pairIndex) => {
                  const dndPair = (pair ?? {}) as Record<string, unknown>;
                  return {
                    leftId: dndPair.leftId ? String(dndPair.leftId) : `${pairIndex}`,
                    leftText: dndPair.leftText ? String(dndPair.leftText) : "",
                    rightId: dndPair.rightId ? String(dndPair.rightId) : "",
                  };
                })
              : [],
            options: Array.isArray(dnd.options)
              ? dnd.options.map((option, optionIndex) => {
                  const dndOption = (option ?? {}) as Record<string, unknown>;
                  return {
                    id: dndOption.id ? String(dndOption.id) : `${optionIndex}`,
                    text: dndOption.text ? String(dndOption.text) : "",
                  };
                })
              : [],
          },
        },
      };
    });
  };

  const handleViewReport = async (exam: ExamsItem) => {
    setSelectedReportId(isPracticeReports ? "" : exam.id);
    setSelectedExamId(isPracticeReports ? exam.id : "");
    setSelectedAttemptNumber(isPracticeReports ? exam.attemptNumber : null);
    setShowQuestionsScreen(false);
    setReportQuestions([]);

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
      console.error("Failed to load practice exam report", error);
      setReportData(null);
    } finally {
      setReportLoading(false);
    }
  };

  const handleViewQuestions = async () => {
    if (isPracticeReports && (!selectedExamId || selectedAttemptNumber === null)) {
      return;
    }
    if (!isPracticeReports && !selectedReportId) return;

    try {
      setViewQuestionsLoading(true);

      const response = isPracticeReports
        ? await api.get("/user/practice-exam-result-board-question", {
            params: {
              examId: selectedExamId,
              attemptNumber: selectedAttemptNumber,
            },
          })
        : await api.get("/user/exam-report-questions", {
            params: {
              reportId: selectedReportId,
            },
          });

      const payload = (response.data as ExamReportQuestionsResponse)?.data;
      setReportQuestions(normalizeReportQuestions(payload));
      setShowQuestionsScreen(true);
    } catch (error) {
      console.error("Failed to fetch exam report questions", error);
    } finally {
      setViewQuestionsLoading(false);
    }
  };

  const handleBackToReport = () => {
    setShowQuestionsScreen(false);
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
              status: item.status ?? "Unfinished",
            })
          );
          setTableData(mappedPractice);
          return;
        }

        const nextMockReportMap: Record<string, ReportData> = {};
        const mockResults = data as MockExamResult[];

        const mapped: ExamsItem[] = mockResults.map((item) => {
          const status =
            item.currentStatus === "COMPLETED" ? "Completed" : "Unfinished";

          const scoreBreakDown = item.scoreBreakDown ?? {};
          const domains = Object.entries(scoreBreakDown).map(
            ([name, values]) => ({
              name,
              percentage: Number(values?.percentage ?? 0),
            }),
          );

          const mappedReport: ReportData = {
            score: Number(item.overallPercentage ?? 0),
            timeSpent: item.timeTaken ?? "-",
            correct: Number(item.correct ?? 0),
            incorrect: Number(item.incorrect ?? 0),
            unanswered: Number(item.unanswered ?? 0),
            domains,
          };

          nextMockReportMap[item._id] = mappedReport;

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
          viewQuestionsLoading={viewQuestionsLoading}
          showQuestionsScreen={showQuestionsScreen}
          onBackToReport={handleBackToReport}
          reportQuestions={reportQuestions}
        />
      )}
    </div>
  );
};

export default ViewReports;
