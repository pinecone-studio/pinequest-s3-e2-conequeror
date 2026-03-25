"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { examDetails } from "@/data/student-exams";
import { useCountdown } from "@/hooks/useCountdown";
import { useExamNavigation } from "@/hooks/useExamNavigation";
import { ExamTakeHeader } from "@/components/student/exam/ExamTakeHeader";
import { QuestionSidebar } from "@/components/student/exam/QuestionSidebar";
import { QuestionPanel } from "@/components/student/exam/QuestionPanel";
import { ExamBottomBar } from "@/components/student/exam/ExamBottomBar";

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function TakePage() {
  const params = useParams<{ examId: string }>();
  const exam = examDetails[params.examId];

  const secondsLeft = useCountdown(exam.duration * 60);
  const navigation = useExamNavigation(exam.questions.length);

  const currentQuestion = exam.questions[navigation.currentIndex];
  const progressPercent =
    ((navigation.currentIndex + 1) / exam.questions.length) * 100;

  const questionIds = useMemo(() => {
    return exam.questions.map((q) => q.id);
  }, [exam.questions]);

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <ExamTakeHeader
        title={exam.title}
        current={navigation.currentIndex + 1}
        total={exam.questions.length}
        time={formatTime(secondsLeft)}
        progressPercent={progressPercent}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-[180px_minmax(0,1fr)] gap-8 px-6 py-8">
        <QuestionSidebar
          total={exam.questions.length}
          currentIndex={navigation.currentIndex}
          answers={navigation.answers}
          questionIds={questionIds}
          onSelect={navigation.goTo}
        />

        <div className="flex min-h-[70vh] flex-col">
          <QuestionPanel
            question={currentQuestion}
            currentIndex={navigation.currentIndex}
            total={exam.questions.length}
            selectedAnswer={navigation.answers[currentQuestion.id]}
            onSelect={(value) =>
              navigation.selectAnswer(currentQuestion.id, value)
            }
          />

          <div className="mx-auto w-full max-w-[700px]">
            <ExamBottomBar
              total={exam.questions.length}
              currentIndex={navigation.currentIndex}
              onPrev={navigation.goPrev}
              onNext={navigation.goNext}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
