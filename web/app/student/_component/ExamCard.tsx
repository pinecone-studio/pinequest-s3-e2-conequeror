import {
  BookA,
  Clock,
  FlaskConical,
  NotebookText,
  PenLine,
  Radical,
} from "lucide-react";
import type { ReactNode } from "react";
import type { StudentExamIconKey } from "../_data/completed-exams";

interface ExamCardProps {
  icon?: ReactNode;
  iconKey?: StudentExamIconKey;
  subject: string;
  topic: string;
  grade: string;
  minutes: number;
  exercises: number;
  date: string;
  bg: string;
  iconBg: string;
  scheduledDate?: string;
  startTime?: string;
  locked?: boolean;
  minutesUntilStart?: number;
  secondsUntilStart?: number;
  onClick?: () => void;
}

function ExamCardIcon({
  icon,
  iconKey,
}: {
  icon?: ReactNode;
  iconKey?: StudentExamIconKey;
}) {
  if (icon) {
    return icon;
  }

  const className = "h-6 w-6 text-[#1B1825]";
  const props = { strokeWidth: 2.2, className };

  if (iconKey === "radical") {
    return <Radical {...props} />;
  }

  if (iconKey === "flaskConical") {
    return <FlaskConical {...props} />;
  }

  if (iconKey === "bookA") {
    return <BookA {...props} />;
  }

  return <NotebookText {...props} />;
}

export default function ExamCard({
  icon,
  iconKey,
  subject,
  topic,
  grade,
  minutes,
  exercises,
  startTime,
  scheduledDate,
  locked = false,
  minutesUntilStart = 0,
  secondsUntilStart = 0,
  bg,
  iconBg,
  onClick,
}: ExamCardProps) {
  const formatCountdown = (totalSeconds: number) => {
    const safeSeconds = Math.max(0, totalSeconds);
    const mm = Math.floor(safeSeconds / 60);
    const ss = safeSeconds % 60;

    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  const displayStartTime = startTime ? startTime.slice(0, 5) : "--:--";
  const displayScheduledDate = scheduledDate || "----/--/--";
  const isClickable = Boolean(onClick) && !locked;
  const effectiveSecondsUntilStart =
    secondsUntilStart > 0
      ? secondsUntilStart
      : Math.max(1, minutesUntilStart * 60);
  const unlockInMinutes = Math.max(
    1,
    Math.ceil(effectiveSecondsUntilStart / 60),
  );

  const cardContent = (
    <div
      className={[
        "relative flex h-[269px] w-[264px] flex-col gap-3 overflow-hidden rounded-[20px] p-5 text-left transition-all duration-300",
        locked
          ? "border border-[#D9D9D9] bg-[linear-gradient(180deg,#F2F2F2_0%,#E8E8E8_100%)] opacity-90"
          : bg,
        isClickable
          ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg"
          : "cursor-default",
      ].join(" ")}
    >
      {locked ? (
        <div className="absolute top-3 right-3 rounded-full border border-[#CFCFCF] bg-[#ECECEC] px-2.5 py-1 text-[11px] font-semibold text-[#3F3F3F]">
          {formatCountdown(effectiveSecondsUntilStart)}
        </div>
      ) : null}

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}
      >
        <ExamCardIcon icon={icon} iconKey={iconKey} />
      </div>
      <div className="mt-1">
        <p className="text-[20px] leading-snug text-gray-800">
          <span className="font-bold">{subject}</span>{" "}
          <span className="font-normal text-gray-500">/{topic}/</span>
        </p>
        <p className="mt-1 text-[16px] font-medium text-gray-700">{grade}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-[14px] text-[#000000]">
          <Clock size={12} className="text-gray-400" />
          {minutes} мин
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-[14px] text-[#000000]">
          <PenLine size={12} className="text-gray-400" />
          {exercises} дасгал
        </span>
      </div>
      <div className="mt-auto">
        <p className="text-[12px] text-black font-bold ">
          Эхлэх цаг - /{displayStartTime}/
        </p>
        <p className="text-[12px] text-[#8B8B8B]">{displayScheduledDate}</p>
      </div>

      {locked ? (
        <div className="absolute right-3 bottom-3 inline-flex w-fit items-center rounded-full border border-[#CFCFCF] bg-[#E5E5E5] px-3 py-1 text-[12px] font-semibold text-[#434343]">
          Түгжигдсэн
        </div>
      ) : null}
    </div>
  );

  if (!isClickable) {
    return cardContent;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="appearance-none border-0 bg-transparent p-0 text-left"
    >
      {cardContent}
    </button>
  );
}
