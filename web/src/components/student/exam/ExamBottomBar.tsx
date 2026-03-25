interface Props {
  total: number;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

export function ExamBottomBar({
  total,
  currentIndex,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className="mt-10 flex items-center justify-between">
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="min-w-[120px] rounded-[10px] bg-[#F3F4F6] px-5 py-3 text-[14px] font-medium text-[#9CA3AF] disabled:opacity-70"
      >
        Өмнөх
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, index) => (
          <span
            key={index}
            className={[
              "h-2.5 w-2.5 rounded-full",
              currentIndex === index ? "bg-[#1677FF]" : "bg-[#D1D5DB]",
            ].join(" ")}
          />
        ))}
      </div>

      <button
        onClick={onNext}
        className="min-w-[140px] rounded-[10px] bg-[#1677FF] px-5 py-3 text-[14px] font-medium text-white"
      >
        {currentIndex === total - 1 ? "Илгээх" : "Дараах"}
      </button>
    </div>
  );
}
