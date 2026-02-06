import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MCQRenderer } from "@/components/QuizComponents/MCQRenderer";
import { DragDropRenderer } from "@/components/QuizComponents/DragDropRenderer";
import { FillBlankRenderer } from "@/components/QuizComponents/FillBlankRenderer";
import { QuizQuestion } from "@/components/QuizComponents/quiz.types";
import QuestionDayIcon from "@/assets/edit-question-icon.png";
import { useNavigate } from "react-router-dom";

// Sample questions pool - you can expand this with more questions
const DAILY_QUESTIONS: QuizQuestion[] = [
  {
    id: "daily-q1",
    type: "mcq",
    question:
      "Which action is most important during the initial program assessment?",
    options: [
      { id: "a", text: "Deciding the project budget" },
      { id: "b", text: "Identifying technical resources" },
      { id: "c", text: "Defining program objectives and requirements" },
      { id: "d", text: "Selecting team members" },
    ],
    correctAnswer: "c",
    qExplanation:
      "Defining objectives and requirements ensures alignment with organizational strategy.",
  },
  {
    id: "daily-q2",
    type: "fillblank",
    question: "Complete the following statement about project management:",
    questionTemplate:
      "The __1__ creates the __2__ which authorizes the __3__ and gives the __4__ authority to use __5__ resources.",
    blanks: [
      { id: "1", correctAnswer: "Sponsor" },
      { id: "2", correctAnswer: "Project Charter" },
      { id: "3", correctAnswer: "Project" },
      { id: "4", correctAnswer: "Project Manager" },
      { id: "5", correctAnswer: "Organizational" },
    ],
    options: [
      "Sponsor",
      "Project Charter",
      "Project",
      "Project Manager",
      "Organizational",
      "Stakeholder",
      "Budget",
      "Team Members",
      "Schedule",
      "Requirements",
    ],
    qExplanation:
      "The sponsor creates the project charter to formally authorize the project and give the project manager authority.",
  },
  {
    id: "daily-q3",
    type: "mcq",
    question: "What is the primary purpose of a project charter?",
    options: [
      { id: "a", text: "Define project budget" },
      { id: "b", text: "Formally authorize the project" },
      { id: "c", text: "Assign team members" },
      { id: "d", text: "Create project schedule" },
    ],
    correctAnswer: "b",
    qExplanation:
      "The project charter formally authorizes the project and gives the project manager authority.",
  },
];

