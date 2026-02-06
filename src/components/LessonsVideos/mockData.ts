// mockData.ts
import { Module } from "./types";

export const modules: Module[] = [
  {
    id: "m1",
    title: "Module 1: Introduction",
    description:
      "PMP® Online Mentoring Programs - Accelerate exam success and job-ready skills with live mentor-led sessions, hands-on practice, and exam-focused guidance.",
    videos: 8,
    slides: 170,
    questions: 5,
    isPremium: false,
    items: [
      {
        id: "1",
        title: "Dummy Name of the video",
        duration: "00:24:00",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        moduleId: "m1",
      },
      {
        id: "2",
        title: "Dummy Name of the slide",
        duration: "00:24:00",
        type: "slide",
        pdfUrl: "https://www.aeee.in/wp-content/uploads/2020/08/Sample-pdf.pdf",
        moduleId: "m1",
      },
      {
        id: "3",
        title: "Dummy Name of the video",
        duration: "00:24:00",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        moduleId: "m1",
      },
      {
        id: "4",
        title: "Name of the questionnaire",
        duration: "5 Questions",
        type: "quiz",
        moduleId: "m1",
        quiz: [
          // MCQ Question
          {
            id: "q1",
            type: "mcq",
            question:
              "Which action is most important during the initial program assessment?",
            options: [
              { id: "a", text: "Deciding the project budget" },
              { id: "b", text: "Identifying technical resources" },
              {
                id: "c",
                text: "Defining program objectives and requirements",
              },
              { id: "d", text: "Selecting team members" },
            ],
            correctAnswer: "c",
            qExplanation:
              "Defining objectives and requirements ensures alignment with organizational strategy.",
          },
          // Drag & Drop Question
          {
            id: "q2",
            type: "dragdrop",
            question:
              "Match each change control process step to its correct scope category:",
            draggableItems: [
              { id: "item1", text: "Change follow change control process" },
              { id: "item2", text: "Scope in predictive" },
              { id: "item3", text: "Requirements gathering" },
              { id: "item4", text: "Stakeholder approval" },
            ],
            dropZones: [
              {
                id: "zone1",
                label: "Step 1",
                correctItemId: "item1",
                displayText: "Scope in predictive.",
              },
              {
                id: "zone2",
                label: "Step 2",
                correctItemId: "item2",
                displayText: "Scope in predictive.",
              },
              {
                id: "zone3",
                label: "Step 3",
                correctItemId: "item3",
                displayText: "Scope in predictive.",
              },
              {
                id: "zone4",
                label: "Step 4",
                correctItemId: "item4",
                displayText: "Scope in predictive.",
              },
            ],
            qExplanation:
              "Each process step must be matched to ensure proper change control workflow.",
          },
          // Fill in the Blanks Question
          {
            id: "q3",
            type: "fillblank",
            question:
              "Complete the following statement about project management:",
            questionTemplate:
              "The __1__ creates the __2__ which authorizes the __3__ and gives the __4__ authority to use __5__ resources.",
            blanks: [
              { id: "1", correctAnswer: "Sponsor" },
              { id: "2", correctAnswer: "Project Charter" },
              { id: "3", correctAnswer: "Project" },
              { id: "4", correctAnswer: "Project Manager" },
              { id: "5", correctAnswer: "Organizational" },
            ],
            options: [
              "Sponsor",
              "Project Charter",
              "Project",
              "Project Manager",
              "Organizational",
              "Stakeholder",
              "Budget",
              "Team Members",
              "Schedule",
              "Requirements",
            ],
            qExplanation:
              "The sponsor creates the project charter to formally authorize the project and give the project manager authority.",
          },
          // Another MCQ
          {
            id: "q4",
            type: "mcq",
            question: "What is the primary purpose of a project charter?",
            options: [
              { id: "a", text: "Define project budget" },
              { id: "b", text: "Formally authorize the project" },
              { id: "c", text: "Assign team members" },
              { id: "d", text: "Create project schedule" },
            ],
            correctAnswer: "b",
            qExplanation:
              "The project charter formally authorizes the project and gives the project manager authority.",
          },
          // Another Fill in the Blanks
          {
            id: "q5",
            type: "fillblank",
            question: "Complete the project scope statement:",
            questionTemplate:
              "The __1__ defines the __2__ deliverables and the __3__ required to complete the project.",
            blanks: [
              { id: "1", correctAnswer: "Scope Statement" },
              { id: "2", correctAnswer: "Project" },
              { id: "3", correctAnswer: "Work" },
            ],
            options: [
              "Scope Statement",
              "Project",
              "Work",
              "Budget",
              "Timeline",
              "Resources",
              "Quality",
              "Risks",
            ],
            qExplanation:
              "The scope statement is a detailed description of the project and product scope.",
          },
        ],
      },
    ],
  },
  {
    id: "m2",
    title: "Module 2: Introduction",
    description:
      "Advanced concepts and practical applications for project management professionals.",
    videos: 8,
    slides: 170,
    questions: 5,
    isPremium: true,
    items: [
      {
        id: "5",
        title: "Advanced Video Lesson",
        duration: "00:30:00",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        moduleId: "m2",
      },
      {
        id: "6",
        title: "Advanced Slides",
        duration: "00:18:00",
        type: "slide",
        pdfUrl: "/dummy-pdf_2.pdf",
        moduleId: "m2",
      },
    ],
  },
  {
    id: "m3",
    title: "Module 3: Introduction",
    description: "Specialized techniques for complex project scenarios.",
    videos: 8,
    slides: 170,
    questions: 5,
    isPremium: true,
    items: [
      {
        id: "7",
        title: "Complex Project Management",
        duration: "00:35:00",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        moduleId: "m3",
      },
    ],
  },
  {
    id: "m4",
    title: "Module 4: Introduction",
    description: "Leadership and team management strategies.",
    videos: 8,
    slides: 170,
    questions: 5,
    isPremium: true,
    items: [
      {
        id: "8",
        title: "Leadership Strategies",
        duration: "00:28:00",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        moduleId: "m4",
      },
    ],
  },
  {
    id: "m5",
    title: "Module 5: Introduction",
    description: "Final preparation and certification readiness.",
    videos: 8,
    slides: 170,
    questions: 5,
    isPremium: true,
    items: [
      {
        id: "9",
        title: "Certification Prep",
        duration: "00:40:00",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        moduleId: "m5",
      },
    ],
  },
];
