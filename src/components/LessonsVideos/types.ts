import { QuizQuestion } from "@/components/QuizComponents/quiz.types";

/** Individual lesson / content item */
export interface ModuleItem {
  id: string;
  title: string;
  duration: string;
  type: "video" | "slide" | "quiz";
  moduleId: string;

  videoUrl?: string;
  pdfUrl?: string;
  quiz?: QuizQuestion[];
}

/** Module */
export interface Module {
  id: string;
  title: string;
  description: string;
  videos: number;
  slides: number;
  questions: number;
  isPremium: boolean;
  items: ModuleItem[];
}

/** Selected content shown in ContentViewer */
export type SelectedContent =
  | {
      type: "module";
      title: string;
      description: string;
    }
  | ({
      type: "video" | "slide" | "quiz";
    } & ModuleItem);
