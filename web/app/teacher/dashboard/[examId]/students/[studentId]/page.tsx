import { StudentReviewDetail } from "../../../../_component/StudentReviewDetail";

type TeacherStudentReviewPageProps = {
  params: Promise<{
    examId: string;
    studentId: string;
  }>;
};

export default async function TeacherStudentReviewPage({
  params,
}: TeacherStudentReviewPageProps) {
  const { examId, studentId } = await params;
  return <StudentReviewDetail examId={examId} studentId={studentId} />;
}
