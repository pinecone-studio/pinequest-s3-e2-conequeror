export type StudentExamIconKey =
  | "notebookText"
  | "radical"
  | "flaskConical"
  | "bookA";

export type CompletedExamRecord = {
  id: string;
  iconKey: StudentExamIconKey;
  subject: string;
  topic: string;
  grade: string;
  minutes: number;
  exercises: number;
  date: string;
  bg: string;
  iconBg: string;
};

export const completedExamStorageKey = "pinequest-student-completed-exams";

export const defaultCompletedExams: CompletedExamRecord[] = [
  {
    id: "social-studies",
    iconKey: "notebookText",
    subject: "Нийгэм Ухаан",
    topic: "Соёл",
    grade: "10-р анги",
    minutes: 60,
    exercises: 30,
    date: "03/25, 2026",
    bg: "bg-[#E8E4F8]",
    iconBg: "bg-[#D4CEFE]",
  },
];

export function formatStudentExamDate(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}, ${year}`;
}

export function mergeCompletedExams(records: CompletedExamRecord[]) {
  const seen = new Set<string>();

  return records.filter((record) => {
    if (seen.has(record.id)) {
      return false;
    }

    seen.add(record.id);
    return true;
  });
}
