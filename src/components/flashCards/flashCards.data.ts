// Updated flashCards.data.ts
import ItemImage from "@/assets/login-banner.jpg";

export const flashCardsData = [
  {
    id: "1",
    image: ItemImage,
    question: {
      id: "flash-q1",
      type: "mcq" as const,
      question:
        "Which Agile role is responsible for maximizing the value delivered by the team?",
      options: [
        { id: "a", text: "Scrum Master" },
        { id: "b", text: "Product Owner" },
        { id: "c", text: "Development Team" },
        { id: "d", text: "Stakeholder" },
      ],
      correctAnswer: "b",
      qExplanation:
        "The Product Owner is responsible for maximizing the value of the product and the work of the Development Team.",
    },
  },
  {
    id: "2",
    image: null,
    question: {
      id: "flash-q2",
      type: "mcq" as const,
      question:
        "What ceremony is used to inspect and adapt the product increment?",
      options: [
        { id: "a", text: "Daily Standup" },
        { id: "b", text: "Sprint Planning" },
        { id: "c", text: "Sprint Review" },
        { id: "d", text: "Sprint Retrospective" },
      ],
      correctAnswer: "c",
      qExplanation:
        "The Sprint Review is held at the end of the Sprint to inspect the increment and adapt the Product Backlog if needed.",
    },
  },
];