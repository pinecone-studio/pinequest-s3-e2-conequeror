"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  ChevronDown,
  ChevronLeft,
  CircleDot,
  PencilLine,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type QuestionType = "mcq" | "open" | "short";

type ChoiceDraft = {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
};

type QuestionDraft = {
  id: string;
  question: string;
  type: QuestionType;
  topic: string;
  difficulty: string;
  imageUrl: string;
  videoUrl: string;
  points: number;
  choices: ChoiceDraft[];
};

type ExamByIdData = {
  examById: {
    id: string;
    title: string;
    subject: string;
    description: string | null;
    duration: number;
    grade: string;
  };
};

type CreateQuestionWithChoicesData = {
  createQuestionWithChoices: {
    id: string;
  };
};

const GET_EXAM_BY_ID = gql`
  query ExamById($examId: String!) {
    examById(examId: $examId) {
      id
      title
      subject
      description
      duration
      grade
    }
  }
`;

const CREATE_QUESTION_WITH_CHOICES = gql`
  mutation CreateQuestionWithChoices($input: createQuestionInput!) {
    createQuestionWithChoices(input: $input) {
      id
    }
  }
`;

const typeOptions: { value: QuestionType; label: string }[] = [
  { value: "mcq", label: "Сонголт" },
  { value: "open", label: "Нээлттэй" },
  { value: "short", label: "Богино" },
];

const fieldClassName =
  "h-[56px] w-full rounded-[18px] border border-[#E8E2F1] bg-white px-4 text-[18px] text-[#1A1623] outline-none transition placeholder:text-[#8E8A94] focus:border-[#B59AF8] focus:ring-4 focus:ring-[#B59AF8]/15";

function createChoice(label: string): ChoiceDraft {
  return {
    id: crypto.randomUUID(),
    label,
    text: "",
    isCorrect: label === "A",
  };
}

function createQuestionDraft(): QuestionDraft {
  return {
    id: crypto.randomUUID(),
    question: "",
    type: "mcq",
    topic: "",
    difficulty: "",
    imageUrl: "",
    videoUrl: "",
    points: 1,
    choices: ["A", "B"].map(createChoice),
  };
}

function normalizeQuestionChoices(choices: ChoiceDraft[]) {
  return choices.map((choice, index) => ({
    ...choice,
    label: String.fromCharCode(65 + index),
  }));
}

function getSubjectLabel(subject: string) {
  if (subject === "social") {
    return "Нийгэм";
  }

  if (subject === "civics") {
    return "Иргэний боловсрол";
  }

  return subject;
}

