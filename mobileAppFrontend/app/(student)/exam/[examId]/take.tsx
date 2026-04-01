import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppData } from "@/data/app-data";
import { MathText } from "@/components/MathText";
import { SecurityOverlay } from "@/components/SecurityOverlay";
import { SecureText } from "@/components/SecureText";
import { FullScreenLoader } from "@/components/FullScreenLoader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StatusCard } from "@/components/StatusCard";
import { clearExamDraft, getExamDraft, saveExamDraft } from "@/lib/exam-draft";
import { colors, fonts, shadows } from "@/lib/theme";
import type { StudentAnswerDraft } from "@/lib/student-types";
import { formatCountdown } from "@/lib/student-exam";
import { shuffleQuestionsForUser } from "@/security/question-order";
import { useExamIntegrity } from "@/security/useExamIntegrity";

function getRemainingSeconds(durationMinutes: number, startedAt: number) {
  const expiresAt = startedAt + durationMinutes * 60 * 1000;
  return Math.max(Math.floor((expiresAt - Date.now()) / 1000), 0);
}

export default function TakeExamScreen() {
  const params = useLocalSearchParams<{ examId: string }>();
  const examId = typeof params.examId === "string" ? params.examId : "";
  const { ensureExamLoaded, getExamById, submitExam, student } = useAppData();
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswerDraft>>({});
  const [submitError, setSubmitError] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isExamLoading, setIsExamLoading] = useState(false);
  const [examLoadError, setExamLoadError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const autoSubmittedRef = useRef(false);
  const answersRef = useRef<Record<string, StudentAnswerDraft>>({});
  const startedAtRef = useRef<number | null>(null);
  const submitExamRef = useRef<
    (source: "manual" | "auto" | "background" | "session_replaced") => Promise<void>
  >(async () => {});
  const exam = getExamById(examId);

  const shuffledQuestions = useMemo(
    () => (exam ? shuffleQuestionsForUser(exam.questions, student.email, exam.id) : []),
    [exam, student.email],
  );

  const answeredCount = useMemo(
    () => shuffledQuestions.filter((question) => Boolean(answers[question.id]?.selectedChoiceId)).length,
    [answers, shuffledQuestions],
  );

  useKeepAwake();

  const {
    leaveCount,
    screenshotCount,
    recordingCount,
    violationCount,
    warningMessage,
    recordingBlurActive,
    faceStatus,
    nativeMonitoringAvailable,
  } = useExamIntegrity({
    userId: student.id,
    examId,
    onAutoSubmit: async (reason) => {
      await submitExamRef.current(
        reason === "timer" ? "auto" : reason === "session_replaced" ? "session_replaced" : "background",
      );
    },
  });

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    startedAtRef.current = startedAt;
  }, [startedAt]);

  useEffect(() => {
    if (!exam || exam.questions.length > 0 || exam.questionCount === 0) {
      return;
    }

    let cancelled = false;
    setIsExamLoading(true);
    setExamLoadError("");

    void ensureExamLoaded(exam.id)
      .catch((caughtError) => {
        if (!cancelled) {
          setExamLoadError(
            caughtError instanceof Error ? caughtError.message : "Шалгалтын асуултыг ачаалж чадсангүй.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsExamLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ensureExamLoaded, exam]);

  useEffect(() => {
    if (!exam || exam.questions.length === 0 && exam.questionCount > 0) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsRestoring(true);
      autoSubmittedRef.current = false;

      const draft = await getExamDraft(exam.id);
      const restoredStartedAt = draft?.startedAt && draft.startedAt > 0 ? draft.startedAt : Date.now();

      if (!cancelled) {
        setAnswers(draft?.answers ?? {});
        setStartedAt(restoredStartedAt);
        setSecondsLeft(getRemainingSeconds(exam.duration, restoredStartedAt));
        setIsRestoring(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [exam, shuffledQuestions.length]);

  useEffect(() => {
    if (!exam || !startedAt || isRestoring) {
      return;
    }

    const syncTimer = () => {
      setSecondsLeft(getRemainingSeconds(exam.duration, startedAt));
    };

    syncTimer();
    const timer = setInterval(syncTimer, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [exam, isRestoring, startedAt]);

  useEffect(() => {
    if (!exam || !startedAt || isRestoring) {
      return;
    }

    const timeout = setTimeout(() => {
      void saveExamDraft(exam.id, {
        startedAt,
        answers,
      });
    }, 250);

    return () => {
      clearTimeout(timeout);
    };
  }, [answers, exam, isRestoring, startedAt]);

  submitExamRef.current = async (
    source: "manual" | "auto" | "background" | "session_replaced",
  ) => {
    if (!exam || !startedAtRef.current) {
      return;
    }

    setSubmitError("");
    setSubmitLoading(true);

    try {
      await submitExam({
        examId: exam.id,
        startedAt: startedAtRef.current,
        answers: exam.questions.map((question) => ({
          questionId: question.id,
          selectedChoiceId: answersRef.current[question.id]?.selectedChoiceId ?? null,
          answerText: null,
        })),
      });

      await clearExamDraft(exam.id);
      router.replace("/(student)/(tabs)/results");
    } catch (caughtError) {
      setSubmitError(
        caughtError instanceof Error
          ? caughtError.message
          : source === "session_replaced"
            ? "Өөр төхөөрөмжөөс шалгалтын төлөв солигдсон тул автоматаар илгээхэд алдаа гарлаа."
          : source === "background"
            ? "Та аппаас удаан гарсан тул автоматаар илгээхэд алдаа гарлаа."
            : source === "auto"
              ? "Хугацаа дууссан ч шалгалтыг автоматаар илгээж чадсангүй."
              : "Шалгалт илгээхэд алдаа гарлаа.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (!exam || !startedAt || isRestoring || secondsLeft > 0 || autoSubmittedRef.current) {
      return;
    }

    autoSubmittedRef.current = true;
    void submitExamRef.current("auto");
  }, [exam, isRestoring, secondsLeft, startedAt]);

  const handleSelectChoice = (questionId: string, optionId: string) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: {
        ...previous[questionId],
        selectedChoiceId: optionId,
      },
    }));
  };

  const handleSubmitPress = () => {
    const unansweredCount = shuffledQuestions.length - answeredCount;

    if (unansweredCount > 0) {
      Alert.alert(
        "Шалгалт илгээх үү?",
        `${unansweredCount} асуулт хариулаагүй байна. Одоо илгээх бол хоосон үлдсэн асуултууд буруу гэж тооцогдоно.`,
        [
          {
            text: "Болих",
            style: "cancel",
          },
          {
            text: "Илгээх",
            style: "destructive",
            onPress: () => {
              void submitExamRef.current("manual");
            },
          },
        ],
      );
      return;
    }

    void submitExamRef.current("manual");
  };

  if (isExamLoading || isRestoring) {
    return <FullScreenLoader label="Шалгалтын явцыг бэлдэж байна..." />;
  }

  if (examLoadError) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.content}>
          <StatusCard tone="error" message={examLoadError} />
        </View>
      </SafeAreaView>
    );
  }

  if (!exam || shuffledQuestions.length === 0) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.content}>
          <StatusCard tone="error" message="Шалгалтын мэдээлэл олдсонгүй." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      <Stack.Screen
        options={{
          gestureEnabled: false,
        }}
      />

      {recordingBlurActive || warningMessage ? (
        <SecurityOverlay
          blockInteraction={recordingBlurActive}
          blurred={recordingBlurActive}
          message={
            recordingBlurActive
              ? "Дэлгэц бичлэг эсвэл дэлгэц толиндуулалт илэрсэн тул нууц агуулгыг халхаллаа."
              : warningMessage
          }
        />
      ) : null}

      <View style={styles.header}>
        <View>
          <SecureText style={styles.headerEyebrow}>Хамгаалалттай шалгалт</SecureText>
          <SecureText style={styles.headerTitle}>Шалгалт явагдаж байна</SecureText>
        </View>
        <View style={[styles.timerChip, secondsLeft < 300 ? styles.timerChipDanger : null]}>
          <Ionicons
            name="time-outline"
            size={16}
            color={secondsLeft < 300 ? colors.dangerText : colors.textSecondary}
          />
          <SecureText style={[styles.timerText, secondsLeft < 300 ? styles.timerTextDanger : null]}>
            {formatCountdown(secondsLeft)}
          </SecureText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <MathText value={exam.title} style={styles.title} />
        <SecureText style={styles.subtitle}>
          Бүх асуулт нэг дор харагдана. Доош гүйлгээд хариулаад, дуусмагц шалгалтаа илгээнэ үү.
        </SecureText>

        <StatusCard
          tone="info"
          message={
            nativeMonitoringAvailable
              ? "Дэлгэцийн зураг, аппаас гарах, бичлэг, нүүр илрүүлэлт зэрэг хяналт идэвхтэй."
              : "Дэлгэцийн зураг болон аппаас гарах хамгаалалт идэвхтэй. Нүүр болон бичлэгийн төхөөрөмжийн түвшний хяналт нь хөгжүүлэлтийн хувилбар дээр идэвхжинэ."
          }
        />
        {leaveCount > 0 ? (
          <StatusCard
            tone="warning"
            message={`Аппаас ${leaveCount} удаа гарсан нь бүртгэгдсэн. 5 секундээс илүү гарвал автоматаар илгээнэ.`}
          />
        ) : null}
        {submitError ? <StatusCard tone="error" message={submitError} /> : null}

        <View style={styles.progressCard}>
          <View>
            <SecureText style={styles.progressValue}>{answeredCount}</SecureText>
            <SecureText style={styles.progressLabel}>Бөглөсөн</SecureText>
          </View>
          <View>
            <SecureText style={styles.progressValue}>{shuffledQuestions.length - answeredCount}</SecureText>
            <SecureText style={styles.progressLabel}>Үлдсэн</SecureText>
          </View>
          <View>
            <SecureText style={styles.progressValue}>{violationCount}</SecureText>
            <SecureText style={styles.progressLabel}>Зөрчил</SecureText>
          </View>
        </View>

        <View style={styles.securityMetaCard}>
          <View style={styles.securityMetaRow}>
            <SecureText style={styles.securityMetaLabel}>Нийт асуулт</SecureText>
            <SecureText style={styles.securityMetaValue}>{shuffledQuestions.length}</SecureText>
          </View>
          <View style={styles.securityMetaRow}>
            <SecureText style={styles.securityMetaLabel}>Дэлгэцийн зураг</SecureText>
            <SecureText style={styles.securityMetaValue}>{screenshotCount}</SecureText>
          </View>
          <View style={styles.securityMetaRow}>
            <SecureText style={styles.securityMetaLabel}>Бичлэг</SecureText>
            <SecureText style={styles.securityMetaValue}>{recordingCount}</SecureText>
          </View>
          <View style={styles.securityMetaRow}>
            <SecureText style={styles.securityMetaLabel}>Нүүрний төлөв</SecureText>
            <SecureText style={styles.securityMetaValue}>
              {faceStatus === "unsupported"
                ? "Боломжгүй"
                : faceStatus === "single_face"
                  ? "Нэг нүүр"
                  : faceStatus === "multiple_faces"
                    ? "Олон нүүр"
                    : "Нүүр алга"}
            </SecureText>
          </View>
        </View>

        <View style={styles.questionStack}>
          {shuffledQuestions.map((question, index) => (
            <View key={question.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <SecureText style={styles.questionCounter}>Асуулт {index + 1}</SecureText>
                <SecureText style={styles.questionPoints}>1 оноо</SecureText>
              </View>

              <MathText value={question.question} style={styles.questionTitle} />

              <View style={styles.choiceList}>
                {question.choices.map((choice) => {
                  const selected = answers[question.id]?.selectedChoiceId === choice.id;

                  return (
                    <Pressable
                      key={choice.id}
                      style={[styles.choiceButton, selected ? styles.choiceButtonSelected : null]}
                      onPress={() => handleSelectChoice(question.id, choice.id)}
                    >
                      <View style={[styles.radio, selected ? styles.radioSelected : null]}>
                        {selected ? <View style={styles.radioInner} /> : null}
                      </View>
                      <MathText value={`${choice.label}. ${choice.text}`} style={styles.choiceText} />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <PrimaryButton
          label={submitLoading ? "Илгээж байна..." : "Шалгалт илгээх"}
          onPress={handleSubmitPress}
          disabled={submitLoading}
          loading={submitLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerEyebrow: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.primary,
  },
  headerTitle: {
    marginTop: 6,
    fontFamily: fonts.display.semibold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  timerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerChipDanger: {
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerBackground,
  },
  timerText: {
    fontFamily: fonts.display.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  timerTextDanger: {
    color: colors.dangerText,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
  },
  title: {
    fontFamily: fonts.display.semibold,
    fontSize: 27,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 18,
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  progressCard: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 16,
    ...shadows.card,
  },
  progressValue: {
    textAlign: "center",
    fontFamily: fonts.display.semibold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  progressLabel: {
    marginTop: 6,
    textAlign: "center",
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  securityMetaCard: {
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 10,
    ...shadows.card,
  },
  securityMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  securityMetaLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  securityMetaValue: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  questionStack: {
    gap: 16,
  },
  questionCard: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: 18,
    ...shadows.card,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  questionCounter: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.primary,
  },
  questionPoints: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.textSoft,
  },
  questionTitle: {
    marginTop: 12,
    fontFamily: fonts.sans.semibold,
    fontSize: 17,
    lineHeight: 25,
    color: colors.textPrimary,
  },
  choiceList: {
    marginTop: 16,
    gap: 10,
  },
  choiceButton: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  choiceButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F6F2FF",
  },
  radio: {
    marginTop: 2,
    height: 22,
    width: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  choiceText: {
    flex: 1,
    fontFamily: fonts.sans.medium,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textPrimary,
  },
});
