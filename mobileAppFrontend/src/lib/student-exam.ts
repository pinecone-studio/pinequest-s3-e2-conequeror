import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const orderedSubjectPalette = [
  {
    background: "#E8E4F8",
    iconBackground: "#D4CEFE",
    borderColor: "#CFC6FF",
    accentColor: "#C7BEFF",
    noticeBackground: "#F3F0FF",
    noticeBorder: "#D8D1FA",
    actionButtonBackground: "#9E81F0",
    actionButtonInset: "rgba(103, 79, 184, 0.38)",
    actionButtonShadow: "rgba(158, 129, 240, 0.22)",
  },
  {
    background: "#DFF0F8",
    iconBackground: "#C8E4F4",
    borderColor: "#B9DDEE",
    accentColor: "#AFCFE6",
    noticeBackground: "#EEF6FB",
    noticeBorder: "#C7E0EE",
    actionButtonBackground: "#6C95EA",
    actionButtonInset: "rgba(66, 105, 185, 0.38)",
    actionButtonShadow: "rgba(108, 149, 234, 0.24)",
  },
  {
    background: "#F8E2EF",
    iconBackground: "#F1CBE2",
    borderColor: "#E8BCD8",
    accentColor: "#E3B6D2",
    noticeBackground: "#FCEFFA",
    noticeBorder: "#EFC9E3",
    actionButtonBackground: "#D98AEF",
    actionButtonInset: "rgba(170, 93, 191, 0.38)",
    actionButtonShadow: "rgba(217, 138, 239, 0.24)",
  },
  {
    background: "#E3F5E8",
    iconBackground: "#C9EBD3",
    borderColor: "#BEE1C8",
    accentColor: "#AFD7BB",
    noticeBackground: "#EFF9F2",
    noticeBorder: "#CDE6D5",
    actionButtonBackground: "#69B88A",
    actionButtonInset: "rgba(74, 132, 97, 0.34)",
    actionButtonShadow: "rgba(105, 184, 138, 0.22)",
  },
] as const;

function normalizeSubject(subject: string) {
  return subject.trim().toLowerCase();
}

export function buildStudentExamSubjectOrder(
  items: ReadonlyArray<{ subject: string }>,
) {
  const seen = new Set<string>();
  const orderedSubjects: string[] = [];

  for (const item of items) {
    const normalized = normalizeSubject(item.subject);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    orderedSubjects.push(normalized);
  }

  return orderedSubjects;
}

export function getStudentExamPresentation(
  subject: string,
  orderedSubjects?: ReadonlyArray<string>,
): {
  subjectLabel: string;
  iconName: IconName;
  background: string;
  iconBackground: string;
  borderColor: string;
  accentColor: string;
  noticeBackground: string;
  noticeBorder: string;
  actionButtonBackground: string;
  actionButtonInset: string;
  actionButtonShadow: string;
};

