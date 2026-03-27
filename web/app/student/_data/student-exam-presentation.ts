import { formatStudentExamDate, type StudentExamIconKey } from "./completed-exams";

function normalizeSubject(subject: string) {
  return subject.trim().toLowerCase();
}

export function getStudentExamPresentation(subject: string): {
  subjectLabel: string;
  iconKey: StudentExamIconKey;
  bg: string;
  iconBg: string;
} {
  const normalizedSubject = normalizeSubject(subject);

  if (normalizedSubject === "math") {
    return {
      subjectLabel: "Математик",
      iconKey: "radical",
      bg: "bg-[#DFF0F8]",
      iconBg: "bg-[#C8E4F4]",
    };
  }

  if (normalizedSubject === "chemistry") {
    return {
      subjectLabel: "Хими",
      iconKey: "flaskConical",
      bg: "bg-[#F0E4F8]",
      iconBg: "bg-[#E0CEFE]",
    };
  }

  if (normalizedSubject === "english") {
    return {
      subjectLabel: "Англи",
      iconKey: "bookA",
      bg: "bg-[#F2F6D8]",
      iconBg: "bg-[#E4EEB8]",
    };
  }

  if (normalizedSubject === "physics") {
    return {
      subjectLabel: "Физик",
      iconKey: "radical",
      bg: "bg-[#E8F1FF]",
      iconBg: "bg-[#D5E5FF]",
    };
  }

  if (normalizedSubject === "civics") {
    return {
      subjectLabel: "Иргэний боловсрол",
      iconKey: "bookA",
      bg: "bg-[#F7EBDA]",
      iconBg: "bg-[#F1D8B2]",
    };
  }

  return {
    subjectLabel: "Нийгэм",
    iconKey: "notebookText",
    bg: "bg-[#E8E4F8]",
    iconBg: "bg-[#D4CEFE]",
  };
}

export function getStudentExamHeader(subject: string, title: string) {
  const { subjectLabel } = getStudentExamPresentation(subject);

  return `${subjectLabel} - ${title}`;
}

export function formatStudentExamTimestamp(timestamp: number) {
  return formatStudentExamDate(new Date(timestamp));
}
