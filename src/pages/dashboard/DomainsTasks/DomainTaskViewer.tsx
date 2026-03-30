import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { StepRenderer } from "@/components/DomainsTasks/DomainTaskViewer/StepRenderer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "iconoir-react";
import api from "@/lib/axios";
import { getPublicUrlForKey } from "@/utils/s3Upload";
import { Step } from "@/components/DomainsTasks/DomainTaskViewer/domainQuiz.types";

const DomainTaskViewer = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [task, setTask] = useState<{
    id: string;
    title: string;
    taskDetails?: string;
    flowDiagram?: string;
    examples?: string;
    keywords?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const courseId = localStorage.getItem("selectedCourseId");
    if (!courseId || !taskId) return;

    const fetchTask = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/user/domain-tasks/${courseId}`);
        const data = (response.data as { data?: any[] })?.data ?? [];

        let foundTask: any | null = null;
        let foundDomainTitle = "";

        (Array.isArray(data) ? data : []).some((domain: any) => {
          const tasks = Array.isArray(domain.tasks) ? domain.tasks : [];
          const match = tasks.find((t: any) => t._id === taskId);
          if (match) {
            foundTask = match;
            foundDomainTitle = domain.domain ?? domain.title ?? "Task";
            return true;
          }
          return false;
        });

        if (!foundTask) {
          setTask(null);
          return;
        }

        setTask({
          id: foundTask._id,
          title: foundTask.taskName ?? foundTask.taskLabel ?? foundDomainTitle,
          taskDetails: foundTask.taskDetails ?? "",
          flowDiagram: foundTask.flowDiagram ?? "",
          examples: foundTask.examples ?? "",
          keywords: foundTask.keywords ?? "",
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch domain task", error);
        setTask(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTask();
  }, [taskId]);

  useEffect(() => {
    setCurrentStep(0);
  }, [taskId]);

  const steps = useMemo<Step[]>(() => {
    if (!task) return [];
    const resolvedDiagram =
      task.flowDiagram && /^https?:\/\//i.test(task.flowDiagram)
        ? task.flowDiagram
        : task.flowDiagram
        ? getPublicUrlForKey(task.flowDiagram)
        : "";

    return [
      { type: "task", content: task.taskDetails },
      ...(resolvedDiagram ? [{ type: "image", content: resolvedDiagram }] : []),
      { type: "examples", content: task.examples },
      { type: "keywords", content: task.keywords },
      { type: "questions", content: task.id },
    ].filter((step) => step.content);
  }, [task]);

  const step = steps[currentStep];
  const totalSteps = steps.length;

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Loading task...</div>;
  }

  if (!task) {
    return <div className="p-6 text-center text-gray-500">No Task Yet</div>;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2.5">
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
            <h1 className="justify-start text-Black_light text-xl font-bold">
              {task.title}
            </h1>
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
              disabled={totalSteps === 0 || currentStep === totalSteps - 1}
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
          {steps.map((_: unknown, index: number) => (
            <span
              key={index}
              className={`h-2 w-6 rounded-full transition-all ${
                index <= currentStep ? "bg-primary_blue" : "bg-[#ececec]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="">{step ? <StepRenderer step={step} /> : null}</div>
    </div>
  );
};

export default DomainTaskViewer;
