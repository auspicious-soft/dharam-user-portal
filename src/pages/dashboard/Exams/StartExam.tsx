/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";

import { QuizQuestion } from "@/components/QuizComponents/quiz.types";
import { ClockIcon, PracticeIcon } from "@/utils/svgicons";
import { ExamsQuizRenderer } from "@/components/QuizComponents/ExamsComponents/ExamsQuizRenderer";
import { RightQuestionSidebar } from "../../../components/QuizComponents/ExamsComponents/RightQuestionSidebar";

const quiz: QuizQuestion[] = [
  // MCQ Question
  {
    id: "q1",
    type: "mcq",
    question:
      "Which action is most important during the initial program assessment?",
    options: [
      { id: "a", text: "Deciding the project budget" },
      { id: "b", text: "Identifying technical resources" },
      {
        id: "c",
        text: "Defining program objectives and requirements",
      },
      { id: "d", text: "Selecting team members" },
    ],
    correctAnswer: "c",
    qExplanation:
      "Defining objectives and requirements ensures alignment with organizational strategy.",
  },
  // Drag & Drop Question
  {
    id: "q2",
    type: "dragdrop",
    question:
      "Match each change control process step to its correct scope category:",
    draggableItems: [
      { id: "item1", text: "Change follow change control process" },
      { id: "item2", text: "Scope in predictive" },
      { id: "item3", text: "Requirements gathering" },
      { id: "item4", text: "Stakeholder approval" },
    ],
    dropZones: [
      {
        id: "zone1",
        label: "Step 1",
        correctItemId: "item1",
        displayText: "Scope in predictive.",
      },
      {
        id: "zone2",
        label: "Step 2",
        correctItemId: "item2",
        displayText: "Scope in predictive.",
      },
      {
        id: "zone3",
        label: "Step 3",
        correctItemId: "item3",
        displayText: "Scope in predictive.",
      },
      {
        id: "zone4",
        label: "Step 4",
        correctItemId: "item4",
        displayText: "Scope in predictive.",
      },
    ],
    qExplanation:
      "Each process step must be matched to ensure proper change control workflow.",
  },
  // Fill in the Blanks Question
  {
    id: "q3",
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
  // Another MCQ
  {
    id: "q4",
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
  // Another Fill in the Blanks
  {
    id: "q5",
    type: "fillblank",
    question: "Complete the project scope statement:",
    questionTemplate:
      "The __1__ defines the __2__ deliverables and the __3__ required to complete the project.",
    blanks: [
      { id: "1", correctAnswer: "Scope Statement" },
      { id: "2", correctAnswer: "Project" },
      { id: "3", correctAnswer: "Work" },
    ],
    options: [
      "Scope Statement",
      "Project",
      "Work",
      "Budget",
      "Timeline",
      "Resources",
      "Quality",
      "Risks",
    ],
    qExplanation:
      "The scope statement is a detailed description of the project and product scope.",
  },
];

// ─── Timer hook ───
function useTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
}

// ─── Main Component ───
const StartExam = () => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const timeDisplay = useTimer();
  const [results, setResults] = useState<Record<number, any>>({});
  const [marked, setMarked] = useState<Set<number>>(new Set());

  const totalQuestions = quiz.length;
  const progressPercent = (currentQuestion / totalQuestions) * 100;

  const handleQuestionChange = (index: number) => {
    setCurrentQuestion(index + 1);
  };

  const handleJump = (index: number) => {
    setCurrentQuestion(index + 1);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="grid gird-col-1 md:grid-cols-[1fr_286px] h-full">
        <div className="flex flex-col gap-7 px-4 py-[26px] md:px-[30px]">
          <div className="flex items-center gap-2 md:gap-4 justify-between flex-col md:flex-row">
            <div className="flex items-center gap-2 md:gap-4 self-stretch justify-start">
              <PracticeIcon />
              <h3 className="text-Black_light text-lg font-bold">
                Practice Question Set 2
              </h3>
            </div>

            <div className="flex items-center gap-2 md:gap-4 self-stretch justify-start">
              <ClockIcon />
              <div className="flex flex-col">
                <div className="text-center justify-start text-Black_light text-xl font-bold">
                  {timeDisplay}
                </div>
                <div className="text-sm text-Desc-464646">Time Left</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-full h-[7px] bg-[#EDEDED] rounded-full mt-[-10px]">
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: "#4C8DEA",
                  borderRadius: 999,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <div>
              <span className="text-primary_blue text-sm">
                Question {currentQuestion}
              </span>
              <span className="text-paragraph text-sm">
                {" "}
                of {totalQuestions}
              </span>
            </div>
          </div>

          <ExamsQuizRenderer
            quiz={quiz}
            onQuestionChange={handleQuestionChange}
            results={results}
            setResults={setResults}
            marked={marked}
            setMarked={setMarked}
          />

          <div className="inline-flex justify-center items-center md:mt-5">
            <div className="border-[1px] border-light-blue flex justify-start items-start gap-y-4 gap-x-4 md:gap-x-7 lg:gap-x-[60px] p-3 rounded-[10px] flex-wrap">
              <div className="inline-flex flex-col justify-start items-start gap-2.5">
                <div className="inline-flex justify-start items-center gap-2.5">
                  <div className="w-5 h-5 relative overflow-hidden">
                    <div className="w-3.5 h-3.5 left-[3.50px] top-[2.50px] absolute rounded-full border border-primary_blue" />
                  </div>
                  <div className="justify-start text-paragraph text-sm font-medium ">
                    Unseen Questions
                  </div> 
                </div>
              </div>
              <div className="inline-flex flex-col justify-start items-start gap-2.5">
                <div className="inline-flex justify-start items-center gap-2.5">
                  <div className="w-5 h-5 relative overflow-hidden">
                    <div className="w-3.5 h-3.5 left-[3.50px] top-[2.50px] absolute bg-primary_heading rounded-full" />
                  </div>
                  <div className="justify-start text-paragraph text-sm font-medium ">
                    Completed Questions
                  </div>
                </div>
              </div>
              <div className="inline-flex flex-col justify-start items-start gap-2.5">
                <div className="inline-flex justify-start items-center gap-2.5">
                  <div className="w-5 h-5 relative overflow-hidden">
                    <div className="w-3.5 h-3.5 left-[3.50px] top-[2.50px] absolute bg-paragraph rounded-full" />
                  </div>
                  <div className="justify-start text-paragraph text-sm font-medium ">
                    Not Attempted Questions
                  </div>
                </div>
              </div>
              <div className="inline-flex flex-col justify-start items-start gap-2.5">
                <div className="inline-flex justify-start items-center gap-2.5">
                  <div className="w-5 h-5 relative overflow-hidden">
                    <div className="w-3.5 h-3.5 left-[3.50px] top-[2.50px] absolute bg-[#ff0000] rounded-full" />
                  </div>
                  <div className="justify-start text-paragraph text-sm font-medium ">
                    Mark &amp; Next
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
         <RightQuestionSidebar
        total={totalQuestions}
        current={currentQuestion - 1} 
        results={results}
        marked={marked}
        onJump={handleJump}
      />
      </div>
    </div>
  );
};

export default StartExam;
