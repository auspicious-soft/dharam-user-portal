import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { StepRenderer } from "@/components/DomainsTasks/DomainTaskViewer/StepRenderer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "iconoir-react";

/* ------------------------------------
 MOCK DATA (Admin Panel Simulation)
------------------------------------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DOMAIN_TASKS: Record<string, any> = {
  "d1-1": {
    id: "d1-1",
    title: "Strategic Program Management 1",
    steps: [
      {
        type: "task",
        content: `
          <h3>Task</h3>
          <p>
           Perform an initial program assessment by defining the program objectives, requirements, and risks to ensure program alignment with the organization's strategic plan, objectives, priorities, vision and mission statement.
          </p>
        `,
      },
      {
        type: "image",
        content: "/flow-diagram.png",
      },
      {
        type: "examples",
        content: `
          <h3>Examples</h3>
          <p>
           Review organizational strategic documents and interview key stakeholders to understand program objectives and constraints.
          </p>
        `,
      },
      {
        type: "keywords",
        content: `
          <h3>Keywords</h3>
          <p>
           Strategic Alignment, Program Assessment, Stakeholder Analysis, Risk Identification
          </p>
        `,
      },
      {
        type: "quiz",
        quiz: [
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
        ],
      },
    ],
  },
};

/* ------------------------------------
 MAIN COMPONENT
------------------------------------- */

const DomainTaskViewer = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const task = DOMAIN_TASKS[taskId ?? ""];

  const [currentStep, setCurrentStep] = useState(0);

  if (!task) {
    return (
      <div className="p-6 text-center text-gray-500">
        No Task Yet
      </div>
    );
  }

  const step = task.steps[currentStep];
  const totalSteps = task.steps.length;

  return (
    <div className="space-y-10">
      <div  className="flex flex-col gap-2.5">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-5">
          <Button
          variant="outline"
          size="icon"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full border hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="justify-start text-Black_light text-xl font-bold">{task.title}</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((s) => s - 1)}
            className="max-h-[42px] rounded-xl !px-4 disabled:opacity-50"
          > 
          <ArrowLeft />
            Back
          </Button>

          <Button
            disabled={currentStep === totalSteps - 1}
            onClick={() => setCurrentStep((s) => s + 1)}
            className="max-h-[42px] rounded-xl !px-4 disabled:opacity-50"
          >
            Next
            <ArrowRight />
          </Button>
        </div>
      </div>

      {/* STEP INDICATOR */}
      <div className="flex gap-2 mt-3 lg:mt-0">
        {task.steps.map((_: unknown, index: number) => (
          <span
            key={index}
            className={`h-2 w-6 rounded-full transition-all ${
            index <= currentStep
                ? "bg-primary_blue"
                : "bg-[#ececec]"
            }`}
          />
        ))}
      </div>
      </div>

      {/* CONTENT */}
      <div className=""> 
        <StepRenderer step={step} />
      </div>
    </div>
  );
};

export default DomainTaskViewer;