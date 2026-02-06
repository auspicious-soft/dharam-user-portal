export interface BaseQuestion {
  id: string;
  question: string;
  qExplanation: string;
}

export interface MCQQuestion extends BaseQuestion {
  type: "mcq";
  options: { id: string; text: string }[];
  correctAnswer: string;
}

export interface DragDropQuestion extends BaseQuestion {
  type: "dragdrop";
  draggableItems: { id: string; text: string }[];
  dropZones: {
    id: string;
    label: string;
    correctItemId: string;
    displayText: string;
  }[];
}

export interface FillBlankQuestion extends BaseQuestion {
  type: "fillblank";
  questionTemplate: string;
  blanks: {
    id: string;
    correctAnswer: string;
  }[];
  options: string[];
}

export type QuizQuestion = MCQQuestion | DragDropQuestion | FillBlankQuestion;
