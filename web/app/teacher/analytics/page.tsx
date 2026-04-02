"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { BarChart3, ChevronLeft, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  BarChart,
  type ChartData,
  type ChartOptions,
} from "@/components/charts/chart-kit";
import { getSubjectDisplayLabel } from "../_data/dashboard";

type TeacherAnalyticsExamRecord = {
  id: string;
  title: string;
  subject: string;
  openStatus: boolean;
  grade: string;
  duration: number;
  questionCount: number;
  classroomName: string | null;
  scheduledDate: string | null;
  startTime: string | null;
};

type TeacherAnalyticsExamsData = {
  teacherScheduledExams: TeacherAnalyticsExamRecord[];
};

type TeacherAnalyticsDetailData = {
  teacherExamAnalytics: {
    exam: {
      id: string;
      title: string;
      subject: string;
      grade: string;
      classroomName: string | null;
    };
    totalStudents: number;
    students: {
      id: string;
      percent: number;
    }[];
    questionInsights: {
      questionId: string;
      order: number;
      type: "mcq" | "open" | "short";
      wrongRate: number | null;
    }[];
  };
};

const GET_TEACHER_ANALYTICS_EXAMS = gql`
  query GetTeacherAnalyticsExams {
    teacherScheduledExams {
      id
      title
      subject
      openStatus
      grade
      duration
      questionCount
      classroomName
      scheduledDate
      startTime
    }
  }
`;

const GET_TEACHER_ANALYTICS_DETAIL = gql`
  query GetTeacherAnalyticsDetail($examId: String!) {
    teacherExamAnalytics(examId: $examId) {
      totalStudents
      exam {
        id
        title
        subject
        grade
        classroomName
      }
      students {
        id
        percent
      }
      questionInsights {
        questionId
        order
        type
        wrongRate
      }
    }
  }
`;

function isCompletedExam(exam: TeacherAnalyticsExamRecord) {
  if (!exam.openStatus) {
    return true;
  }

  if (!exam.scheduledDate || !exam.startTime) {
    return false;
  }

  const scheduledAt = new Date(`${exam.scheduledDate}T${exam.startTime}`);

  if (Number.isNaN(scheduledAt.getTime())) {
    return false;
  }

  const endAt = scheduledAt.getTime() + exam.duration * 60 * 1000;
  return endAt <= Date.now();
}

function getCompletedExamSortValue(exam: TeacherAnalyticsExamRecord) {
  if (!exam.scheduledDate || !exam.startTime) {
    return 0;
  }

  const scheduledAt = new Date(`${exam.scheduledDate}T${exam.startTime}`);
  return Number.isNaN(scheduledAt.getTime()) ? 0 : scheduledAt.getTime();
}

function parseClassroomMeta(
  classroomName: string | null | undefined,
  gradeFallback: string,
) {
  const normalized = classroomName?.trim() ?? "";
  const [classroomKey] = normalized.split(" - ");
  const match = classroomKey?.match(/^(\d{1,2})(.*)$/);
  const group = match?.[2]?.trim() || "-";

  return {
    grade: gradeFallback,
    group,
  };
}

const chartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "#2C2638",
      displayColors: false,
      padding: 12,
      callbacks: {
        label: (context) => `${context.parsed.y}% алдаа`,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      ticks: {
        color: "#8A8397",
        font: {
          size: 12,
        },
      },
    },
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        stepSize: 20,
        color: "#8A8397",
        font: {
          size: 12,
        },
      },
      grid: {
        color: "#EEEAF7",
      },
      border: {
        display: false,
      },
    },
  },
};

