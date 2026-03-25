import Link from "next/link";
import type { ExamDetail } from "@/types/student-exam";

export function ConfirmExamCard({ exam }: { exam: ExamDetail }) {
  return (
    <div className="w-full max-w-[320px] rounded-[18px] border border-[#E5E7EB] bg-white px-6 py-7 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-[20px] text-[#2563EB]">
        ⏱
      </div>

      <h1 className="text-[22px] font-semibold text-[#111827]">{exam.title}</h1>
      <p className="mt-1 text-[13px] text-[#9CA3AF]">{exam.grade}</p>

      <div className="mt-4 flex items-center justify-center gap-4 text-[13px] text-[#6B7280]">
        <span>{exam.duration} минут</span>
        <span>{exam.questionCount} асуулт</span>
      </div>

      <div className="mt-4 rounded-[10px] border border-[#FDE7C7] bg-[#FFF7ED] px-3 py-2 text-[12px] text-[#D97706]">
        Хугацаа дуусвал шалгалт автоматаар илгээгдэнэ
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href="/student/dashboard"
          className="rounded-[10px] bg-[#F3F4F6] px-4 py-2.5 text-[14px] font-medium text-[#6B7280]"
        >
          Буцах
        </Link>

        <Link
          href={`/student/exams/${exam.id}/take`}
          className="rounded-[10px] bg-[#1677FF] px-4 py-2.5 text-[14px] font-medium text-white"
        >
          Эхлүүлэх
        </Link>
      </div>
    </div>
  );
}
