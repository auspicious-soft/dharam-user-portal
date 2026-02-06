import { Button } from "@/components/ui/button";
import { ExamColumns } from "@/components/exams/examsPage.columns";
import ExamsPageTable from "@/components/exams/ExamsPageTable";
import { useNavigate } from "react-router-dom";
import { filesData } from "@/components/exams/examsPage.data";

const Exams = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <h2 className="text-Black_light text-lg md:text-2xl font-bold">
          Mock Exams
        </h2>
        <Button
          onClick={() => navigate("/exams/view-reports")}
          variant="secondary"
          className="h-[44px]"
        >
          View Reports
        </Button>
      </div>

      <ExamsPageTable data={filesData} columns={ExamColumns()} />
    </div>
  );
};

export default Exams;
