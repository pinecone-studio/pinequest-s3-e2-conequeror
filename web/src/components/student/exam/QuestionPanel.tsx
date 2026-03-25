import type { QuestionItem } from "@/types/student-exam";

interface Props {
  question: QuestionItem;
  currentIndex: number;
  total: number;
  selectedAnswer?: string;
  onSelect: (value: string) => void;
}

export function QuestionPanel({
  question,
  currentIndex,
  total,
  selectedAnswer,
  onSelect,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-[700px] rounded-[16px] border border-[#E5E7EB] bg-white p-6">
      <div className="mb-4 inline-flex rounded-full bg-[#F3F4F6] px-3 py-1 text-[12px] text-[#6B7280]">
        Асуулт {currentIndex + 1}/{total}
      </div>

      <h2 className="mb-5 text-[28px] font-medium text-[#111827]">
        {question.question}
      </h2>

      <div className="space-y-3">
        {question.options.map((option) => {
          const active = selectedAnswer === option.value;

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.value)}
              className={[
                "flex w-full items-center gap-4 rounded-[12px] border px-4 py-4 text-left transition",
                active
                  ? "border-[#1677FF] bg-[#EFF6FF]"
                  : "border-[#E5E7EB] bg-white hover:border-[#CBD5E1]",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full border text-[13px] font-medium",
                  active
                    ? "border-[#1677FF] bg-[#1677FF] text-white"
                    : "border-[#D1D5DB] text-[#6B7280]",
                ].join(" ")}
              >
                {option.label}
              </span>

              <span className="text-[15px] text-[#374151]">{option.value}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