export default function TeacherExamEditPage() {
  const params = useParams<{ examId: string }>();
  const examId = Array.isArray(params.examId) ? params.examId[0] : params.examId;
  const router = useRouter();

  const [questions, setQuestions] = useState<QuestionDraft[]>([
    createQuestionDraft(),
  ]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const { data: examData, loading: examLoading, error: examError } =
    useQuery<ExamByIdData>(GET_EXAM_BY_ID, {
      variables: { examId },
      skip: !examId,
    });

  const [createQuestionWithChoices, { loading: saveLoading }] =
    useMutation<CreateQuestionWithChoicesData>(CREATE_QUESTION_WITH_CHOICES);

  const activeQuestion = useMemo(() => {
    const fallback = questions[0] ?? null;
    const resolvedId = activeQuestionId ?? fallback?.id ?? null;

    if (!resolvedId) {
      return null;
    }

    return questions.find((question) => question.id === resolvedId) ?? fallback;
  }, [activeQuestionId, questions]);

  const activeQuestionIndex = useMemo(() => {
    if (!activeQuestion) {
      return -1;
    }

    return questions.findIndex((question) => question.id === activeQuestion.id);
  }, [activeQuestion, questions]);

  const totalPoints = useMemo(() => {
    return questions.reduce((sum, question) => sum + question.points, 0);
  }, [questions]);

  const updateActiveQuestion = (
    updater: (question: QuestionDraft) => QuestionDraft,
  ) => {
    if (!activeQuestion) {
      return;
    }

    setQuestions((current) =>
      current.map((question) =>
        question.id === activeQuestion.id ? updater(question) : question,
      ),
    );
  };

  const addQuestion = () => {
    const nextQuestion = createQuestionDraft();
    setQuestions((current) => [...current, nextQuestion]);
    setActiveQuestionId(nextQuestion.id);
    setStatusMessage("");
  };

  const deleteActiveQuestion = () => {
    if (!activeQuestion || questions.length === 1) {
      return;
    }

    const nextQuestions = questions.filter(
      (question) => question.id !== activeQuestion.id,
    );
    const nextActive =
      nextQuestions[activeQuestionIndex - 1] ?? nextQuestions[0] ?? null;

    setQuestions(nextQuestions);
    setActiveQuestionId(nextActive?.id ?? null);
    setStatusMessage("");
  };

  const addChoice = () => {
    updateActiveQuestion((question) => ({
      ...question,
      choices: [
        ...normalizeQuestionChoices(question.choices),
        createChoice(String.fromCharCode(65 + question.choices.length)),
      ],
    }));
  };

  const removeChoice = (choiceId: string) => {
    updateActiveQuestion((question) => {
      if (question.choices.length <= 2) {
        return question;
      }

      const nextChoices = normalizeQuestionChoices(
        question.choices.filter((choice) => choice.id !== choiceId),
      );
      const hasCorrect = nextChoices.some((choice) => choice.isCorrect);

      return {
        ...question,
        choices: hasCorrect
          ? nextChoices
          : nextChoices.map((choice, index) => ({
              ...choice,
              isCorrect: index === 0,
            })),
      };
    });
  };

  const handleSave = async () => {
    if (!examId) {
      setStatusMessage("Шалгалтын ID олдсонгүй.");
      return;
    }

    for (const [index, question] of questions.entries()) {
      if (!question.question.trim()) {
        setStatusMessage(`${index + 1}-р асуулт хоосон байна.`);
        return;
      }

      if (
        question.type === "mcq" &&
        (!question.choices.length ||
          question.choices.some((choice) => !choice.text.trim()) ||
          !question.choices.some((choice) => choice.isCorrect))
      ) {
        setStatusMessage(
          `${index + 1}-р асуултын хариултуудыг бөглөж, зөв хариултыг сонгоно уу.`,
        );
        return;
      }
    }

    try {
      setStatusMessage("Асуултууд хадгалж байна...");

      for (const [index, question] of questions.entries()) {
        await createQuestionWithChoices({
          variables: {
            input: {
              examId,
              indexOnExam: index + 1,
              question: question.question.trim(),
              type: question.type,
              topic: question.topic?.trim() || null,
              difficulty: question.difficulty?.trim() || null,
              imageUrl: question.imageUrl?.trim() || null,
              videoUrl: question.videoUrl?.trim() || null,
              choices:
                question.type === "mcq"
                  ? normalizeQuestionChoices(question.choices).map((choice) => ({
                      id: choice.id,
                      label: choice.label,
                      text: choice.text.trim(),
                      isCorrect: choice.isCorrect,
                    }))
                  : [],
            },
          },
        });
      }

      setStatusMessage("Асуултууд хадгалагдлаа.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Асуултууд хадгалахад алдаа гарлаа.",
      );
    }
  };

  if (examLoading) {
    return <main className="p-8 text-sm text-[#6F687D]">Уншиж байна...</main>;
  }

  if (examError || !examData?.examById) {
    return (
      <main className="p-8 text-sm text-red-600">
        {examError?.message ?? "Шалгалт ачаалж чадсангүй."}
      </main>
    );
  }

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
                <div className="space-y-2.5">
                  <div className="flex items-end justify-between gap-4 text-[15px] text-[#23202A]">
                    <span className="relative pb-1 font-semibold after:absolute after:bottom-0 after:left-0 after:h-[4px] after:w-full after:rounded-full after:bg-[#CFC5F8]">
                      Хичээл
                    </span>
                    <span className="text-right text-[15px]">
                      {getSubjectLabel(examData.examById.subject)}
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-4 text-[15px] text-[#23202A]">
                    <span className="font-medium">Сэдэв</span>
                    <span className="text-right text-[15px]">
                      {examData.examById.title}
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-4 text-[15px] text-[#23202A]">
                    <span className="font-medium">Анги</span>
                    <span className="text-right text-[15px]">
                      {examData.examById.grade}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-[#ECE6F3]" />

                <div className="space-y-2.5">
                  <div className="flex items-end justify-between gap-4 text-[15px] text-[#23202A]">
                    <span className="font-medium">Хугацаа</span>
                    <span className="text-right text-[15px]">
                      {examData.examById.duration}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-[#ECE6F3]" />

                <div className="space-y-2.5">
                  <div className="flex items-end justify-between gap-4 text-[15px] text-[#23202A]">
                    <span className="font-semibold">Нийт даалгал</span>
                    <span className="text-right text-[15px]">
                      {questions.length}
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-4 text-[15px] text-[#23202A]">
                    <span className="font-semibold">Оноо</span>
                    <span className="text-right text-[15px]">{totalPoints}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-5 text-[#7F7A89]">
                <button
                  type="button"
                  className="transition hover:text-[#7E66DC]"
                  aria-label="Шалгалтын мэдээлэл засах"
                >
                  <PencilLine className="h-6 w-6" strokeWidth={1.9} />
                </button>
                <button
                  type="button"
                  onClick={deleteActiveQuestion}
                  className="transition hover:text-[#DE5A52]"
                  aria-label="Сонгосон асуулт устгах"
                >
                  <Trash2 className="h-6 w-6" strokeWidth={1.9} />
                </button>
              </div>
            </section>

            <section className="rounded-[18px] border border-[#E8E2F1] bg-white p-5 shadow-[0_4px_12px_rgba(53,31,107,0.04)]">
              <p className="text-[17px] font-semibold text-[#23202A]">Асуулт</p>

              <div className="mt-4 grid grid-cols-5 gap-3">
                {questions.map((question, index) => {
                  const isActive = question.id === activeQuestion?.id;

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => setActiveQuestionId(question.id)}
                      className={`flex h-11 w-11 items-center justify-center rounded-[10px] border text-[15px] font-medium transition ${
                        isActive
                          ? "border-[#9077F7] bg-[#F0EEFF] text-[#6F5DE2]"
                          : "border-[#E8E2F1] bg-white text-[#2A2732] hover:border-[#D6CFF3]"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#E8E2F1] bg-white text-[#2A2732] transition hover:border-[#D6CFF3] hover:text-[#7E66DC]"
                  aria-label="Асуулт нэмэх"
                >
                  <Plus className="h-6 w-6" strokeWidth={1.8} />
                </button>
              </div>
            </section>
          </div>
        </aside>

        <section className="rounded-[18px] border border-[#E8E2F1] bg-white p-6 shadow-[0_4px_12px_rgba(53,31,107,0.04)]">
          {activeQuestion ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <h1 className="text-[18px] font-semibold text-[#1F1B27]">
                  Асуулт {activeQuestionIndex + 1}
                </h1>

                <div className="flex items-center gap-4 text-[#6F687D]">
                  {activeQuestion.type === "mcq" ? (
                    <button
                      type="button"
                      onClick={addChoice}
                      className="transition hover:text-[#7E66DC]"
                      aria-label="Хариулт нэмэх"
                    >
                      <Plus className="h-6 w-6" />
                    </button>
                  ) : null}

                  <div className="relative min-w-[190px]">
                    <CircleDot className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6F687D]" />
                    <select
                      value={activeQuestion.type}
                      onChange={(event) =>
                        updateActiveQuestion((question) => ({
                          ...question,
                          type: event.target.value as QuestionType,
                        }))
                      }
                      className="h-[54px] w-full appearance-none rounded-[16px] border border-[#E8E2F1] bg-white pl-11 pr-10 text-[18px] text-[#1A1623] outline-none transition focus:border-[#B59AF8] focus:ring-4 focus:ring-[#B59AF8]/15"
                    >
                      {typeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6F687D]" />
                  </div>
                </div>
              </div>

              <input
                value={activeQuestion.question}
                onChange={(event) =>
                  updateActiveQuestion((question) => ({
                    ...question,
                    question: event.target.value,
                  }))
                }
                placeholder="Асуултаа бичнэ үү..."
                className="w-full border-0 border-b border-[#E8E2F1] bg-transparent px-0 pb-4 text-[18px] text-[#1A1623] outline-none placeholder:text-[#8E8A94]"
              />

              {activeQuestion.type === "mcq" ? (
                <div className="space-y-4">
                  {normalizeQuestionChoices(activeQuestion.choices).map(
                    (choice, index) => (
                      <div key={choice.id} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateActiveQuestion((question) => ({
                              ...question,
                              choices: normalizeQuestionChoices(
                                question.choices.map((item) => ({
                                  ...item,
                                  isCorrect: item.id === choice.id,
                                })),
                              ),
                            }))
                          }
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-white transition ${
                            choice.isCorrect
                              ? "border-[#8F76F6]"
                              : "border-[#BAB4C5] hover:border-[#8F76F6]"
                          }`}
                          aria-label={`${choice.label} зөв хариулт болгох`}
                        >
                          {choice.isCorrect ? (
                            <span className="h-4 w-4 rounded-full bg-[#8F76F6]" />
                          ) : null}
                        </button>

                        <input
                          value={choice.text}
                          onChange={(event) =>
                            updateActiveQuestion((question) => ({
                              ...question,
                              choices: normalizeQuestionChoices(
                                question.choices.map((item) =>
                                  item.id === choice.id
                                    ? { ...item, text: event.target.value }
                                    : item,
                                ),
                              ),
                            }))
                          }
                          placeholder={
                            index === 1
                              ? "Хариулт нэмэх"
                              : `${choice.label} Хариулт`
                          }
                          className="h-[56px] flex-1 rounded-[16px] border border-[#E8E2F1] bg-white px-4 text-[18px] text-[#1A1623] outline-none transition placeholder:text-[#8E8A94] focus:border-[#B59AF8] focus:ring-4 focus:ring-[#B59AF8]/15"
                        />

                        {index === 0 ? (
                          <button
                            type="button"
                            onClick={addChoice}
                            className="transition hover:text-[#7E66DC]"
                            aria-label="Хариулт нэмэх"
                          >
                            <Plus className="h-6 w-6 text-[#6F687D]" />
                          </button>
                        ) : (
                          <span className="w-6" />
                        )}

                        {activeQuestion.choices.length > 2 ? (
                          <button
                            type="button"
                            onClick={() => removeChoice(choice.id)}
                            className="transition hover:text-[#DE5A52]"
                            aria-label={`${choice.label} хариулт устгах`}
                          >
                            <Trash2 className="h-6 w-6 text-[#6F687D]" />
                          </button>
                        ) : (
                          <span className="w-6" />
                        )}
                      </div>
                    ),
                  )}

                  <p className="text-[14px] text-[#6F687D]">
                    Зөв хариултын өмнөх тойргийг сонгоно уу
                  </p>
                </div>
              ) : (
                <div className="rounded-[16px] border border-dashed border-[#D9D0EE] bg-[#FBFAFE] px-4 py-5 text-[15px] text-[#6F687D]">
                  {activeQuestion.type === "open"
                    ? "Нээлттэй асуултад урьдчилсан сонголт шаардахгүй."
                    : "Богино хариултын асуултад сонголт оруулах шаардлагагүй."}
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[18px] font-semibold text-[#111111]">
                  Оноо
                </label>
                <input
                  type="number"
                  min={1}
                  value={activeQuestion.points}
                  onChange={(event) =>
                    updateActiveQuestion((question) => ({
                      ...question,
                      points: Math.max(Number(event.target.value) || 1, 1),
                    }))
                  }
                  className={fieldClassName}
                />
              </div>

              {statusMessage ? (
                <p className="text-[14px] text-[#6F687D]">{statusMessage}</p>
              ) : null}

              <div className="flex items-center justify-end gap-6 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/teacher/exams")}
                  className="text-[20px] font-medium text-[#111111] transition hover:text-[#7E66DC]"
                >
                  Цуцлах
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="inline-flex h-14 items-center justify-center rounded-[22px] bg-[#B7A3F7] px-8 text-[18px] font-semibold text-white shadow-[inset_0_-5px_0_rgba(126,102,220,0.28),0_12px_22px_rgba(183,163,247,0.24)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saveLoading ? "Хадгалж байна..." : "Хадгалах"}
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
