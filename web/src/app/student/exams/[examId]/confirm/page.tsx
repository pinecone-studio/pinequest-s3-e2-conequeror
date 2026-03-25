import { ConfirmExamCard } from "@/components/student/exam/ConfirmExamCard";
import { examDetails } from "@/data/student-exams";

interface Props {
  params: Promise<{ examId: string }>;
}

export default async function ConfirmPage({ params }: Props) {
  const { examId } = await params;
  const exam = examDetails[examId];

  if (!exam) {
    return <div className="p-10">Exam not found</div>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-6">
      <ConfirmExamCard exam={exam} />
    </main>
  );
}
