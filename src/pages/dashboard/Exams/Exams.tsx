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
  price?: number | null;
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
  const [attemptAvailable, setAttemptAvailable] = useState<number>(0);
  const [examPrice, setExamPrice] = useState<number | null>(null);
  const [purchasingExamId, setPurchasingExamId] = useState<string | null>(null);
  const [isPurchasingTop, setIsPurchasingTop] = useState(false);

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
            attemptAvailable?: number;
            price?: number | string | null;
          };
        })?.data;

        const examData = payload?.examData ?? [];
        const pausedExams = payload?.pausedExams ?? [];
        const availableAttempts = Number(payload?.attemptAvailable ?? 0);
        const parsedExamPrice =
          typeof payload?.price === "number"
            ? payload.price
            : payload?.price != null
              ? Number(payload.price)
              : null;
        setAttemptAvailable(availableAttempts);
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
          .map((item) => ({
            id: item._id ?? "",
            examName: item.name ?? "Mock Exam",
            totalQuestions: `${item.numberOfQuestions ?? 0} Questions`,
            examTime: item.timeInMin ?? "Untimed",
            attempts: String(item.totalAttempt ?? 0),
            correctPercentage: "-",
            status: "",
            isPremium:
              availableAttempts === 0 ? true : (item.isPremium ?? false),
            price:
              parsedExamPrice != null && Number.isFinite(parsedExamPrice)
                ? parsedExamPrice
                : typeof item.price === "number"
                  ? item.price
                  : item.price != null
                    ? Number(item.price)
                    : null,
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

  const handleTopPremiumClick = async () => {
    const firstPurchasableExam = data.find((item) => item.status !== "Paused");
    if (!firstPurchasableExam) {
      toast.error("No mock exam available to purchase.");
      return;
    }
    setIsPurchasingTop(true);
    try {
      await createMockExamPurchase(firstPurchasableExam);
    } finally {
      setIsPurchasingTop(false);
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-Black_light text-lg md:text-2xl font-bold">
            Mock Exams
          </h2>
          <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-primary_blue">
            Attempts Available: {attemptAvailable}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/exams/view-reports")}
            variant="secondary"
            className="h-[44px]"
          >
            View Reports
          </Button>
          {attemptAvailable === 0 ? (
            <button
              onClick={() => {
                void handleTopPremiumClick();
              }}
              disabled={isPurchasingTop}
              style={{
                background:
                  "linear-gradient(#f0f8ff, #f0f8ff) padding-box, linear-gradient(60deg, #ff6402, #fdb22b) border-box",
                border: "1px solid transparent",
              }}
              className="px-4 py-0 rounded-[99px] text-[10px] font-medium bg-gradient-to-r from-[#ff6402] to-[#fdb22b] bg-clip-text text-[#ff6402]"
            >
              {isPurchasingTop ? "Processing..." : "Premium"}
            </button>
          ) : null}
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
