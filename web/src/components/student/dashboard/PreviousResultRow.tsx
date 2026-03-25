import type { PreviousResultItem } from "@/types/student-exam";

export function PreviousResultRow({ item }: { item: PreviousResultItem }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3">
      <div>
        <p className="text-[14px] font-medium text-[#111827]">{item.title}</p>
        <p className="mt-1 text-[12px] text-[#9CA3AF]">{item.date}</p>
      </div>

      <div className="text-[14px] font-semibold text-[#10B981]">{item.score}%</div>
    </div>
  );
}
