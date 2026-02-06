export type ExamsItem = {
  id: string;
  examName: string;
  date: string;          // DD-MM-YYYY
  timeTaken: string;     // HH:MM:SS
  attemptNumber: number;
  score: string;         // "40% (20/60)"
  status: "Completed" | "Unfinished";
};
export const examsData: ExamsItem[] = [
  {
    id: "1",
    examName: "Project Management Exam",
    date: "01-01-2023",
    timeTaken: "02:24:00",
    attemptNumber: 0,
    score: "40% (20/60)",
    status: "Completed",
  },
  {
    id: "2",
    examName: "Project Management Quiz",
    date: "02-02-2023",
    timeTaken: "02:24:00",
    attemptNumber: 1,
    score: "40% (20/60)",
    status: "Completed",
  },
  {
    id: "3",
    examName: "Management Assessment",
    date: "03-03-2023",
    timeTaken: "02:24:00",
    attemptNumber: 2,
    score: "40% (20/60)",
    status: "Unfinished",
  },
  {
    id: "4",
    examName: "Exploring Literature Test",
    date: "04-04-2023",
    timeTaken: "02:24:00",
    attemptNumber: 1,
    score: "40% (20/60)",
    status: "Completed",
  },
  {
    id: "5",
    examName: "Global Challenges Quiz",
    date: "05-05-2023",
    timeTaken: "02:24:00",
    attemptNumber: 1,
    score: "40% (20/60)",
    status: "Completed",
  },
  {
    id: "6",
    examName: "Art of Project Management Test",
    date: "06-06-2023",
    timeTaken: "02:24:00",
    attemptNumber: 2,
    score: "40% (20/60)",
    status: "Unfinished",
  },
  {
    id: "7",
    examName: "Computer Skills for Project Managers",
    date: "07-07-2023",
    timeTaken: "02:24:00",
    attemptNumber: 0,
    score: "40% (20/60)",
    status: "Completed",
  },
  {
    id: "8",
    examName: "Skills in Project Management Assessment",
    date: "08-08-2023",
    timeTaken: "02:24:00",
    attemptNumber: 1,
    score: "40% (20/60)",
    status: "Completed",
  },
  {
    id: "9",
    examName: "Language Proficiency",
    date: "12-09-2024",
    timeTaken: "02:24:00",
    attemptNumber: 2,
    score: "40% (20/60)",
    status: "Unfinished",
  },
  {
    id: "10",
    examName: "Physical Education Strategies",
    date: "11-10-2024",
    timeTaken: "02:24:00",
    attemptNumber: 0,
    score: "40% (20/60)",
    status: "Completed",
  },
  {
    id: "11",
    examName: "Project Management Exam",
    date: "10-10-2024",
    timeTaken: "02:24:00",
    attemptNumber: 0,
    score: "40% (20/60)",
    status: "Completed",
  },
];
