import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { FullScreenLoader } from "@/components/FullScreenLoader";
import { MathText } from "@/components/MathText";
import { StatusCard } from "@/components/StatusCard";
import { useAppData } from "@/data/app-data";
import type { SubmissionAnswer } from "@/data/types";
import { colors, fonts, shadows } from "@/lib/theme";
import { formatScheduledTime } from "@/lib/student-exam";

function addMinutes(startTime: string, duration: number) {
  const match = startTime.match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return "Тодорхойгүй";
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const totalMinutes = hours * 60 + minutes + duration;
  const nextHours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const nextMinutes = totalMinutes % 60;

  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
}

function getGradeLabel(grade: string) {
  const gradeNumber = grade.match(/\d+/)?.[0];
  return gradeNumber ? `${gradeNumber}A` : grade;
}

function getChoiceTone(answer: SubmissionAnswer, optionId: string) {
  if (answer.correctChoiceId === optionId) {
    return "correct" as const;
  }

  if (answer.selectedChoiceId === optionId) {
    return "wrong" as const;
  }

  return "neutral" as const;
}

function getExplanationText(answer: SubmissionAnswer) {
  if (answer.aiExplanation?.trim()) {
    return answer.aiExplanation.trim();
  }

  if (answer.correctAnswerText?.trim()) {
    return answer.correctAnswerText.trim();
  }

  const correctChoice = answer.choices.find(
    (choice) => choice.id === answer.correctChoiceId,
  );
  return correctChoice ? `Зөв хариулт: ${correctChoice.text}` : null;
}

function getQuestionScoreLabel(answer: SubmissionAnswer) {
  if (answer.isCorrect === true) {
    return "1 оноо";
  }

  if (answer.isCorrect === false) {
    return "0 оноо";
  }

  return "1 оноо";
}

function PercentRing({ percent }: { percent: number }) {
  const safePercent = Math.max(0, Math.min(100, percent));
  const radius = 15.915;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - safePercent / 100);

  return (
    <View style={styles.scoreRing}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 36 36"
        style={styles.scoreRingSvg}
      >
        <Circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#ECE7FB"
          strokeWidth="3"
        />
        <Circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#B8A6F6"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 18 18)"
        />
      </Svg>
      <View style={styles.scoreRingInner}>
        <Text style={styles.scoreRingText}>{safePercent}%</Text>
      </View>
    </View>
  );
}

