interface Props {
  total: number;
  currentIndex: number;
  answers: Record<string, string>;
  questionIds: string[];
  onSelect: (index: number) => void;
}

export function QuestionSidebar({
  total,
  currentIndex,
  answers,
  questionIds,
  onSelect,
}: Props) {
  return (
    <div className="w-[160px] rounded-[14px] border border-[#E5E7EB] bg-white p-4">
      <p className="mb-4 text-[14px] font-medium text-[#374151]">Асуултууд</p>

      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: total }).map((_, index) => {
          const qid = questionIds[index];
          const active = index === currentIndex;
          const answered = Boolean(answers[qid]);

          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={[
                "h-9 w-9 rounded-[8px] border text-[12px] font-medium transition",
                active
                  ? "border-[#1D4ED8] bg-[#1D4ED8] text-white"
                  : answered
                    ? "border-[#99F6E4] bg-[#ECFEFF] text-[#0F766E]"
                    : "border-[#E5E7EB] bg-white text-[#6B7280]",
              ].join(" ")}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-2 text-[12px] text-[#6B7280]">
        <div className="flex items-center justify-between">
          <span>Хариулсан:</span>
          <span>{Object.keys(answers).length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Үлдсэн:</span>
          <span>{total - Object.keys(answers).length}</span>
        </div>
      </div>
    </div>
  );
}
