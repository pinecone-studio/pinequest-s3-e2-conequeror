import type {
  ActiveExamItem,
  ExamDetail,
  PreviousResultItem,
} from "@/types/student-exam";

export const activeExams: ActiveExamItem[] = [
  {
    id: "math-test-3",
    title: "Математик - Тест 3",
    duration: 45,
    questionCount: 20,
  },
  {
    id: "english-vocab",
    title: "Англи хэл - Үгийн сан",
    duration: 30,
    questionCount: 30,
  },
];

export const previousResults: PreviousResultItem[] = [
  {
    id: "physics-kinematics",
    title: "Физик - Кинематик",
    date: "2024-03-15",
    score: 82,
  },
  {
    id: "math-test-2",
    title: "Математик - Тест 2",
    date: "2024-03-10",
    score: 91,
  },
];

export const examDetails: Record<string, ExamDetail> = {
  "math-test-3": {
    id: "math-test-3",
    title: "Математик - Тест 3",
    grade: "10-р анги",
    duration: 45,
    questionCount: 5,
    questions: [
      {
        id: "q1",
        order: 1,
        question: "2x + 5 = 15 тэгшитгэлийн шийд аль вэ?",
        options: [
          { id: "a", label: "A", value: "x = 3" },
          { id: "b", label: "B", value: "x = 5" },
          { id: "c", label: "C", value: "x = 10" },
          { id: "d", label: "D", value: "x = 7" },
        ],
      },
      {
        id: "q2",
        order: 2,
        question: "5 + 7 = ?",
        options: [
          { id: "a", label: "A", value: "10" },
          { id: "b", label: "B", value: "11" },
          { id: "c", label: "C", value: "12" },
          { id: "d", label: "D", value: "13" },
        ],
      },
      {
        id: "q3",
        order: 3,
        question: "9 × 3 = ?",
        options: [
          { id: "a", label: "A", value: "27" },
          { id: "b", label: "B", value: "24" },
          { id: "c", label: "C", value: "21" },
          { id: "d", label: "D", value: "18" },
        ],
      },
      {
        id: "q4",
        order: 4,
        question: "√81 = ?",
        options: [
          { id: "a", label: "A", value: "7" },
          { id: "b", label: "B", value: "8" },
          { id: "c", label: "C", value: "9" },
          { id: "d", label: "D", value: "10" },
        ],
      },
      {
        id: "q5",
        order: 5,
        question: "12 / 4 = ?",
        options: [
          { id: "a", label: "A", value: "2" },
          { id: "b", label: "B", value: "3" },
          { id: "c", label: "C", value: "4" },
          { id: "d", label: "D", value: "6" },
        ],
      },
    ],
  },
};

export const studentExamSummaries = activeExams;
export const previousExamResults = previousResults;
export const studentDashboardStats = {
  activeCount: activeExams.length,
  completedCount: previousResults.length,
  averageScore: Math.round(
    previousResults.reduce((sum, result) => sum + result.score, 0) /
      previousResults.length,
  ),
};

export function getStudentExamDetail(examId: string) {
  return examDetails[examId];
}

export function getStudentExamSummary(examId: string) {
  return activeExams.find((exam) => exam.id === examId);
}
