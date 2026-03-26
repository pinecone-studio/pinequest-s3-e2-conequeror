"use client";

import { useState, useSyncExternalStore } from "react";
import {
  BookA,
  ChevronLeft,
  Clock3,
  FlaskConical,
  NotebookText,
  PenLine,
  Radical,
} from "lucide-react";
import {
  completedExamStorageKey,
  defaultCompletedExams,
  mergeCompletedExams,
  type CompletedExamRecord,
  type StudentExamIconKey,
} from "../../_data/completed-exams";

type ReviewPaletteStatus = "default" | "correct" | "wrong";

type ReviewQuestion = {
  id: string;
  order: number;
  prompt: string;
  scoreLabel: string;
  type: "text" | "choice";
  placeholder?: string;
  options?: {
    id: string;
    label: string;
    text: string;
  }[];
  selectedOptionId?: string;
  correctOptionId?: string;
};

const reviewPalette = [
  { order: 1, status: "correct" },
  { order: 2, status: "wrong" },
  { order: 3, status: "correct" },
  { order: 4, status: "correct" },
  { order: 5, status: "correct" },
  { order: 6, status: "correct" },
  { order: 7, status: "correct" },
  { order: 8, status: "correct" },
  { order: 9, status: "wrong" },
  { order: 10, status: "correct" },
  { order: 11, status: "correct" },
  { order: 12, status: "correct" },
  { order: 13, status: "correct" },
  { order: 14, status: "correct" },
  { order: 15, status: "correct" },
  { order: 16, status: "correct" },
  { order: 17, status: "wrong" },
  { order: 18, status: "correct" },
  { order: 19, status: "correct" },
  { order: 20, status: "correct" },
  { order: 21, status: "correct" },
  { order: 22, status: "correct" },
  { order: 23, status: "correct" },
  { order: 24, status: "wrong" },
  { order: 25, status: "correct" },
] as const satisfies { order: number; status: ReviewPaletteStatus }[];

const reviewQuestions: ReviewQuestion[] = [
  {
    id: "review-q1",
    order: 1,
    prompt: "Нийгэм гэж юу вэ?",
    scoreLabel: "1/1 оноо",
    type: "text",
    placeholder: "Хариултаа бичнэ үү...",
  },
  {
    id: "review-q2",
    order: 2,
    prompt: "Ардчиллын гол зарчим аль нь вэ?",
    scoreLabel: "0/1 оноо",
    type: "choice",
    selectedOptionId: "c",
    correctOptionId: "b",
    options: [
      { id: "a", label: "A.", text: "Нэг хүний засаглал" },
      { id: "b", label: "Б.", text: "Иргэдийн оролцоо" },
      { id: "c", label: "В.", text: "Хүчээр захирах" },
      { id: "d", label: "Г.", text: "Хаант засаглал" },
    ],
  },
  {
    id: "review-q3",
    order: 3,
    prompt: "Хууль ямар үүрэгтэй вэ?",
    scoreLabel: "0/1 оноо",
    type: "choice",
    selectedOptionId: "c",
    correctOptionId: "c",
    options: [
      { id: "a", label: "A.", text: "Зөвхөн шийтгэх" },
      { id: "b", label: "Б.", text: "Нийгмийг задлах" },
      { id: "c", label: "В.", text: "Харилцааг зохицуулах" },
      { id: "d", label: "Г.", text: "Зөвхөн төрд үйлчлэх" },
    ],
  },
];

const summaryRows = [
  { label: "Анги", value: "10-1" },
  { label: "Хугацаа", value: "28мин" },
  { label: "Оноо", value: "23/30" },
  { label: "Хувь", value: "76%" },
  { label: "Алдсан", value: "4" },
  { label: "Нийт дасгал", value: "28" },
] as const;

function ResultIcon({ iconKey }: { iconKey: StudentExamIconKey }) {
  const className = "h-6 w-6 text-[#1B1825]";
  const props = { strokeWidth: 2.2, className };

  if (iconKey === "radical") {
    return <Radical {...props} />;
  }

  if (iconKey === "flaskConical") {
    return <FlaskConical {...props} />;
  }

  if (iconKey === "bookA") {
    return <BookA {...props} />;
  }

  return <NotebookText {...props} />;
}

function ResultCard({
  subject,
  topic,
  grade,
  minutes,
  exercises,
  date,
  bg,
  iconBg,
  iconKey,
  onClick,
}: CompletedExamRecord & { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="appearance-none border-0 bg-transparent p-0 text-left"
    >
      <article
        className={`flex min-h-[178px] max-w-[264px] cursor-pointer flex-col rounded-[24px] p-4 shadow-[0_10px_24px_rgba(71,54,124,0.04)] transition-transform duration-200 hover:-translate-y-1 ${bg}`}
      >
        <div
          className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}
        >
          <ResultIcon iconKey={iconKey} />
        </div>

        <div>
          <p className="text-[15px] leading-snug text-[#2A2533]">
            <span className="font-bold">{subject}</span>{" "}
            <span className="font-normal text-[#5E5A68]">/{topic}/</span>
          </p>
          <p className="mt-3 text-[13px] font-semibold text-[#3A3445]">
            {grade}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#4C4759] shadow-[0_4px_10px_rgba(17,24,39,0.04)]">
            <Clock3 className="h-3.5 w-3.5 text-[#6E6780]" />
            {minutes} мин
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#4C4759] shadow-[0_4px_10px_rgba(17,24,39,0.04)]">
            <PenLine className="h-3.5 w-3.5 text-[#6E6780]" />
            {exercises} дасгал
          </span>
        </div>

        <p className="mt-auto pt-5 text-[12px] text-[#9B98A8]">{date}</p>
      </article>
    </button>
  );
}