export default function TeacherAnalyticsPage() {
  const { data, loading, error } = useQuery<TeacherAnalyticsExamsData>(
    GET_TEACHER_ANALYTICS_EXAMS,
    {
      fetchPolicy: "network-only",
    },
  );

  const completedExams = useMemo(
    () =>
      [...(data?.teacherScheduledExams ?? [])]
        .filter(isCompletedExam)
        .sort(
          (left, right) =>
            getCompletedExamSortValue(right) - getCompletedExamSortValue(left),
        ),
    [data],
  );

  const selectedExamSummary = completedExams[0] ?? null;

  const {
    data: detailData,
    loading: detailLoading,
    error: detailError,
  } = useQuery<TeacherAnalyticsDetailData>(GET_TEACHER_ANALYTICS_DETAIL, {
    variables: { examId: selectedExamSummary?.id ?? "" },
    skip: !selectedExamSummary?.id,
  });

  const analytics = detailData?.teacherExamAnalytics ?? null;
  const averagePercent = useMemo(() => {
    const students = analytics?.students ?? [];
    if (!students.length) {
      return 0;
    }

    const total = students.reduce((sum, student) => sum + student.percent, 0);
    return Math.round(total / students.length);
  }, [analytics?.students]);

  const chartPoints = useMemo(
    () =>
      [...(analytics?.questionInsights ?? [])]
        .filter((item) => item.type === "mcq")
        .sort((left, right) => (right.wrongRate ?? 0) - (left.wrongRate ?? 0))
        .slice(0, 8)
        .sort((left, right) => (left.wrongRate ?? 0) - (right.wrongRate ?? 0)),
    [analytics?.questionInsights],
  );

  const chartData = useMemo<ChartData<"bar">>(
    () => ({
      labels: chartPoints.map((item) => String(item.order)),
      datasets: [
        {
          data: chartPoints.map((item) => item.wrongRate ?? 0),
          backgroundColor: "rgba(216, 202, 251, 0.88)",
          borderRadius: 0,
          borderSkipped: false,
          maxBarThickness: 32,
          categoryPercentage: 0.78,
          barPercentage: 0.84,
        },
      ],
    }),
    [chartPoints],
  );

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-[#6F687D]">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        Analytics ачаалж байна...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[20px] border border-[#F0C2BD] bg-[#FFF4F2] px-5 py-4 text-[#B63B3B]">
        {error.message}
      </div>
    );
  }

  if (!completedExams.length) {
    return (
      <div className="rounded-[20px] border border-[#E8E2F1] bg-white px-6 py-8 text-[15px] text-[#6F687D]">
        Дууссан шалгалт одоогоор алга байна.
      </div>
    );
  }

  const examMeta = selectedExamSummary
    ? parseClassroomMeta(
        selectedExamSummary.classroomName,
        selectedExamSummary.grade,
      )
    : { grade: "-", group: "-" };

  return (
    <section className="max-w-[1128px]">
      <Link
        href="/teacher/dashboard"
        className="inline-flex items-center gap-3 text-[18px] h-[112px] font-medium text-[#36313F] transition hover:text-[#7E66DC]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F0FA]">
          <ChevronLeft className="h-5 w-5" />
        </span>
        <span>Буцах</span>
      </Link>

      <div className="grid gap-5 xl:grid-cols-[210px_minmax(0,1fr)]">
        <aside className="self-start">
          <section className="rounded-[16px] border border-[#E8E2F1] bg-white p-4 shadow-[0_4px_12px_rgba(53,31,107,0.04)]">
            <div className="space-y-3">
              <div className="border-l-4 border-[#D8CCFB] pl-2">
                <h2 className="text-[17px] font-semibold text-[#2B2633]">
                  {selectedExamSummary
                    ? getSubjectDisplayLabel(selectedExamSummary.subject)
                    : "-"}
                </h2>
              </div>

              <div className="space-y-2 text-[15px] text-[#3A3645]">
                <p>{examMeta.grade}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[#5E586D]">Бүлэг</span>
                  <span className="font-medium">{examMeta.group}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#5E586D]">Сэдэв</span>
                  <span className="font-medium">
                    {selectedExamSummary?.title ?? "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="my-4 h-px bg-[#ECE6F3]" />

            <div className="flex items-center justify-between text-[15px] text-[#413B50]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#8B819F]" />
                <span>{analytics?.totalStudents ?? 0}</span>
              </div>

              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#8B819F]" />
                <span>{averagePercent}%</span>
              </div>
            </div>
          </section>
        </aside>

        <section className="rounded-[16px] border border-[#E8E2F1] bg-white px-6 py-6 shadow-[0_4px_12px_rgba(53,31,107,0.04)]">
          <div className="space-y-1">
            <h1 className="text-[18px] font-semibold text-[#1D1A24]">
              Хамгийн их алддаг асуултууд
            </h1>
            <p className="text-[14px] text-[#8A8397]">
              Алдааны давтамж өндөртэй
            </p>
          </div>

          <div className="mt-5 border-t border-[#ECE6F3] pt-5">
            {detailLoading ? (
              <div className="flex h-[300px] items-center justify-center text-[#6F687D]">
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Chart ачаалж байна...
              </div>
            ) : detailError ? (
              <div className="rounded-[16px] border border-[#F0C2BD] bg-[#FFF4F2] px-4 py-3 text-[#B63B3B]">
                {detailError.message}
              </div>
            ) : chartPoints.length > 0 ? (
              <>
                <BarChart
                  data={chartData}
                  options={chartOptions}
                  className="h-[270px]"
                />
                <div className="mt-2 flex justify-end text-[14px] text-[#8A8397]">
                  Асуултууд
                </div>
              </>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-[#6F687D]">
                Auto-graded analytics хараахан алга байна.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
