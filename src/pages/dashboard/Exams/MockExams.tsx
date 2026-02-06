import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import RedDot from "@/assets/red-dot.png";
import BlueDot from "@/assets/blue-dot.png";
import GreenDot from "@/assets/green-dot.png";
import { ArrowRight } from "lucide-react";

const MockExams = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
                This exam includes X questions, to be completed within Y
                minutes.
              </li>
              <li>
                You can pause and resume the test anytime — your time and
                progress will be saved.
              </li>
              <li>
                Questions are randomized and may include single or multiple
                correct answers.
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
                <img src={GreenDot} alt="Green Dot" className="max-w-3" />{" "}
                Completed
              </p>
              <p className="text-paragraph text-sm flex flex-wrap items-center gap-1">
                <img src={BlueDot} alt="Bule Dot" className="max-w-3" /> Not
                Attempted
              </p>
              <p className="text-paragraph text-sm flex flex-wrap items-center gap-1">
                <img src={RedDot} alt="Red Dot" className="max-w-3" /> Marked
                for Review{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center w-full mt-3">
        <Button
          onClick={() => navigate(`/exams/start/${id}`)}
          className="max-w-96 w-full rounded-[10px]"
        >
          Start Exam <ArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default MockExams;
