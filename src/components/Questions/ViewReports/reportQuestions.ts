export type ReportQuestionItem = {
  _id: string;
  examId?: string;
  isCorrect?: boolean | null;
  isAttempted?: boolean;
  questionId?: {
    _id: string;
    question?: string;
    type?: string;
    explaination?: string;
    maxSelection?: number;
    mcq?: Array<{
      _id?: string;
      text?: string;
      isCorrect?: boolean;
    }>;
    fib?: Array<{
      _id?: string;
      answer?: string;
      correctOrder?: number;
    }>;
    dnd?: {
      pairs?: Array<{
        leftId?: string;
        leftText?: string;
        rightId?: string;
      }>;
      options?: Array<{
        id?: string;
        text?: string;
      }>;
    };
  };
};

export const normalizeReportQuestions = (
  raw: unknown,
): ReportQuestionItem[] => {
  if (!Array.isArray(raw)) return [];

  return raw.map((item, index) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const question = (row.questionId ?? {}) as Record<string, unknown>;
    const dnd = (question.dnd ?? {}) as Record<string, unknown>;

    return {
      _id: String(row._id ?? index),
      examId: row.examId ? String(row.examId) : undefined,
      isCorrect:
        row.isCorrect === null
          ? null
          : typeof row.isCorrect === "boolean"
            ? row.isCorrect
            : undefined,
      isAttempted:
        typeof row.isAttempted === "boolean" ? row.isAttempted : undefined,
      questionId: {
        _id: String(question._id ?? ""),
        question: question.question ? String(question.question) : "",
        type: question.type ? String(question.type) : "",
        explaination: question.explaination
          ? String(question.explaination)
          : "",
        maxSelection:
          typeof question.maxSelection === "number"
            ? question.maxSelection
            : undefined,
        mcq: Array.isArray(question.mcq)
          ? question.mcq.map((option, optionIndex) => {
              const mcqOption = (option ?? {}) as Record<string, unknown>;
              return {
                _id: mcqOption._id
                  ? String(mcqOption._id)
                  : `${index}-${optionIndex}`,
                text: mcqOption.text ? String(mcqOption.text) : "",
                isCorrect:
                  typeof mcqOption.isCorrect === "boolean"
                    ? mcqOption.isCorrect
                    : false,
              };
            })
          : [],
        fib: Array.isArray(question.fib)
          ? question.fib.map((blank, blankIndex) => {
              const fibItem = (blank ?? {}) as Record<string, unknown>;
              return {
                _id: fibItem._id
                  ? String(fibItem._id)
                  : `${index}-fib-${blankIndex}`,
                answer: fibItem.answer ? String(fibItem.answer) : "",
                correctOrder:
                  typeof fibItem.correctOrder === "number"
                    ? fibItem.correctOrder
                    : undefined,
              };
            })
          : [],
        dnd: {
          pairs: Array.isArray(dnd.pairs)
            ? dnd.pairs.map((pair, pairIndex) => {
                const dndPair = (pair ?? {}) as Record<string, unknown>;
                return {
                  leftId: dndPair.leftId
                    ? String(dndPair.leftId)
                    : `${pairIndex}`,
                  leftText: dndPair.leftText ? String(dndPair.leftText) : "",
                  rightId: dndPair.rightId ? String(dndPair.rightId) : "",
                };
              })
            : [],
          options: Array.isArray(dnd.options)
            ? dnd.options.map((option, optionIndex) => {
                const dndOption = (option ?? {}) as Record<string, unknown>;
                return {
                  id: dndOption.id ? String(dndOption.id) : `${optionIndex}`,
                  text: dndOption.text ? String(dndOption.text) : "",
                };
              })
            : [],
        },
      },
    };
  });
};
