import { ExamRowCard } from "@/components/student/dashboard/ExamRowCard";
import { PreviousResultRow } from "@/components/student/dashboard/PreviousResultRow";
import { activeExams, previousResults } from "@/data/student-exams";

export default function StudentDashboardPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between border-b border-[#EAEAEA] pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-[#1677FF] px-2 py-1 text-[12px] font-semibold text-white">
              LMS
            </div>
            <span className="text-[14px] font-medium text-[#374151]">Сурагч</span>
          </div>

          <div className="flex items-center gap-6 text-[14px] text-[#6B7280]">
            <button className="rounded-full bg-[#1677FF] px-4 py-1.5 text-white">
              Нүүр
            </button>
            <button>Шалгалтууд</button>
            <button>Профайл</button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-[32px] font-semibold text-[#111827]">Сайн байна уу!</h1>
          <p className="mt-1 text-[14px] text-[#9CA3AF]">Өнөөдөр хийх шалгалтууд</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-[14px] font-medium text-[#4B5563]">Идэвхтэй шалгалтууд</h2>

          {activeExams.map((exam) => (
            <ExamRowCard key={exam.id} exam={exam} />
          ))}
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-[14px] font-medium text-[#4B5563]">Өмнөх үр дүнгүүд</h2>

          {previousResults.map((item) => (
            <PreviousResultRow key={item.id} item={item} />
          ))}
        </section>
      </div>
    </main>
  );
}
