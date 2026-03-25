export interface ActiveExamItem {
  id: string;
  title: string;
  duration: number;
  questionCount: number;
}

export interface PreviousResultItem {
  id: string;
  title: string;
  date: string;
  score: number;
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface QuestionItem {
  id: string;
  order: number;
  question: string;
  options: QuestionOption[];
}

export interface ExamDetail {
  id: string;
  title: string;
  grade: string;
  duration: number;
  questionCount: number;
  questions: QuestionItem[];
}
