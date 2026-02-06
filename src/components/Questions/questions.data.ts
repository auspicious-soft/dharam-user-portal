export type FileItem = {
  id: string;
  categoryName: string;
  totalQuestions: string;
  examTime: string;
  isPremium?: boolean;
};

export const filesData: FileItem[] = [ 
  {
    id: "1",
    categoryName: "Project Management Exam",
    totalQuestions: "270 Questions",
    examTime: "Untimed",
    isPremium: true,
  },
  {
    id: "2",
    categoryName: "Project Management Quiz",
   totalQuestions: "570 Questions",
   examTime: "Untimed",
  },
  {
    id: "3",
    categoryName: "Management Assessment",
   totalQuestions: "70 Questions",
   examTime: "Untimed",
    isPremium: true,
  },
  {
    id: "4",
    categoryName: "Exploring Literature Test",
     totalQuestions: "170 Questions",
     examTime: "Untimed",
  },
];