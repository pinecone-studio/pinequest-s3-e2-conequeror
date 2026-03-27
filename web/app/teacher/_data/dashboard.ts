export type SubjectKey =
  | "all"
  | "social"
  | "civics"
  | "math"
  | "english"
  | "chemistry"
  | "physics";

export type ExamCard = {
  id: string;
  title: string;
  topic: string;
  grade: string;
  date: string;
  startTime: string;
  duration: number;
  taskCount: number;
  subject: Exclude<SubjectKey, "all">;
  classroomName?: string | null;
};

export type StudentResult = {
  id: string;
  studentId: string;
  name: string;
  section: string;
  score: string;
  submittedAt: number;
  durationMinutes: number;
  percent: number;
};

export type SubjectCardPalette = {
  cardBackground: string;
  borderColor: string;
  iconBackground: string;
};

export const subjectTabs: { key: SubjectKey; label: string }[] = [
  { key: "all", label: "Бүгд" },
  { key: "social", label: "Нийгэм" },
  { key: "civics", label: "Иргэний боловсрол" },
  { key: "math", label: "Математик" },
  { key: "english", label: "Англи хэл" },
  { key: "chemistry", label: "Хими" },
  { key: "physics", label: "Физик" },
];

const subjectCardPaletteSequence: Record<
  Exclude<SubjectKey, "all">,
  SubjectCardPalette
> = {
  social: {
    cardBackground: "#DCD9FFB3",
    borderColor: "#C8C2FFB3",
    iconBackground: "#CDC7FFB3",
  },
  civics: {
    cardBackground: "#D4EBFFB3",
    borderColor: "#B9DEFFB3",
    iconBackground: "#BFE0FFB3",
  },
  math: {
    cardBackground: "#F8DBFDB3",
    borderColor: "#F1C2FBB3",
    iconBackground: "#F2C8FAB3",
  },
  english: {
    cardBackground: "#E7F699B3",
    borderColor: "#D4E66AB3",
    iconBackground: "#DCEE78B3",
  },
  chemistry: {
    cardBackground: "#FFE5D6",
    borderColor: "#FFD2B9",
    iconBackground: "#FFD9C7",
  },
  physics: {
    cardBackground: "#E0F1F6",
    borderColor: "#C6E5EE",
    iconBackground: "#CFEAF2",
  },
};

export function getSubjectCardPalette(subject: string): SubjectCardPalette {
  return (
    subjectCardPaletteSequence[
      (subject as Exclude<SubjectKey, "all">) || "social"
    ] ?? subjectCardPaletteSequence.social
  );
}

export function getSubjectDisplayLabel(subject: string) {
  if (subject === "civics") {
    return "Иргэний боловсрол";
  }

  if (subject === "math") {
    return "Математик";
  }

  if (subject === "english") {
    return "Англи хэл";
  }

  if (subject === "chemistry") {
    return "Хими";
  }

  if (subject === "physics") {
    return "Физик";
  }

  return "Нийгэм";
}
