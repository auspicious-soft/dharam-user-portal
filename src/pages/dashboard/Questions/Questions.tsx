"use client";

import { useEffect, useState } from "react";
import { FileItem } from "@/components/Questions/questions.data";
import { Button } from "@/components/ui/button";
import { QuestionsColumns } from "@/components/Questions/questions.columns";
import QuestionsTable from "@/components/Questions/QuestionsTable";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { toast } from "sonner";

type PracticeExam = {
  _id?: string | null;
  id?: string | null;
  order?: number | null;
  name?: string | null;
  questionCount?: number | null;
  isPremium?: boolean | null;
  price?: number | string | null;
  status?: string | null;
};

const Questions = () => {
   const navigate = useNavigate();  
   const [data, setData] = useState<FileItem[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [practiceExamPrice, setPracticeExamPrice] = useState<number | null>(null);
   const [purchasingExamId, setPurchasingExamId] = useState<string | null>(null);

   useEffect(() => {
     const courseId = localStorage.getItem("selectedCourseId");
     if (!courseId) return;

     const fetchPracticeExams = async () => {
       setIsLoading(true);
       try {
         const response = await api.get(`/user/practice-exam/${courseId}`);
         const payload = (response.data as {
           data?:
             | PracticeExam[]
             | {
                 examData?: PracticeExam[];
                 attemptAvailable?: number;
                 price?: number | string | null;
               };
         })?.data;

         const hasExamArrayShape = Array.isArray(payload);
         const items = hasExamArrayShape ? payload : (payload?.examData ?? []);

         const rawAttempts = hasExamArrayShape ? null : payload?.attemptAvailable;
         const availableAttempts =
           typeof rawAttempts === "number" && Number.isFinite(rawAttempts)
             ? rawAttempts
             : 0;
         const hasAttemptLimitValue = rawAttempts != null;

         const parsedPrice =
           typeof payload === "object" &&
           payload != null &&
           !Array.isArray(payload) &&
           typeof payload.price === "number"
             ? payload.price
             : typeof payload === "object" &&
                 payload != null &&
                 !Array.isArray(payload) &&
                 payload.price != null
               ? Number(payload.price)
               : null;

         setPracticeExamPrice(
           parsedPrice != null && Number.isFinite(parsedPrice)
             ? parsedPrice
             : null
         );

         const mapped: FileItem[] = (Array.isArray(items) ? items : [])
           .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
           .map((item) => {
             const examLevelPrice =
               typeof item.price === "number"
                 ? item.price
                 : item.price != null
                   ? Number(item.price)
                   : null;
             const resolvedPrice =
               examLevelPrice != null && Number.isFinite(examLevelPrice)
                 ? examLevelPrice
                 : parsedPrice != null && Number.isFinite(parsedPrice)
                   ? parsedPrice
                   : null;

             return {
               id: item._id ?? item.id,
               categoryName: item.name ?? "Practice Exam",
               totalQuestions: `${item.questionCount ?? 0} Questions`,
               examTime: "Untimed",
               isPremium:
                 String(item.status ?? "").toUpperCase() === "ACTIVE"
                   ? false
                   : hasAttemptLimitValue
                     ? availableAttempts === 0
                     : (item.isPremium ?? Boolean((resolvedPrice ?? 0) > 0)),
               price: resolvedPrice,
             };
           });

         setData(mapped);
      } catch (error) {
         console.error("Failed to fetch practice exams", error);
      } finally {
         setIsLoading(false);
       }
     };

     void fetchPracticeExams();
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

  const createPracticeExamPurchase = async (exam: FileItem) => {
    if (!exam?.id) {
      toast.error("Invalid practice exam selected.");
      return;
    }
    const priceToPay = exam.price ?? practiceExamPrice;
    if (priceToPay == null || !Number.isFinite(priceToPay)) {
      toast.error("Practice exam price is unavailable.");
      return;
    }

    const callbackUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/practice-questions`
        : "/practice-questions";

    try {
      const response = await api.post("/user/create-purchase", {
        // type: "INDIVIDUAL",
        // amount: priceToPay,
        planId:null,
        purchasedProduct: exam.id,
        purchaseType: "PRACTICE_TEST",
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
      await createPracticeExamPurchase(exam);
    } finally {
      setPurchasingExamId(null);
    }
  };

  // const handleTopPremiumClick = async () => {
  //   const firstPurchasableExam = data.find((item) => Boolean(item.id));
  //   if (!firstPurchasableExam) {
  //     toast.error("No practice exam available to purchase.");
  //     return;
  //   }

  //   setIsPurchasingTop(true);
  //   try {
  //     await createPracticeExamPurchase(firstPurchasableExam);
  //   } finally {
  //     setIsPurchasingTop(false);
  //   }
  // };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-Black_light text-lg md:text-2xl font-bold nd:leading-[46px]">
            Practice Questions
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/practice-questions/view-reports")}
            variant="secondary"
            className="h-[44px] flex items-center gap-1 md:gap-2 "
          >
            View Reports
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 text-sm text-paragraph">Loading practice exams...</div>
      ) : (
        <QuestionsTable
          data={data}
          columns={QuestionsColumns({
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

export default Questions;
