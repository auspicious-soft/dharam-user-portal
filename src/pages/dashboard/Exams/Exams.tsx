import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExamColumns } from "@/components/exams/examsPage.columns";
import ExamsPageTable from "@/components/exams/ExamsPageTable";
import { useNavigate } from "react-router-dom";
import { FileItem } from "@/components/exams/examsPage.data";
import api from "@/lib/axios";
import { toast } from "sonner";

type MockExam = {
  _id?: string | null;
  name?: string | null;
  numberOfQuestions?: number | null;
  timeInMin?: string | null;
  isPremium?: boolean | null;
  totalAttempt?: number | null;
  order?: number | null;
  price?: number | string | null;
  status?: string | null;
  currentStatus?: string | null;
  correctPercentage?: number | null;
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
  const [examPrice, setExamPrice] = useState<number | null>(null);
  const [purchasingExamId, setPurchasingExamId] = useState<string | null>(null);

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
            price?: number | string | null;
          };
        })?.data;

        const examData = payload?.examData ?? [];
        const pausedExams = payload?.pausedExams ?? [];
        const parsedExamPrice =
          typeof payload?.price === "number"
            ? payload.price
            : payload?.price != null
              ? Number(payload.price)
              : null;
        setExamPrice(
          parsedExamPrice != null && Number.isFinite(parsedExamPrice)
            ? parsedExamPrice
            : null
        );

        const mappedPaused: FileItem[] = (Array.isArray(pausedExams)
          ? pausedExams
          : []
        ).map((item) => {
          const mock = item.mockExamId ?? {};
          return {
            id: mock._id ?? item._id ?? "",
            resumeId: item._id ?? "",
            examName: mock.name ?? "Mock Exam",
            totalQuestions: `${mock.numberOfQuestions ?? 0} Questions`,
            questionCount: mock.numberOfQuestions ?? 0,
            examTime: item.timeLeft ?? mock.timeInMin ?? "Untimed",
            attempts: String(item.attemptNumber ?? 0),
            correctPercentage: "",
            status: "Paused",
            currentStatus: item.currentStatus ?? "PAUSED",
            isPremium: mock.isPremium ?? false,
            price:
              typeof mock.price === "number"
                ? mock.price
                : mock.price != null
                  ? Number(mock.price)
                  : null,
          };
        });

        const mappedExams: FileItem[] = (Array.isArray(examData) ? examData : [])
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((item) => {
            const status = String(item.status ?? "").toUpperCase();
            const isPremium =
              status === "ACTIVE"
                ? false
                : status === "INACTIVE"
                  ? true
                  : (item.isPremium ?? false);
            const itemPrice =
              typeof item.price === "number"
                ? item.price
                : item.price != null
                  ? Number(item.price)
                  : null;

            return {
              id: item._id ?? "",
              examName: item.name ?? "Mock Exam",
              totalQuestions: `${item.numberOfQuestions ?? 0} Questions`,
              questionCount: item.numberOfQuestions ?? 0,
              examTime: item.timeInMin ?? "Untimed",
              attempts: status ? "":  String(item.totalAttempt ?? 0) ,
              correctPercentage:
                !isPremium && typeof item.correctPercentage === "number"
                  ? `${item.correctPercentage}%`
                  : "",
              status: item.currentStatus ?? "",
              currentStatus: item.currentStatus ?? null,
              isPremium,
              price:
                parsedExamPrice != null && Number.isFinite(parsedExamPrice)
                  ? parsedExamPrice
                  : itemPrice != null && Number.isFinite(itemPrice)
                    ? itemPrice
                    : null,
            };
          });

        setData([...mappedPaused, ...mappedExams]);
      } catch (error) {
        console.error("Failed to fetch mock exam", error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMockExam();
  }, []);

  const resolveRedirectUrl = (responseData: unknown): string | null => {
    const parsed = responseData as
      | {
          url?: string;
          checkoutUrl?: string;
          data?: { url?: string; checkoutUrl?: string };
        }
      | undefined;

    return (
      parsed?.data?.url ??
      parsed?.data?.checkoutUrl ??
      parsed?.url ??
      parsed?.checkoutUrl ??
      null
    );
  };

  const createMockExamPurchase = async (exam: FileItem) => {
    if (!exam?.id) {
      toast.error("Invalid mock exam selected.");
      return;
    }

    const callbackUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/exams`
        : "/exams";

    try {
      const response = await api.post("/user/create-purchase", {
        type: "INDIVIDUAL",
        amount: examPrice ?? exam.price ?? null,
        purchasedProduct: exam.id,
        purchaseType: "MOCK_EXAM",
        success_url: callbackUrl,
        cancel_url: callbackUrl,
      });

      const redirectUrl = resolveRedirectUrl(response.data);
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      const message =
        (response.data as { message?: string })?.message ??
        "Purchase request created successfully.";
      toast.success(message);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Unable to create purchase.";
      toast.error(message);
    }
  };

  const handleBuyPremiumExam = async (exam: FileItem) => {
    setPurchasingExamId(exam.id);
    try {
      await createMockExamPurchase(exam);
    } finally {
      setPurchasingExamId(null);
    }
  };



  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-Black_light text-lg md:text-2xl font-bold">
            Mock Exams
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/exams/view-reports")}
            variant="secondary"
            className="h-[44px]"
          >
            View Reports
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 text-sm text-paragraph">Loading mock exams...</div>
      ) : (
        <ExamsPageTable
          data={data}
          columns={ExamColumns({
            onBuyPremiumExam: (exam) => {
              void handleBuyPremiumExam(exam);
            },
            purchasingExamId,
          })}
        />
      )}
    </div>
  );
};

export default Exams;