const DayQuestion = () => {
      const navigate = useNavigate();
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [dragDropAnswers, setDragDropAnswers] = useState<
    Record<number, Record<string, string>>
  >({});
  const [fillBlankAnswers, setFillBlankAnswers] = useState<
    Record<number, Record<number, string>>
  >({});
  const [showResult, setShowResult] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [, setIsCorrect] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get question index based on date (cycles through available questions)
  const getQuestionIndexForToday = () => {
    const today = getTodayDate();
    const startDate = new Date("2025-01-01"); // Reference start date
    const currentDate = new Date(today);
    const daysDiff = Math.floor(
      (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysDiff % DAILY_QUESTIONS.length;
  };

  // Check if user has already completed today's question
  const checkCompletionStatus = () => {
    const today = getTodayDate();
    const storedDate = localStorage.getItem("dailyQuestionDate");
    const storedCompleted = localStorage.getItem("dailyQuestionCompleted");

    if (storedDate === today && storedCompleted === "true") {
      setIsCompleted(true);
      return true;
    }
    return false;
  };

  // Initialize question on component mount
  useEffect(() => {
    const alreadyCompleted = checkCompletionStatus();

    if (!alreadyCompleted) {
      const questionIndex = getQuestionIndexForToday();
      setQuestion(DAILY_QUESTIONS[questionIndex]);
    }
  }, []);

  // Check if answer is provided
  const isAnswered = () => {
    if (!question) return false;

    if (question.type === "mcq") {
      return selectedAnswer !== null;
    } else if (question.type === "dragdrop") {
      const currentAnswers = dragDropAnswers[0] || {};
      return Object.keys(currentAnswers).length === question.dropZones.length;
    } else if (question.type === "fillblank") {
      const currentAnswers = fillBlankAnswers[0] || {};
      const assignedBlanks = new Set(Object.values(currentAnswers));
      return question.blanks.every((blank) => assignedBlanks.has(blank.id));
    }
    return false;
  };

  // Check if the answer is correct
  const checkAnswer = () => {
    if (!question) return false;

    let correct = false;

    if (question.type === "mcq") {
      correct = selectedAnswer === question.correctAnswer;
    } else if (question.type === "dragdrop") {
      const currentAnswers = dragDropAnswers[0] || {};
      correct = question.dropZones.every(
        (zone) => currentAnswers[zone.id] === zone.correctItemId,
      );
    } else if (question.type === "fillblank") {
      const currentAnswers = fillBlankAnswers[0] || {};
      correct = question.blanks.every((blank) => {
        const assignedOptionIndex = Object.keys(currentAnswers).find(
          (key) => currentAnswers[parseInt(key)] === blank.id,
        );
        if (assignedOptionIndex === undefined) return false;
        return (
          question.options[parseInt(assignedOptionIndex)] ===
          blank.correctAnswer
        );
      });
    }

    return correct;
  };

  // Handle submit
  const handleSubmit = () => {
    const correct = checkAnswer();
    setIsCorrect(correct);
    setShowResult(true);

    // Mark as completed for today
    const today = getTodayDate();
    localStorage.setItem("dailyQuestionDate", today);
    localStorage.setItem("dailyQuestionCompleted", "true");
    setIsCompleted(true);
  };

  // Get question type label
  const getQuestionTypeLabel = () => {
    if (!question) return "";

    switch (question.type) {
      case "mcq":
        return "Multiple Choice";
      case "dragdrop":
        return "Drag & Drop";
      case "fillblank":
        return "Fill in the Blanks";
      default:
        return "";
    }
  };

  // If already completed today
  if (isCompleted && !showResult) {
    return (
      <div className="flex flex-col gap-5">
        <div className=" inline-flex flex-col justify-start min-h-[77vh]">
          <div className="self-stretch p-4 md:p-[30px] bg-[#f0f8ff] rounded-[20px] inline-flex flex-col justify-start gap-2.5 max-w-xl w-full m-auto">
            <div className="p-4 bg-green-50 rounded-full">
              <img
                src={QuestionDayIcon}
                className="max-w-[80px] md:max-w-[100px] m-auto"
              />
            </div>
            <div className="text-center">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-Black_light  mb-2 capitalize">
                Question of the day
              </h2>
              <p className="text-paragraph ">
                You’ve already completed the question of the day. Next question
                will unlock in{" "}
                {new Date(
                  new Date().setDate(new Date().getDate() + 1),
                ).toLocaleDateString()}
              </p>
              <Button
                          className="h-[44px] flex items-center gap-1 md:gap-2 w-full mt-6"
                          onClick={() => navigate("/")}
                        >
                          Got It
                        </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-Black_light  mb-2 capitalize">
          Question of the day
        </h2>
        <div className="p-6 text-center text-gray-500">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-Black_light  mb-2 capitalize">
        Question of the day
      </h2>
      <div className=" inline-flex flex-col justify-start min-h-[71vh]">
        <div className="self-stretch p-4 md:p-[30px] bg-[#f0f8ff] rounded-[20px] inline-flex flex-col justify-start gap-2.5 max-w-3xl w-full m-auto">
          <div className="flex justify-end gap-4">
            {!showResult && (
              <Button
                onClick={handleSubmit}
                disabled={!isAnswered()}
                variant="link"
                className="text-primary_heading"
              >
                Submit
              </Button>
            )}
          </div>

          <p className="justify-start text-paragraph text-base leading-6">
            {question.question}
          </p>

          {question.type === "mcq" && (
            <div className="mb-4">
              <span className="px-[18px] bg-white rounded-[99px] outline outline-1 outline-offset-[-1px] outline-paragraph inline-flex justify-start items-center gap-2.5 text-paragraph text-xs font-medium leading-[30px]">
                Max Selections: 1
              </span>
            </div>
          )}
          {(question.type === "dragdrop" || question.type === "fillblank") && (
            <div className="mb-4">
              <span className="px-[18px] bg-white rounded-[99px] outline outline-1 outline-offset-[-1px] outline-paragraph inline-flex justify-start items-center gap-2.5 text-paragraph text-xs font-medium leading-[30px]">
                {getQuestionTypeLabel()}
              </span>
            </div>
          )}

          <div className="mt-4">
            {question.type === "mcq" && (
              <MCQRenderer
                question={question}
                selectedAnswer={selectedAnswer}
                setSelectedAnswer={setSelectedAnswer}
                showResult={showResult}
              />
            )}

            {question.type === "dragdrop" && (
              <DragDropRenderer
                question={question}
                answers={dragDropAnswers}
                setAnswers={setDragDropAnswers}
                showResult={showResult}
                currentQuestionIndex={0}
              />
            )}

            {question.type === "fillblank" && (
              <FillBlankRenderer
                question={question}
                answers={fillBlankAnswers}
                setAnswers={setFillBlankAnswers}
                showResult={showResult}
                currentQuestionIndex={0}
              />
            )}
          </div>

          {showResult && question.qExplanation && (
            <div className="self-stretch p-4 bg-white rounded-lg inline-flex flex-col border border-light-blue justify-start items-start gap-2.5 mt-5">
              <div className="justify-start text-Desc-464646 text-base font-semibold leading-5 mb-2">
                Solution
              </div>

              {question.type === "mcq" && (
                <div className="px-4 py-2 bg-[#6aa56d] rounded-lg inline-flex justify-center items-center gap-2.5">
                  <div className="justify-start text-white text-sm font-medium leading-6">
                    Option {question.correctAnswer.toUpperCase()} is correct
                    answer
                  </div>
                </div>
              )}

              {question.type === "dragdrop" && (
                <div className="">
                  <div className="space-y-2">
                    {question.dropZones.map((zone) => {
                      const correctItem = question.draggableItems.find(
                        (item) => item.id === zone.correctItemId,
                      );
                      return (
                        <div
                          key={zone.id}
                          className="flex items-center gap-4 text-sm"
                        >
                          <div className="w-64 px-3 py-2 bg-[#D2FFC9] border border-[#D2FFC9] rounded-lg text-sm font-medium text-gray-800">
                            {correctItem?.text}
                          </div>
                          <span className="text-gray-600">→</span>
                          <div className="flex-1 text-gray-700">
                            {zone.displayText}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="justify-start text-paragraph text-sm font-medium">
                Explanation: {question.qExplanation}
              </p>

              <div className="w-full mt-4 pt-4 border-t border-gray-200">
                <p className="text-green-600 font-semibold">
                  ✓ Today's task completed! Come back tomorrow for a new
                  question.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayQuestion;
