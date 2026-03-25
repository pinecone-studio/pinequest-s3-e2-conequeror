import Link from "next/link";
import type { ActiveExamItem } from "@/types/student-exam";

export function ExamRowCard({ exam }: { exam: ActiveExamItem }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3">
      <div>
        <p className="text-[14px] font-medium text-[#111827]">{exam.title}</p>
        <p className="mt-1 text-[12px] text-[#9CA3AF]">
          {exam.duration} мин · {exam.questionCount} асуулт
        </p>
      </div>

      <Link
        href={`/student/exams/${exam.id}/confirm`}
        className="rounded-[8px] bg-[#1677FF] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#0F67E6]"
      >
        Эхлүүлэх
      </Link>
    </div>
  );
}
