"use client";

import Link from "next/link";
import { ChevronLeft, PencilLine, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { ExamCard } from "../_data/dashboard";

type ExamDetailQuestion = {
  id: string;
  order: number;
  prompt: string;
  scoreLabel: string;
  type: "text" | "choice";
  answerText?: string;
  options?: {
    id: string;
    label: string;
    text: string;
  }[];
  selectedOptionId?: string;
};

const choiceTemplates = [
  [
    { id: "a", label: "A.", text: "Нэг хүний засаглал" },
    { id: "b", label: "Б.", text: "Иргэдийн оролцоо" },
    { id: "c", label: "В.", text: "Хүчээр захирах" },
    { id: "d", label: "Г.", text: "Хаант засаглал" },
  ],
  [
    { id: "a", label: "A.", text: "Зөвхөн шийтгэх" },
    { id: "b", label: "Б.", text: "Нийгмийг задлах" },
    { id: "c", label: "В.", text: "Харилцааг зохицуулах" },
    { id: "d", label: "Г.", text: "Зөвхөн төрд үйлчлэх" },
  ],
  [
    { id: "a", label: "A.", text: "Иргэний оролцоог дэмжих" },
    { id: "b", label: "Б.", text: "Хууль тогтоомжид захирагдах" },
    { id: "c", label: "В.", text: "Хариуцлагаас зайлсхийх" },
    { id: "d", label: "Г.", text: "Нийтийн ашиг сонирхлыг хамгаалах" },
  ],
  [
    { id: "a", label: "A.", text: "Хувийн ашиг сонирхлыг нэн тэргүүнд тавих" },
    { id: "b", label: "Б.", text: "Нийтийн ашиг сонирхлыг хүндэтгэх" },
    { id: "c", label: "В.", text: "Дүрмийг үл тоомсорлох" },
    { id: "d", label: "Г.", text: "Бусдын эрхийг зөрчих" },
  ],
] as const;

const socialPrompts = [
  "Нийгмийн бүлгийн жишээ аль вэ?",
  "Сонгуулийн гол зорилго юу вэ?",
  "Хариуцлагатай иргэн гэж хэнийг хэлэх вэ?",
  "Орон нутгийн өөрөө удирдах байгууллага аль вэ?",
  "Хууль зөрчвөл ямар үр дагавартай вэ?",
  "Ардчилалд хэвлэл мэдээлэл ямар үүрэгтэй вэ?",
  "Татварын үндсэн зориулалт юу вэ?",
  "Хүний эрхийг хамгаалах байгууллага аль вэ?",
  "Нийгмийн шударга ёс гэж юу вэ?",
  "Улсын бэлгэдэлд аль нь хамаарах вэ?",
  "Боловсролын гол ач холбогдол юу вэ?",
  "Иргэний үүргийн жишээ аль вэ?",
  "Төр ба иргэний харилцааны үндэс юу вэ?",
  "Хуулийн өмнө хүн бүр ямар байх ёстой вэ?",
  "Иргэний нийгмийн байгууллагын үүрэг юу вэ?",
  "Нийтийн ашиг сонирхол гэж юуг хэлэх вэ?",
  "Төрийн байгууллага юунд захирагдах ёстой вэ?",
] as const;

const civicsPrompts = [
  "Иргэний оролцооны хэлбэр аль нь вэ?",
  "Үндсэн хуулийн ач холбогдол юу вэ?",
  "Иргэний эрхээ хамгаалах нэг арга аль нь вэ?",
  "Орон нутгийн хурлын үүрэг юу вэ?",
  "Нийтийн өмчийг хамгаалах нь юунд хэрэгтэй вэ?",
  "Сайн дурын үйл ажиллагааны ач холбогдол юу вэ?",
  "Иргэн хүн яагаад хууль мөрдөх ёстой вэ?",
  "Хүний эрхийн зөрчлийг хаана мэдээлэх вэ?",
  "Хариуцлагатай сонголт гэж юуг хэлэх вэ?",
  "Нийгмийн эв нэгдлийг юу бэхжүүлэх вэ?",
  "Шударга шийдвэр гаргалт юунд тулгуурлах вэ?",
  "Нээлттэй засаглалын нэг шинж аль нь вэ?",
  "Иргэний боловсролын зорилго юу вэ?",
  "Нийтийн хэлэлцүүлэг ямар ач холбогдолтой вэ?",
  "Хууль дээдлэх зарчим юуг илэрхийлэх вэ?",
  "Оролцоотой иргэн нийгэмд ямар нөлөөтэй вэ?",
  "Иргэний үүрэг ба эрхийн холбоо юу вэ?",
] as const;

function buildExamDetailQuestions(exam: ExamCard): ExamDetailQuestion[] {
  const firstQuestion =
    exam.subject === "civics"
      ? {
          prompt: "Иргэн гэж хэн бэ?",
          answerText:
            "Иргэн гэдэг нь улс орныхоо хууль дүрмийг хүндэтгэн дагаж, эрхээ эдлэхийн зэрэгцээ үүргээ биелүүлж, нийтийн амьдралд хариуцлагатай оролцдог хүнийг хэлнэ.",
        }
      : {
          prompt: "Нийгэм гэж юу вэ?",
          answerText:
            "Нийгэм гэдэг нь хүмүүс хоорондоо хамтран амьдарч, харилцаж, дүрэм журам, үнэт зүйл, байгууллага, соёлын хүрээнд зохион байгуулалттай оршиж буй хамтын амьдралын тогтолцоо юм.",
        };

  const secondQuestion =
    exam.subject === "civics"
      ? {
          prompt: "Иргэний оролцооны зөв жишээ аль нь вэ?",
          options: [
            { id: "a", label: "A.", text: "Санал бодлоо нуух" },
            { id: "b", label: "Б.", text: "Нийтийн хэлэлцүүлэгт оролцох" },
            { id: "c", label: "В.", text: "Дүрэм зөрчих" },
            { id: "d", label: "Г.", text: "Бусдыг үл хүндэтгэх" },
          ],
        }
      : {
          prompt: "Ардчиллын гол зарчим аль нь вэ?",
          options: [...choiceTemplates[0]],
        };

  const thirdQuestion =
    exam.subject === "civics"
      ? {
          prompt: "Үндсэн хууль ямар ач холбогдолтой вэ?",
          options: [
            { id: "a", label: "A.", text: "Зөвхөн шийтгэл тогтоох" },
            { id: "b", label: "Б.", text: "Эрх, үүргийн үндсийг тогтоох" },
            { id: "c", label: "В.", text: "Харилцааг задлах" },
            { id: "d", label: "Г.", text: "Түр хугацаанд үйлчлэх" },
          ],
        }
      : {
          prompt: "Хууль ямар үүрэгтэй вэ?",
          options: [...choiceTemplates[1]],
        };

  const prompts = exam.subject === "civics" ? civicsPrompts : socialPrompts;

  const baseQuestions: ExamDetailQuestion[] = [
    {
      id: `${exam.id}-q1`,
      order: 1,
      prompt: firstQuestion.prompt,
      scoreLabel: "1/1 оноо",
      type: "text",
      answerText: firstQuestion.answerText,
    },
    {
      id: `${exam.id}-q2`,
      order: 2,
      prompt: secondQuestion.prompt,
      scoreLabel: "0/1 оноо",
      type: "choice",
      options: secondQuestion.options,
      selectedOptionId: "b",
    },
    {
      id: `${exam.id}-q3`,
      order: 3,
      prompt: thirdQuestion.prompt,
      scoreLabel: "0/1 оноо",
      type: "choice",
      options: thirdQuestion.options,
      selectedOptionId: "c",
    },
  ];

  const generatedQuestions = prompts.map((prompt, index) => {
    const order = index + 4;
    const options = choiceTemplates[index % choiceTemplates.length];
    const selectedOptionId = options[(index + 1) % options.length]?.id ?? "b";

    return {
      id: `${exam.id}-q${order}`,
      order,
      prompt,
      scoreLabel: order % 4 === 0 ? "1/1 оноо" : "0/1 оноо",
      type: "choice" as const,
      options: [...options],
      selectedOptionId,
    };
  });

  return [...baseQuestions, ...generatedQuestions];
}

function getSubjectDisplayLabel(exam: ExamCard) {
  if (exam.subject === "social") {
    return "Нийгэм";
  }

  return "Иргэний ёс зүй";
}

type TeacherExamDetailProps = {
  exam: ExamCard;
};

export function TeacherExamDetail({ exam }: TeacherExamDetailProps) {
  const [focusedQuestion, setFocusedQuestion] = useState(1);
  const questions = useMemo(() => buildExamDetailQuestions(exam), [exam]);

  const handleFocusQuestion = (order: number) => {
    setFocusedQuestion(order);

    const questionElement = document.getElementById(`teacher-exam-question-${order}`);
    questionElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const infoGroups = [
    [
      { label: "Хичээл", value: getSubjectDisplayLabel(exam), accent: true },
      { label: "Сэдэв", value: exam.topic },
      { label: "Анги", value: exam.grade },
    ],
    [
      { label: "Нийт даалгал", value: String(questions.length) },
      { label: "Оноо", value: String(exam.taskCount) },
    ],
    [{ label: "Хугацаа", value: String(exam.duration) }],
  ];

  return (
    <section className="space-y-6">
      <div>
        <Link
          href="/teacher/exams"
          className="inline-flex items-center gap-3 text-[18px] font-medium text-[#36313F] transition hover:text-[#7E66DC]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F0FA]">
            <ChevronLeft className="h-5 w-5" />
          </span>
          Буцах
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="self-start lg:sticky lg:top-28">
          <div className="space-y-4">
            <section className="rounded-[18px] border border-[#E8E2F1] bg-white p-5 shadow-[0_4px_12px_rgba(53,31,107,0.04)]">
              <div className="space-y-4">
                {infoGroups.map((group, groupIndex) => (
                  <div key={`info-group-${groupIndex}`}>
                    <div className="space-y-2.5">
                      {group.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-end justify-between gap-4 text-[15px] text-[#23202A]"
                        >
                          <span
                            className={
                              item.accent
                                ? "relative pb-1 font-semibold after:absolute after:bottom-0 after:left-0 after:h-[4px] after:w-full after:rounded-full after:bg-[#CFC5F8]"
                                : "font-medium"
                            }
                          >
                            {item.label}
                          </span>
                          <span className="text-right text-[15px]">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {groupIndex < infoGroups.length - 1 ? (
                      <div className="mt-4 h-px bg-[#ECE6F3]" />
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-5 text-[#7F7A89]">
                <Link
                  href={`/teacher/exams/${exam.id}/edit`}
                  className="transition hover:text-[#7E66DC]"
                  aria-label="Шалгалт засах"
                >
                  <PencilLine className="h-6 w-6" strokeWidth={1.9} />
                </Link>
                <button
                  type="button"
                  className="transition hover:text-[#DE5A52]"
                  aria-label="Шалгалт устгах"
                >
                  <Trash2 className="h-6 w-6" strokeWidth={1.9} />
                </button>
              </div>
            </section>

            <section className="rounded-[18px] border border-[#E8E2F1] bg-white p-5 shadow-[0_4px_12px_rgba(53,31,107,0.04)]">
              <p className="text-[17px] font-semibold text-[#23202A]">Асуулт</p>

              <div className="mt-4 grid grid-cols-5 gap-3">
                {questions.map((question) => (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => handleFocusQuestion(question.order)}
                    className={`flex h-11 w-11 items-center justify-center rounded-[10px] border text-[15px] font-medium transition ${
                      focusedQuestion === question.order
                        ? "border-[#9077F7] bg-[#F0EEFF] text-[#6F5DE2]"
                        : "border-[#E8E2F1] bg-white text-[#2A2732] hover:border-[#D6CFF3]"
                    }`}
                  >
                    {question.order}
                  </button>
                ))}

                <Link
                  href={`/teacher/exams/${exam.id}/edit`}
                  className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#E8E2F1] bg-white text-[#2A2732] transition hover:border-[#D6CFF3] hover:text-[#7E66DC]"
                  aria-label="Асуулт нэмэх"
                >
                  <Plus className="h-6 w-6" strokeWidth={1.8} />
                </Link>
              </div>
            </section>
          </div>
        </aside>

        <div className="space-y-4">
          {questions.map((question) => (
            <article
              key={question.id}
              id={`teacher-exam-question-${question.order}`}
              className="scroll-mt-24 rounded-[18px] border border-[#E8E2F1] bg-white p-5 shadow-[0_4px_12px_rgba(53,31,107,0.04)]"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[18px] font-semibold text-[#1F1B27]">
                  {question.order}. {question.prompt}
                </h2>
                <span className="shrink-0 pt-0.5 text-[15px] font-medium text-[#2C2933]">
                  {question.scoreLabel}
                </span>
              </div>

              {question.type === "text" ? (
                <div className="mt-5 rounded-[16px] border border-[#E8E2F1] bg-white px-4 py-4 text-[15px] leading-8 text-[#27242F]">
                  {question.answerText}
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {question.options?.map((option) => {
                    const isSelected = option.id === question.selectedOptionId;

                    return (
                      <div key={option.id} className="flex items-center gap-3.5">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white ${
                            isSelected
                              ? "border-[#8F76F6]"
                              : "border-[#BAB4C5]"
                          }`}
                        >
                          {isSelected ? (
                            <span className="h-4 w-4 rounded-full bg-[#8F76F6]" />
                          ) : null}
                        </span>

                        <div
                          className={`flex-1 rounded-[14px] border px-4 py-3.5 text-left ${
                            isSelected
                              ? "border-[#DDD5FF] bg-[#F0EEFF]"
                              : "border-[#E8E2F1] bg-white"
                          }`}
                        >
                          <span className="text-[15px] font-medium text-[#27242F]">
                            {option.label} {option.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 flex items-center gap-5 text-[#7F7A89]">
                <Link
                  href={`/teacher/exams/${exam.id}/edit`}
                  className="transition hover:text-[#7E66DC]"
                  aria-label={`${question.order}-р асуулт засах`}
                >
                  <PencilLine className="h-6 w-6" strokeWidth={1.9} />
                </Link>
                <button
                  type="button"
                  className="transition hover:text-[#DE5A52]"
                  aria-label={`${question.order}-р асуулт устгах`}
                >
                  <Trash2 className="h-6 w-6" strokeWidth={1.9} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
