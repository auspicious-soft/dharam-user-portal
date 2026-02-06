"use client";

import { filesData } from "@/components/Questions/questions.data";
import { Button } from "@/components/ui/button";
import { QuestionsColumns } from "@/components/Questions/questions.columns";
import QuestionsTable from "@/components/Questions/QuestionsTable";
import { useNavigate } from "react-router-dom";

const Questions = () => {
   const navigate = useNavigate();  
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <h2 className="text-Black_light text-lg md:text-2xl font-bold nd:leading-[46px]">Practice Questions</h2>
        <Button
         onClick={() => navigate("/practice-questions/view-reports")}
          variant="secondary"
          className="h-[44px] flex items-center gap-1 md:gap-2 "
        >
         View Reports
        </Button>
      </div>

      <QuestionsTable
        data={filesData}
        columns={QuestionsColumns()}
      />
    </div>
  );
};

export default Questions;