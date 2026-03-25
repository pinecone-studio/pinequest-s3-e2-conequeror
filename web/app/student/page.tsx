"use client";

import { useEffect, useMemo, useState } from "react";

type Screen = "dashboard" | "confirm" | "take";

type ActiveExam = {
  id: string;
  title: string;
  duration: number;
  questionCount: number;
  grade: string;
};

type PreviousResult = {
  id: string;
  title: string;
  date: string;
  score: number;
};

type Question = {
  id: string;
  order: number;
  question: string;
  options: {
    id: string;
    label: string;
    value: string;
  }[];
};

const activeExams: ActiveExam[] = [
  {
    id: "math-test-3",
    title: "Математик - Тест 3",
    duration: 45,
    questionCount: 20,
    grade: "10-р анги",
  },
  {
    id: "english-vocab",
    title: "Англи хэл - Үгийн сан",
    duration: 30,
    questionCount: 30,
    grade: "10-р анги",
  },
];

const previousResults: PreviousResult[] = [
  {
    id: "physics-1",
    title: "Физик - Кинематик",
    date: "2024-03-15",
    score: 82,
  },
  {
    id: "math-2",
    title: "Математик - Тест 2",
    date: "2024-03-10",
    score: 91,
  },
];

const questions: Question[] = [
  {
    id: "q1",
    order: 1,
    question: "JavaScript-ийг анх хэн бүтээсэн бэ?",
    options: [
      { id: "a", label: "A", value: "Bill Gates" },
      { id: "b", label: "B", value: "Elon Musk" },
      { id: "c", label: "C", value: "Brendan Eich" },
      { id: "d", label: "D", value: "Mark Zuckerberg" },
    ],
  },
  {
    id: "q2",
    order: 2,
    question: "2x + 5 = 15 тэгшитгэлийн шийд аль вэ?",
    options: [
      { id: "a", label: "A", value: "x = 3" },
      { id: "b", label: "B", value: "x = 5" },
      { id: "c", label: "C", value: "x = 10" },
      { id: "d", label: "D", value: "x = 7" },
    ],
  },
  {
    id: "q3",
    order: 3,
    question: "5 + 7 = ?",
    options: [
      { id: "a", label: "A", value: "10" },
      { id: "b", label: "B", value: "11" },
      { id: "c", label: "C", value: "12" },
      { id: "d", label: "D", value: "13" },
    ],
  },
  {
    id: "q4",
    order: 4,
    question: "9 × 3 = ?",
    options: [
      { id: "a", label: "A", value: "27" },
      { id: "b", label: "B", value: "24" },
      { id: "c", label: "C", value: "21" },
      { id: "d", label: "D", value: "18" },
    ],
  },
  {
    id: "q5",
    order: 5,
    question: "√81 = ?",
    options: [
      { id: "a", label: "A", value: "7" },
      { id: "b", label: "B", value: "8" },
      { id: "c", label: "C", value: "9" },
      { id: "d", label: "D", value: "10" },
    ],
  },
];