function getPaletteClasses(status: ReviewPaletteStatus) {
  if (status === "correct") {
    return "border-[#9CD89F] bg-[#EDFAEE] text-[#68A56C]";
  }

  if (status === "wrong") {
    return "border-[#F0A6A0] bg-[#FFF1F0] text-[#D86A62]";
  }

  return "border-[#D9D1F2] bg-white text-[#7E66DC]";
}

function getReviewOptionState(
  question: ReviewQuestion,
  optionId: string,
): "neutral" | "correct" | "wrong" {
  if (question.correctOptionId === optionId) {
    return "correct";
  }

  if (question.selectedOptionId === optionId) {
    return "wrong";
  }

  return "neutral";
}

function getReviewOptionClasses(state: "neutral" | "correct" | "wrong") {
  if (state === "correct") {
    return {
      row: "border-[#CDEBCE] bg-[#E8F7E9]",
      radio: "border-[#76B779]",
      dot: "bg-[#76B779]",
    };
  }

  if (state === "wrong") {
    return {
      row: "border-[#F0C2BD] bg-[#FBEAEA]",
      radio: "border-[#D66F68]",
      dot: "bg-[#D66F68]",
    };
  }

  return {
    row: "border-[#EAE6F5] bg-white",
    radio: "border-[#C8C3D8]",
    dot: "",
  };
}

export default function UrDunPage() {
  const [selectedResult, setSelectedResult] =
    useState<CompletedExamRecord | null>(null);
  const [focusedQuestion, setFocusedQuestion] = useState(1);

  const completedExams = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        const stored = window.localStorage.getItem(completedExamStorageKey);
        if (!stored) {
          return defaultCompletedExams;
        }

        const parsed = JSON.parse(stored) as CompletedExamRecord[];
        return mergeCompletedExams([...parsed, ...defaultCompletedExams]);
      } catch {
        return defaultCompletedExams;
      }
    },
    () => defaultCompletedExams,
  );

  const renderedCompletedExams = completedExams;

  const handleFocusQuestion = (order: number) => {
    setFocusedQuestion(order);

    const questionElement = document.getElementById(`review-question-${order}`);
    questionElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (selectedResult) {
    return (
      <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <button
          type="button"
          onClick={() => setSelectedResult(null)}
          className="mb-6 inline-flex items-center gap-3 text-[18px] font-medium text-[#36313F] transition hover:text-[#7E66DC]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F0FA]">
            <ChevronLeft className="h-5 w-5" />
          </span>
          Буцах
        </button>

        <div className="grid gap-5 lg:grid-cols-[212px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <div className="rounded-[18px] border border-[#E6E1F2] bg-white p-4 shadow-[0_4px_12px_rgba(53,31,107,0.03)]">
              <h2 className="text-[16px] font-semibold text-[#25222D]">
                C.Анужин
              </h2>

              <div className="mt-4 space-y-2.5">
                {summaryRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 text-[14px]"
                  >
                    <span className="font-semibold text-[#3A3643]">
                      {row.label}
                    </span>
                    <span className="text-[#54505E]">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-[#E6E1F2] bg-white p-3 shadow-[0_4px_12px_rgba(53,31,107,0.03)]">
              <p className="mb-4 text-[14px] font-semibold text-[#2A2733]">
                Асуулт
              </p>

              <div className="mx-auto grid w-fit grid-cols-5 gap-2.5">
                {reviewPalette.map((item) => (
                  <button
                    key={item.order}
                    type="button"
                    onClick={() => handleFocusQuestion(item.order)}
                    className={[
                      "flex h-7 w-7 cursor-pointer items-center justify-center rounded-[10px] border text-[12px] font-medium transition",
                      focusedQuestion === item.order
                        ? "border-[#7E66DC] ring-2 ring-[#7E66DC]/15"
                        : "",
                      getPaletteClasses(item.status),
                    ].join(" ")}
                  >
                    {item.order}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            {reviewQuestions.map((question) => (
              <article
                key={question.id}
                id={`review-question-${question.order}`}
                className="rounded-[16px] border border-[#E8E4F3] bg-white p-4 shadow-[0_4px_12px_rgba(53,31,107,0.03)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-[16px] font-semibold text-[#27242F]">
                    {question.order}. {question.prompt}
                  </h2>
                  <span className="shrink-0 text-[14px] font-medium text-[#5E5A68]">
                    {question.scoreLabel}
                  </span>
                </div>

                {question.type === "text" ? (
                  <div className="mt-4 rounded-[12px] border border-[#E9E4F6] bg-white px-4 py-3 text-[15px] text-[#A19CAA]">
                    {question.placeholder}
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {question.options?.map((option) => {
                      const state = getReviewOptionState(question, option.id);
                      const optionClasses = getReviewOptionClasses(state);

                      return (
                        <div
                          key={option.id}
                          className={[
                            "flex w-full items-center gap-3 rounded-[12px] border px-4 py-3 text-left",
                            optionClasses.row,
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                              optionClasses.radio,
                            ].join(" ")}
                          >
                            {state !== "neutral" ? (
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${optionClasses.dot}`}
                              />
                            ) : null}
                          </span>

                          <span className="text-[15px] font-medium text-[#383540]">
                            {option.label} {option.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-[26px] font-bold tracking-tight text-[#19161F]">
          Миний үр дүнгүүд
        </h1>
        <p className="mt-1 text-[14px] text-[#6E6A79]">
          Өмнө өгсөн шалгалтуудын дүнгүүд.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {renderedCompletedExams.map((exam) => (
          <ResultCard
            key={`${exam.id}-${exam.date}`}
            {...exam}
            onClick={() => {
              setSelectedResult(exam);
              setFocusedQuestion(1);
            }}
          />
        ))}
      </div>
    </div>
  );
}
