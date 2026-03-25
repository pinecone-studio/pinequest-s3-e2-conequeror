interface Props {
  title: string;
  current: number;
  total: number;
  time: string;
  progressPercent: number;
}

export function ExamTakeHeader({
  title,
  current,
  total,
  time,
  progressPercent,
}: Props) {
  return (
    <div className="border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-medium text-[#111827]">{title}</p>
            <p className="mt-1 text-[12px] text-[#9CA3AF]">
              Асуулт {current}/{total}
            </p>
          </div>

          <div className="rounded-[10px] border border-[#CBD5E1] px-4 py-2 text-[20px] font-semibold text-[#334155]">
            {time}
          </div>
        </div>

        <div className="mt-4 h-[6px] w-full overflow-hidden rounded-full bg-[#E5E7EB]">
          <div
            className="h-full rounded-full bg-[#1677FF] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
