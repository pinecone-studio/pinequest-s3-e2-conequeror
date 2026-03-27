import { TeacherExamDetail } from "../../_component/TeacherExamDetail";

type TeacherExamViewPageProps = {
  params: Promise<{
    examId: string;
  }>;
};

export default async function TeacherExamViewPage({
  params,
}: TeacherExamViewPageProps) {
  const { examId } = await params;
  return <TeacherExamDetail examId={examId} />;
}