function formatTime(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function StudentPage() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [selectedExam, setSelectedExam] = useState<ActiveExam>(activeExams[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(selectedExam.duration * 60);

  useEffect(() => {
    if (screen !== "take") return;
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, secondsLeft]);

  useEffect(() => {
    setSecondsLeft(selectedExam.duration * 60);
  }, [selectedExam]);

  const currentQuestion = questions[currentIndex];

  const progressPercent = useMemo(() => {
    return ((currentIndex + 1) / questions.length) * 100;
  }, [currentIndex]);

  const answeredCount = Object.keys(answers).length;

  const handleSelectExam = (exam: ActiveExam) => {
    setSelectedExam(exam);
    setScreen("confirm");
  };

  const handleStartExam = () => {
    setCurrentIndex(0);
    setAnswers({});
    setSecondsLeft(selectedExam.duration * 60);
    setScreen("take");
  };

  const handleSelectAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const topNav = (
    <div className="border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-[#1677FF] px-2 py-1 text-[12px] font-semibold text-white">
            LMS
          </div>
          <span className="text-[14px] font-medium text-[#374151]">Сурагч</span>
        </div>

        <div className="flex items-center gap-6 text-[14px] text-[#6B7280]">
          <button
            onClick={() => setScreen("dashboard")}
            className={`rounded-full px-4 py-1.5 ${
              screen === "dashboard"
                ? "bg-[#1677FF] text-white"
                : "text-[#6B7280]"
            }`}
          >
            Нүүр
          </button>
          <button className="text-[#9CA3AF]">Шалгалтууд</button>
          <button className="text-[#9CA3AF]">Профайл</button>
        </div>
      </div>
    </div>
  );

  if (screen === "dashboard") {
    return (
      <main className="min-h-screen bg-[#FAFAFA]">
        {topNav}

        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-[32px] font-semibold text-[#111827]">
              Сайн байна уу!
            </h1>
            <p className="mt-1 text-[14px] text-[#9CA3AF]">
              Өнөөдөр хийх шалгалтууд
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-[14px] font-medium text-[#4B5563]">
              Идэвхтэй шалгалтууд
            </h2>

            {activeExams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3"
              >
                <div>
                  <p className="text-[14px] font-medium text-[#111827]">
                    {exam.title}
                  </p>
                  <p className="mt-1 text-[12px] text-[#9CA3AF]">
                    {exam.duration} минут · {exam.questionCount} асуулт
                  </p>
                </div>

                <button
                  onClick={() => handleSelectExam(exam)}
                  className="rounded-[8px] bg-[#1677FF] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#0F67E6]"
                >
                  Эхлүүлэх
                </button>
              </div>
            ))}
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-[14px] font-medium text-[#4B5563]">
              Өмнөх үр дүнгүүд
            </h2>

            {previousResults.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3"
              >
                <div>
                  <p className="text-[14px] font-medium text-[#111827]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[12px] text-[#9CA3AF]">{item.date}</p>
                </div>

                <div className="text-[14px] font-semibold text-[#10B981]">
                  {item.score}%
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    );
  }

  if (screen === "confirm") {
    return (
      <main className="min-h-screen bg-[#FAFAFA]">
        {topNav}

        <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
          <div className="w-full max-w-[320px] rounded-[18px] border border-[#E5E7EB] bg-white px-6 py-7 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-[20px] text-[#2563EB]">
              ⏱
            </div>

            <h1 className="text-[22px] font-semibold text-[#111827]">
              {selectedExam.title}
            </h1>
            <p className="mt-1 text-[13px] text-[#9CA3AF]">
              {selectedExam.grade}
            </p>

            <div className="mt-4 flex items-center justify-center gap-4 text-[13px] text-[#6B7280]">
              <span>{selectedExam.duration} минут</span>
              <span>{selectedExam.questionCount} асуулт</span>
            </div>

            <div className="mt-4 rounded-[10px] border border-[#FDE7C7] bg-[#FFF7ED] px-3 py-2 text-[12px] text-[#D97706]">
              Хугацаа дуусвал шалгалт автоматаар илгээгдэнэ
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setScreen("dashboard")}
                className="rounded-[10px] bg-[#F3F4F6] px-4 py-2.5 text-[14px] font-medium text-[#6B7280]"
              >
                Буцах
              </button>

              <button
                onClick={handleStartExam}
                className="rounded-[10px] bg-[#1677FF] px-4 py-2.5 text-[14px] font-medium text-white"
              >
                Эхлүүлэх
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-[#111827]">
                {selectedExam.title}
              </p>
              <p className="mt-1 text-[12px] text-[#9CA3AF]">
                Асуулт {currentIndex + 1}/{questions.length}
              </p>
            </div>

            <div className="rounded-[10px] border border-[#CBD5E1] px-4 py-2 text-[20px] font-semibold text-[#334155]">
              {formatTime(secondsLeft)}
            </div>
          </div>

          <div className="mt-4 h-[6px] w-full overflow-hidden rounded-full bg-[#E5E7EB]">
            <div
              className="h-full rounded-full bg-[#1677FF] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-[180px_minmax(0,1fr)] gap-8 px-6 py-8">
        <div className="w-[200px] rounded-[14px] border border-[#E5E7EB] bg-white p-2">
          <p className="mb-4 text-[14px] font-medium text-[#374151]">
            Асуултууд
          </p>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const active = currentIndex === index;
              const answered = Boolean(answers[question.id]);

              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentIndex(index)}
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
              <span>{answeredCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Үлдсэн:</span>
              <span>{questions.length - answeredCount}</span>
            </div>
          </div>
        </div>

        <div className="flex min-h-[70vh] flex-col">
          <div className="mx-auto w-full max-w-[700px] rounded-[16px] border border-[#E5E7EB] bg-white p-6">
            <div className="mb-4 inline-flex rounded-full bg-[#F3F4F6] px-3 py-1 text-[12px] text-[#6B7280]">
              Асуулт {currentIndex + 1}/{questions.length}
            </div>

            <h2 className="mb-5 text-[28px] font-medium text-[#111827]">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const active = answers[currentQuestion.id] === option.value;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectAnswer(option.value)}
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

                    <span className="text-[15px] text-[#374151]">
                      {option.value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-auto mt-10 flex w-full max-w-[700px] items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="min-w-[120px] rounded-[10px] bg-[#F3F4F6] px-5 py-3 text-[14px] font-medium text-[#9CA3AF] disabled:opacity-70"
            >
              Өмнөх
            </button>

            <div className="flex items-center gap-2">
              {questions.map((_, index) => (
                <span
                  key={index}
                  className={[
                    "h-2.5 w-2.5 rounded-full",
                    currentIndex === index ? "bg-[#1677FF]" : "bg-[#D1D5DB]",
                  ].join(" ")}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="min-w-[140px] rounded-[10px] bg-[#1677FF] px-5 py-3 text-[14px] font-medium text-white"
            >
              {currentIndex === questions.length - 1 ? "Илгээх" : "Дараах"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