export default function ResultDetailScreen() {
  const params = useLocalSearchParams<{ submissionId: string }>();
  const submissionId =
    typeof params.submissionId === "string" ? params.submissionId : "";
  const { ensureSubmissionLoaded, getSubmissionById, student } = useAppData();
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const detail = getSubmissionById(submissionId);

  useEffect(() => {
    if (!submissionId || !detail || detail.answers.length > 0) {
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError("");

    void ensureSubmissionLoaded(submissionId)
      .catch((caughtError) => {
        if (!cancelled) {
          setLoadError(
            caughtError instanceof Error
              ? caughtError.message
              : "Задлан мэдээллийг ачаалж чадсангүй.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [detail, ensureSubmissionLoaded, submissionId]);

  const startTime = useMemo(
    () => (detail ? formatScheduledTime(detail.startTime) : "Тодорхойгүй"),
    [detail],
  );
  const endTime = useMemo(
    () => (detail ? addMinutes(startTime, detail.duration) : "Тодорхойгүй"),
    [detail, startTime],
  );
  const gradeLabel = useMemo(
    () => (detail ? getGradeLabel(detail.grade) : ""),
    [detail],
  );

  if (detail && detail.answers.length === 0 && isLoading) {
    return <FullScreenLoader label="Задлан мэдээллийг ачаалж байна..." />;
  }

  if (!detail) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
        <View style={styles.content}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <View style={styles.backIconWrap}>
              <Ionicons
                name="chevron-back"
                size={26}
                color={colors.textPrimary}
              />
            </View>
            <Text style={styles.backText}>Буцах</Text>
          </Pressable>
          <StatusCard
            tone="error"
            message={loadError || "Задлан харах мэдээлэл олдсонгүй."}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <View style={styles.backIconWrap}>
            <Ionicons
              name="chevron-back"
              size={26}
              color={colors.textPrimary}
            />
          </View>
          <Text style={styles.backText}>Буцах</Text>
        </Pressable>

        {loadError ? <StatusCard tone="warning" message={loadError} /> : null}

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text numberOfLines={1} style={styles.summaryName}>
              {student.fullName}
            </Text>
            <Text style={styles.summaryGrade}>{gradeLabel}</Text>
          </View>

          <View style={styles.summaryTimeRow}>
            <View style={styles.summaryTimeBlock}>
              <View style={styles.summaryAccent} />
              <View>
                <Text style={styles.summaryLabel}>Эхэлсэн</Text>
                <Text style={styles.summaryValue}>{startTime}</Text>
              </View>
            </View>

            <View style={styles.summaryTimeBlock}>
              <View style={styles.summaryAccent} />
              <View>
                <Text style={styles.summaryLabel}>Дууссан</Text>
                <Text style={styles.summaryValue}>{endTime}</Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryFooter}>
            <View>
              <Text style={styles.totalLabel}>Нийт оноо</Text>
              <Text style={styles.totalValue}>
                {detail.correctAnswers}
                <Text style={styles.totalValueMuted}>
                  /{detail.questionCount}
                </Text>
              </Text>
            </View>

            <PercentRing percent={detail.scorePercent} />
          </View>
        </View>

        <View style={styles.questionList}>
          {detail.answers.map((answer) => {
            const explanationText = getExplanationText(answer);

            return (
              <View key={answer.questionId} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionIndex}>
                    Асуулт {answer.order}
                  </Text>
                  <Text style={styles.questionPoints}>
                    {getQuestionScoreLabel(answer)}
                  </Text>
                </View>

                <MathText
                  value={answer.question}
                  style={styles.questionTitle}
                />

                <View style={styles.choiceList}>
                  {answer.choices.map((choice) => {
                    const tone = getChoiceTone(answer, choice.id);

                    return (
                      <View
                        key={choice.id}
                        style={[
                          styles.choiceRow,
                          tone === "correct"
                            ? styles.choiceCorrect
                            : tone === "wrong"
                              ? styles.choiceWrong
                              : null,
                        ]}
                      >
                        <MathText
                          value={`${choice.label}. ${choice.text}`}
                          style={styles.choiceText}
                        />
                      </View>
                    );
                  })}
                </View>

                {answer.isCorrect === false && explanationText ? (
                  <View style={styles.explanationBox}>
                    <MathText
                      value={explanationText}
                      style={styles.explanationText}
                    />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 44,
  },
  backButton: {
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    alignSelf: "flex-start",
  },
  backIconWrap: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#F5F3F7",
  },
  backText: {
    fontFamily: fonts.display.medium,
    fontSize: 18,
    color: colors.textPrimary,
  },
  summaryCard: {
    height: 220,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#E8E4F3",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 24,
    ...shadows.card,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  summaryName: {
    flex: 1,
    fontFamily: fonts.display.semibold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  summaryGrade: {
    fontFamily: fonts.display.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  summaryTimeRow: {
    marginTop: 28,
    flexDirection: "row",
    gap: 26,
  },
  summaryTimeBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  summaryAccent: {
    height: 45,
    width: 2,
    borderRadius: 999,
    backgroundColor: "#CDC2F2",
  },
  summaryLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: "#9C98A6",
  },
  summaryValue: {
    marginTop: 6,
    fontFamily: fonts.sans.medium,
    fontSize: 16,
    color: colors.textPrimary,
  },
  summaryFooter: {
    marginTop: 26,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  totalValue: {
    marginTop: 8,
    fontFamily: fonts.display.semibold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  totalValueMuted: {
    color: "#8D8A98",
  },
  scoreRing: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  scoreRingSvg: {
    position: "absolute",
    inset: 0,
  },
  scoreRingInner: {
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
  },
  scoreRingText: {
    fontFamily: fonts.display.semibold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  questionList: {
    marginTop: 22,
    gap: 16,
  },
  questionCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#E8E4F3",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    ...shadows.card,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  questionIndex: {
    fontFamily: fonts.sans.regular,
    fontSize: 18,
    color: "#6D6978",
  },
  questionPoints: {
    fontFamily: fonts.sans.regular,
    fontSize: 18,
    color: "#6D6978",
  },
  questionTitle: {
    marginTop: 18,
    fontFamily: fonts.display.semibold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  choiceList: {
    marginTop: 18,
    gap: 12,
  },
  choiceRow: {
    minHeight: 46,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E9E4F6",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
  },
  choiceCorrect: {
    borderColor: "#CBEBCF",
    backgroundColor: "#DFF6E0",
  },
  choiceWrong: {
    borderColor: "#F0D5D8",
    backgroundColor: "#F8E3E4",
  },
  choiceText: {
    fontFamily: fonts.sans.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  explanationBox: {
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#5AB866",
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  explanationText: {
    fontFamily: fonts.sans.regular,
    fontSize: 16,
    lineHeight: 24,
    color: "#2F2B39",
  },
});
