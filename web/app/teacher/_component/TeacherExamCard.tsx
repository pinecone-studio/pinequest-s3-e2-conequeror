import { Clock3, FileText, PencilLine, Users } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  getSubjectDisplayLabel,
  getSubjectCardPalette,
  type ExamCard,
  type SubjectKey,
} from "../_data/dashboard";

function getActionButtonStyles(subject: SubjectKey): CSSProperties {
  if (subject === "social") {
    return {
      background: "#9E81F0",
      boxShadow:
        "inset 0 -5px 0 rgba(103, 79, 184, 0.38), 0 8px 16px rgba(158, 129, 240, 0.22)",
    };
  }

  return {
    background: "#6499E8",
    boxShadow:
      "inset 0 -5px 0 rgba(63, 113, 188, 0.38), 0 8px 16px rgba(100, 153, 232, 0.22)",
  };
}

type TeacherExamCardProps = {
  card: ExamCard;
  href: string;
  showActionButton?: boolean;
  onActionClick?: (card: ExamCard) => void;
};

export function TeacherExamCard({
  card,
  href,
  showActionButton = false,
  onActionClick,
}: TeacherExamCardProps) {
  const palette = getSubjectCardPalette(card.subject);
  const SubjectIcon =
    card.subject === "social" || card.subject === "civics" ? FileText : Users;

  const cardContent = (
    <>
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: palette.iconBackground }}
      >
        <SubjectIcon className="h-5 w-5 text-[#111111]" strokeWidth={2} />
      </div>

      <div className="mt-4">
        <h2 className="text-[18px] font-semibold text-[#111111]">
          {card.title}
          <span className="font-normal"> /{card.topic}/</span>
        </h2>
        <p className="text-sm text-[#6B6B6B]">
          {card.classroomName || card.grade}
        </p>
      </div>

      <div className="mt-5 flex gap-2 text-xs">
        <span className="flex items-center gap-1 rounded-full bg-white/85 px-3 py-1 shadow-sm">
          <Clock3 className="h-3.5 w-3.5" />
          {card.duration} мин
        </span>
        <span className="flex items-center gap-1 rounded-full bg-white/85 px-3 py-1 shadow-sm">
          <PencilLine className="h-3.5 w-3.5" />
          {card.taskCount} даалгавар
        </span>
      </div>
    </>
  );

  if (showActionButton) {
    return (
      <div
        className="group flex min-h-[284px] flex-col rounded-2xl border px-5 py-5 transition hover:-translate-y-0.5 hover:shadow-md"
        style={{
          backgroundColor: palette.cardBackground,
          borderColor: palette.borderColor,
        }}
      >
        <Link href={href} className="block">
          {cardContent}
        </Link>

        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={() => onActionClick?.(card)}
            className="flex h-11 w-full items-center justify-center rounded-full text-[16px] font-semibold text-white"
            style={getActionButtonStyles(card.subject)}
          >
            Шалгалт авах
          </button>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group block rounded-2xl border px-5 py-5 transition hover:-translate-y-0.5 hover:shadow-md"
      style={{
        backgroundColor: palette.cardBackground,
        borderColor: palette.borderColor,
      }}
    >
      {cardContent}
      {showActionButton ? (
        <></>
      ) : (
        <>
          <p className="mt-4 text-sm text-[#111111]">
            {getSubjectDisplayLabel(card.subject)} / {card.startTime || "--:--"}
          </p>
          <p className="mt-3 text-xs text-[#6D6778]">{card.date || "-"}</p>
        </>
      )}
    </Link>
  );
}
