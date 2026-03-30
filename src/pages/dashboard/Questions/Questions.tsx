"use client";

import { useEffect, useState } from "react";
import { FileItem } from "@/components/Questions/questions.data";
import { Button } from "@/components/ui/button";
import { QuestionsColumns } from "@/components/Questions/questions.columns";
import QuestionsTable from "@/components/Questions/QuestionsTable";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";

const Questions = () => {
   const navigate = useNavigate();  
   const [data, setData] = useState<FileItem[]>([]);
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
     const courseId = localStorage.getItem("selectedCourseId");
     if (!courseId) return;

     const fetchPracticeExams = async () => {
       setIsLoading(true);
       try {
         const response = await api.get(`/user/practice-exam/${courseId}`);
         const items = (response.data as { data?: any[] })?.data ?? [];

         const mapped: FileItem[] = (Array.isArray(items) ? items : [])
           .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
           .map((item: any) => ({
             id: item._id ?? item.id,
             categoryName: item.name ?? "Practice Exam",
             totalQuestions: `${item.questionCount ?? 0} Questions`,
             examTime: "Untimed",
             isPremium: item.isPremium ?? false,
           }));

         setData(mapped);
       } catch (error) {
         // eslint-disable-next-line no-console
         console.error("Failed to fetch practice exams", error);
       } finally {
         setIsLoading(false);
       }
     };

     void fetchPracticeExams();
   }, []);
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

      {isLoading ? (
        <div className="p-4 text-sm text-paragraph">Loading practice exams...</div>
      ) : (
        <QuestionsTable
          data={data}
          columns={QuestionsColumns()}
        />
      )}
    </div>
  );
};

export default Questions;