export function getStudentExamPresentation(
  subject: string,
  orderedSubjects?: ReadonlyArray<string>,
): {
  subjectLabel: string;
  iconName: IconName;
  background: string;
  iconBackground: string;
  borderColor: string;
  accentColor: string;
  noticeBackground: string;
  noticeBorder: string;
  actionButtonBackground: string;
  actionButtonInset: string;
  actionButtonShadow: string;
} {
  const normalized = normalizeSubject(subject);

  const orderedIndex = orderedSubjects?.indexOf(normalized) ?? -1;
  const orderedPalette =
    orderedIndex >= 0
      ? orderedSubjectPalette[orderedIndex % orderedSubjectPalette.length]
      : null;

  if (normalized === "math") {
    return {
      subjectLabel: "Математик",
      iconName: "calculator-variant-outline",
      background: orderedPalette?.background ?? "#DFF0F8",
      iconBackground: orderedPalette?.iconBackground ?? "#C8E4F4",
      borderColor: orderedPalette?.borderColor ?? "#B9DDEE",
      accentColor: orderedPalette?.accentColor ?? "#AFCFE6",
      noticeBackground: orderedPalette?.noticeBackground ?? "#EEF6FB",
      noticeBorder: orderedPalette?.noticeBorder ?? "#C7E0EE",
      actionButtonBackground: orderedPalette?.actionButtonBackground ?? "#6C95EA",
      actionButtonInset: orderedPalette?.actionButtonInset ?? "rgba(66, 105, 185, 0.38)",
      actionButtonShadow: orderedPalette?.actionButtonShadow ?? "rgba(108, 149, 234, 0.24)",
    };
  }

  if (normalized === "chemistry") {
    return {
      subjectLabel: "Хими",
      iconName: "flask-outline",
      background: orderedPalette?.background ?? "#F0E4F8",
      iconBackground: orderedPalette?.iconBackground ?? "#E0CEFE",
      borderColor: orderedPalette?.borderColor ?? "#D9C8F6",
      accentColor: orderedPalette?.accentColor ?? "#C7BEFF",
      noticeBackground: orderedPalette?.noticeBackground ?? "#F3F0FF",
      noticeBorder: orderedPalette?.noticeBorder ?? "#D8D1FA",
      actionButtonBackground: orderedPalette?.actionButtonBackground ?? "#9E81F0",
      actionButtonInset: orderedPalette?.actionButtonInset ?? "rgba(103, 79, 184, 0.38)",
      actionButtonShadow: orderedPalette?.actionButtonShadow ?? "rgba(158, 129, 240, 0.22)",
    };
  }

  if (normalized === "english") {
    return {
      subjectLabel: "Англи",
      iconName: "book-education-outline",
      background: orderedPalette?.background ?? "#E3F5E8",
      iconBackground: orderedPalette?.iconBackground ?? "#C9EBD3",
      borderColor: orderedPalette?.borderColor ?? "#BEE1C8",
      accentColor: orderedPalette?.accentColor ?? "#AFD7BB",
      noticeBackground: orderedPalette?.noticeBackground ?? "#EFF9F2",
      noticeBorder: orderedPalette?.noticeBorder ?? "#CDE6D5",
      actionButtonBackground: orderedPalette?.actionButtonBackground ?? "#69B88A",
      actionButtonInset: orderedPalette?.actionButtonInset ?? "rgba(74, 132, 97, 0.34)",
      actionButtonShadow: orderedPalette?.actionButtonShadow ?? "rgba(105, 184, 138, 0.22)",
    };
  }

  if (normalized === "physics") {
    return {
      subjectLabel: "Физик",
      iconName: "atom-variant",
      background: orderedPalette?.background ?? "#E8F1FF",
      iconBackground: orderedPalette?.iconBackground ?? "#D5E5FF",
      borderColor: orderedPalette?.borderColor ?? "#C8DCF8",
      accentColor: orderedPalette?.accentColor ?? "#AFCFE6",
      noticeBackground: orderedPalette?.noticeBackground ?? "#EEF6FB",
      noticeBorder: orderedPalette?.noticeBorder ?? "#C7E0EE",
      actionButtonBackground: orderedPalette?.actionButtonBackground ?? "#6C95EA",
      actionButtonInset: orderedPalette?.actionButtonInset ?? "rgba(66, 105, 185, 0.38)",
      actionButtonShadow: orderedPalette?.actionButtonShadow ?? "rgba(108, 149, 234, 0.24)",
    };
  }

  if (normalized === "civics") {
    return {
      subjectLabel: "Иргэний боловсрол",
      iconName: "account-school-outline",
      background: orderedPalette?.background ?? "#F8E2EF",
      iconBackground: orderedPalette?.iconBackground ?? "#F1CBE2",
      borderColor: orderedPalette?.borderColor ?? "#E8BCD8",
      accentColor: orderedPalette?.accentColor ?? "#E3B6D2",
      noticeBackground: orderedPalette?.noticeBackground ?? "#FCEFFA",
      noticeBorder: orderedPalette?.noticeBorder ?? "#EFC9E3",
      actionButtonBackground: orderedPalette?.actionButtonBackground ?? "#D98AEF",
      actionButtonInset: orderedPalette?.actionButtonInset ?? "rgba(170, 93, 191, 0.38)",
      actionButtonShadow: orderedPalette?.actionButtonShadow ?? "rgba(217, 138, 239, 0.24)",
    };
  }

  return {
    subjectLabel: "Нийгэм",
    iconName: "notebook-outline",
    background: orderedPalette?.background ?? "#E8E4F8",
    iconBackground: orderedPalette?.iconBackground ?? "#D4CEFE",
    borderColor: orderedPalette?.borderColor ?? "#CFC6FF",
    accentColor: orderedPalette?.accentColor ?? "#C7BEFF",
    noticeBackground: orderedPalette?.noticeBackground ?? "#F3F0FF",
    noticeBorder: orderedPalette?.noticeBorder ?? "#D8D1FA",
    actionButtonBackground: orderedPalette?.actionButtonBackground ?? "#9E81F0",
    actionButtonInset: orderedPalette?.actionButtonInset ?? "rgba(103, 79, 184, 0.38)",
    actionButtonShadow: orderedPalette?.actionButtonShadow ?? "rgba(158, 129, 240, 0.22)",
  };
}

export function getStudentExamHeader(subject: string, title: string) {
  return `${getStudentExamPresentation(subject).subjectLabel} - ${title}`;
}

export function formatScheduledDate(date?: string | null) {
  if (!date) {
    return "Товлоогүй";
  }

  const [year, month, day] = date.split("-");
  if (!year || !month || !day) {
    return date;
  }

  return `${year}/${month}/${day}`;
}

export function formatScheduledTime(time?: string | null) {
  if (!time) {
    return "--:--";
  }

  return time.slice(0, 5);
}

export function getExamEndTime(startTime: string | null | undefined, durationMinutes: number) {
  if (!startTime) {
    return "--:--";
  }

  const [hours, minutes] = startTime.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return startTime;
  }

  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const endHours = Math.floor(normalizedMinutes / 60);
  const endMinutes = normalizedMinutes % 60;

  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}

export function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatStudentExamTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}, ${year}`;
}
