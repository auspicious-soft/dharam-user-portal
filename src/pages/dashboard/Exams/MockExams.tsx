import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "@/lib/axios";

type MockExamQuestionsResponse = {
  data?: {
    questions?: unknown[];
  } | null;
};

type MockExamSummary = {
  _id?: string | null;
  numberOfQuestions?: number | null;
  timeInMin?: string | number | null;
};

type MockExamListResponse = {
  data?: {
    examData?: MockExamSummary[];
    pausedExams?: Array<{
      mockExamId?: MockExamSummary | null;
    }>;
  };
};

const formatDurationInMinutes = (value?: string | number | null) => {
  if (value == null) return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.max(0, Math.trunc(value)));
  }

  const text = String(value).trim();
  if (!text) return null;

  if (text.includes(":")) {
    const parts = text.split(":").map((part) => Number(part));
    if (parts.some((part) => Number.isNaN(part))) return null;

    const seconds =
      parts.length === 3
        ? parts[0] * 3600 + parts[1] * 60 + parts[2]
        : parts.length === 2
          ? parts[0] * 60 + parts[1]
          : parts[0] * 60;

    return String(Math.ceil(seconds / 60));
  }

  const numericValue = Number(text);
  if (Number.isFinite(numericValue)) {
    return String(Math.max(0, Math.trunc(numericValue)));
  }

  const numericMatch = text.match(/\d+/);
  return numericMatch?.[0] ?? null;
};

const MockExams = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [startMessage, setStartMessage] = useState("");
  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<string | null>(null);

  useEffect(() => {
    const courseId = localStorage.getItem("selectedCourseId");
    if (!courseId || !id) return;

    const fetchExamDetails = async () => {
      try {
        const response = await api.get(`/user/mock-exam/${courseId}`);
        const payload = (response.data as MockExamListResponse)?.data;
        const exam =
          payload?.examData?.find((item) => item._id === id) ??
          payload?.pausedExams
            ?.map((item) => item.mockExamId)
            .find((item) => item?._id === id);

        setQuestionCount(exam?.numberOfQuestions ?? null);
        setDurationMinutes(formatDurationInMinutes(exam?.timeInMin));
      } catch (error) {
        console.error("Failed to load mock exam details", error);
      }
    };

    void fetchExamDetails();
  }, [id]);

  const handleStartExam = async () => {
    setStartMessage("");
    setIsStarting(true);

    try {
      const response = await api.get(
        `/user/mock-exam-questions/${id}`,
        {
          params: { type: "STARTED" },
        },
      );
      const mockExamData =
        (response.data as MockExamQuestionsResponse)?.data ?? null;
      const questions = Array.isArray(mockExamData?.questions)
        ? mockExamData.questions
        : [];

      if (questions.length === 0) {
        setStartMessage("No questions are available for this exam yet.");
        return;
      }

      navigate(`/exams/start/${id}`, { state: { mockExam: mockExamData } });
    } catch (error) {
      console.error("Failed to fetch mock exam questions", error);
      setStartMessage("Unable to load exam questions. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const displayedQuestionCount = questionCount ?? "X";
  const displayedDuration = durationMinutes ?? "Y";

  return (
    <div className="flex flex-col gap-7">
      <div className="self-stretch inline-flex flex-col justify-start items-start gap-[30px]">
        <h2 className="text-Black_light text-lg md:text-2xl font-bold">
          Mock Exams
        </h2>
        <div className="self-stretch flex flex-col justify-start items-start gap-10">
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <h2 className="text-Black_light text-lg md:text-2xl font-bold">
              Mock Exam Instructions
            </h2>
            <p className="self-stretch justify-start text-paragraph text-sm ">
              Please read the following instructions carefully before starting
              your mock exam. Once the test begins, the timer will start
              automatically and you have the option to pause the exam during the
              session.
            </p>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <h2 className="text-Black_light text-lg md:text-2xl font-bold">
              General Guidelines
            </h2>
            <ul className="self-stretch justify-start text-paragraph text-sm space-y-1 list-disc pl-5">
              <li>
                This exam includes {displayedQuestionCount} questions, to be
                completed within {displayedDuration} minutes.
              </li>
              <li>
                You can pause and resume the test anytime — your time and
                progress will be saved.
              </li>
              <li>
                Questions may include single or multiple correct answers.
              </li>
              <li>
                Each question carries one mark unless mentioned otherwise.
              </li>
            </ul>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <h2 className="text-Black_light text-lg md:text-2xl font-bold">
              Navigation &amp; Controls
            </h2>
            <ul className="self-stretch justify-start text-paragraph text-sm space-y-1 list-disc pl-5">
              <li>Use Next and Previous to move between questions.</li>
              <li>
                Access any question directly from the Question List on the
                right.
              </li>
              <li>Click Mark &amp; Next to flag questions for later review.</li>
            </ul>
            <div className="flex flex-wrap gap-4 pl-2 mt-1">
              <p className="text-paragraph text-sm flex flex-wrap items-center gap-1">
                <span className="h-3.5 w-3.5 rounded-full bg-primary_heading" />
                Completed
              </p>
              <p className="text-paragraph text-sm flex flex-wrap items-center gap-1">
                <span className="h-3.5 w-3.5 rounded-full bg-paragraph" /> Not
                Attempted
              </p>
              <p className="text-paragraph text-sm flex flex-wrap items-center gap-1">
                <span className="h-3.5 w-3.5 rounded-full bg-[#ff0000]" /> Marked
                for Review{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center w-full mt-3">
        <Button
          onClick={handleStartExam}
          disabled={isStarting}
          className="max-w-96 w-full rounded-[10px]"
        >
          {isStarting ? "Loading Exam..." : "Start Exam"} <ArrowRight />
        </Button>
      </div>
      {startMessage ? (
        <p className="text-center text-sm font-medium text-[#B42318]">
          {startMessage}
        </p>
      ) : null}
    </div>
  );
};

export default MockExams;
