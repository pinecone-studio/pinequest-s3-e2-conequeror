import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const orderedSubjectPalette = [
  {
    background: "#E8E4F8",
    iconBackground: "#D4CEFE",
    borderColor: "#CFC6FF",
  },
  {
    background: "#DFF0F8",
    iconBackground: "#C8E4F4",
    borderColor: "#B9DDEE",
  },
  {
    background: "#F8E2EF",
    iconBackground: "#F1CBE2",
    borderColor: "#E8BCD8",
  },
  {
    background: "#E3F5E8",
    iconBackground: "#C9EBD3",
    borderColor: "#BEE1C8",
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
    };
  }

  if (normalized === "chemistry") {
    return {
      subjectLabel: "Хими",
      iconName: "flask-outline",
      background: orderedPalette?.background ?? "#F0E4F8",
      iconBackground: orderedPalette?.iconBackground ?? "#E0CEFE",
      borderColor: orderedPalette?.borderColor ?? "#D9C8F6",
    };
  }

  if (normalized === "english") {
    return {
      subjectLabel: "Англи",
      iconName: "book-education-outline",
      background: orderedPalette?.background ?? "#E3F5E8",
      iconBackground: orderedPalette?.iconBackground ?? "#C9EBD3",
      borderColor: orderedPalette?.borderColor ?? "#BEE1C8",
    };
  }

  if (normalized === "physics") {
    return {
      subjectLabel: "Физик",
      iconName: "atom-variant",
      background: orderedPalette?.background ?? "#E8F1FF",
      iconBackground: orderedPalette?.iconBackground ?? "#D5E5FF",
      borderColor: orderedPalette?.borderColor ?? "#C8DCF8",
    };
  }

  if (normalized === "civics") {
    return {
      subjectLabel: "Иргэний боловсрол",
      iconName: "account-school-outline",
      background: orderedPalette?.background ?? "#F8E2EF",
      iconBackground: orderedPalette?.iconBackground ?? "#F1CBE2",
      borderColor: orderedPalette?.borderColor ?? "#E8BCD8",
    };
  }

  return {
    subjectLabel: "Нийгэм",
    iconName: "notebook-outline",
    background: orderedPalette?.background ?? "#E8E4F8",
    iconBackground: orderedPalette?.iconBackground ?? "#D4CEFE",
    borderColor: orderedPalette?.borderColor ?? "#CFC6FF",
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
