import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { StudentExamCard } from "@/components/StudentExamCard";
import { useAppData } from "@/data/app-data";
import { buildStudentExamSubjectOrder, formatStudentExamTimestamp } from "@/lib/student-exam";
import { colors, fonts, shadows } from "@/lib/theme";

export default function ResultsScreen() {
  const { submissions } = useAppData();
  const subjectOrder = buildStudentExamSubjectOrder(submissions);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        {submissions.length === 0 ? (
          <EmptyState
            title="Үр дүн алга"
            description="Шалгалт өгсний дараа үр дүн болон асуултын задлан харах хэсэг энд гарна."
          />
        ) : (
          <View style={styles.cards}>
            {submissions.map((submission) => (
              <StudentExamCard
                key={submission.id}
                subject={submission.subject}
                title={submission.title}
                grade={`${submission.grade} · ${submission.scorePercent}%`}
                duration={submission.duration}
                questionCount={submission.questionCount}
                scheduledDate={formatStudentExamTimestamp(submission.submittedAt)}
                startTime={`${submission.correctAnswers} зөв`}
                footerLabel={`${submission.scorePercent}%`}
                subjectOrder={subjectOrder}
                onPress={() => {
                  router.push(`/(student)/results/${submission.id}`);
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 136,
  },
  cards: {
    gap: 16,
  },
});
