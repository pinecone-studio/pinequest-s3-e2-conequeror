import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const teacherId = "user_3BkRu7sUOCzK9XnUI9pl6hmmK3w";
const outputPath = resolve("scripts/generated/seed-demo-data.sql");

type ClassroomSeed = {
  id: string;
  className: string;
  classCode: string;
  grade: string;
  createdAt: number;
};

type ExamSeed = {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  grade: string;
  scheduledDate: string;
  startTime: string;
};

const classrooms: ClassroomSeed[] = [
  {
    id: "seed_demo_classroom_9a",
    className: "9A Demo",
    classCode: "SEED-9A-2026",
    grade: "9-р анги",
    createdAt: Date.UTC(2026, 0, 3, 8, 0, 0),
  },
  {
    id: "seed_demo_classroom_10b",
    className: "10B Demo",
    classCode: "SEED-10B-2026",
    grade: "10-р анги",
    createdAt: Date.UTC(2026, 0, 4, 8, 0, 0),
  },
  {
    id: "seed_demo_classroom_11c",
    className: "11C Demo",
    classCode: "SEED-11C-2026",
    grade: "11-р анги",
    createdAt: Date.UTC(2026, 0, 5, 8, 0, 0),
  },
];

const exams: ExamSeed[] = [
  {
    id: "seed_demo_exam_1",
    title: "Иргэний нийгэм ба оролцоо",
    subject: "social",
    description: "Seed demo exam 1",
    duration: 45,
    grade: "9-р анги",
    scheduledDate: "2026-01-15",
    startTime: "09:00",
  },
  {
    id: "seed_demo_exam_2",
    title: "Монгол Улсын Үндсэн хуулийн ойлголт",
    subject: "civics",
    description: "Seed demo exam 2",
    duration: 60,
    grade: "10-р анги",
    scheduledDate: "2026-01-29",
    startTime: "10:15",
  },
  {
    id: "seed_demo_exam_3",
    title: "Өгөгдлийн дундаж ба магадлал",
    subject: "math",
    description: "Seed demo exam 3",
    duration: 60,
    grade: "11-р анги",
    scheduledDate: "2026-02-12",
    startTime: "11:30",
  },
  {
    id: "seed_demo_exam_4",
    title: "Reading Comprehension Review",
    subject: "english",
    description: "Seed demo exam 4",
    duration: 45,
    grade: "10-р анги",
    scheduledDate: "2026-02-26",
    startTime: "09:45",
  },
  {
    id: "seed_demo_exam_5",
    title: "Химийн урвал ба тэнцвэр",
    subject: "chemistry",
    description: "Seed demo exam 5",
    duration: 60,
    grade: "11-р анги",
    scheduledDate: "2026-03-12",
    startTime: "13:00",
  },
];

const studentFirstNames = [
  "Anu",
  "Bilguun",
  "Cecilia",
  "Dulguun",
  "Enkhjin",
  "Fiona",
  "Ganzorig",
  "Hulan",
  "Ider",
  "Javkhaa",
  "Khulan",
  "Lkhagva",
];

const studentLastNames = [
  "Bat",
  "Dorj",
  "Erdene",
  "Gan",
  "Munkh",
  "Naran",
  "Otgon",
  "Purev",
  "Saruul",
  "Temuulen",
  "Uyanga",
  "Zol",
];

const performanceBands = [0.35, 0.45, 0.55, 0.65, 0.78, 0.9];
const choiceLabels = ["A", "B", "C", "D"] as const;

function sqlString(value: string | null) {
  if (value === null) {
    return "NULL";
  }

  return `'${value.replace(/'/g, "''")}'`;
}

function insertRows(
  tableName: string,
  columns: string[],
  rows: string[][],
  chunkSize = 50,
) {
  if (rows.length === 0) {
    return "";
  }

  const statements: string[] = [];

  for (let start = 0; start < rows.length; start += chunkSize) {
    const chunk = rows.slice(start, start + chunkSize);
    const values = chunk.map((row) => `(${row.join(", ")})`).join(",\n");

    statements.push(
      `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES\n${values};`,
    );
  }

  return statements.join("\n\n");
}

function buildStudents() {
  return classrooms.flatMap((classroom, classroomIndex) =>
    Array.from({ length: 12 }, (_, studentIndex) => {
      const ordinal = classroomIndex * 12 + studentIndex + 1;
      const firstName = studentFirstNames[studentIndex % studentFirstNames.length];
      const lastName = studentLastNames[(studentIndex + classroomIndex) % studentLastNames.length];

      return {
        id: `seed_demo_student_${classroomIndex + 1}_${studentIndex + 1}`,
        firstName,
        lastName,
        email: `seed.demo.${ordinal}@pinequest.test`,
        phone: `9900${String(ordinal).padStart(4, "0")}`,
        grade: classroom.grade,
        className: classroom.className,
        inviteCode: classroom.classCode,
        classroomId: classroom.id,
        teacherId,
        studentIndex: ordinal - 1,
      };
    }),
  );
}

function buildQuestions() {
  return exams.flatMap((exam, examIndex) =>
    Array.from({ length: 6 }, (_, questionIndex) => {
      const questionNumber = questionIndex + 1;
      const correctChoiceIndex = (examIndex + questionIndex) % choiceLabels.length;

      return {
        id: `seed_demo_question_${examIndex + 1}_${questionNumber}`,
        examId: exam.id,
        type: "mcq",
        question: `${exam.title} - Асуулт ${questionNumber}`,
        indexOnExam: questionNumber,
        topic: `Topic ${questionNumber}`,
        difficulty: questionNumber <= 2 ? "easy" : questionNumber <= 4 ? "medium" : "hard",
        correctChoiceIndex,
      };
    }),
  );
}

function buildChoices(questions: ReturnType<typeof buildQuestions>) {
  return questions.flatMap((question) =>
    choiceLabels.map((label, choiceIndex) => ({
      id: `${question.id}_choice_${label.toLowerCase()}`,
      questionId: question.id,
      text: `${question.question} - Сонголт ${label}`,
      label,
      isCorrect: choiceIndex === question.correctChoiceIndex ? 1 : 0,
    })),
  );
}

function buildAnnouncements() {
  return exams.flatMap((exam) =>
    classrooms.map((classroom) => ({
      id: `seed_demo_announcement_${exam.id}_${classroom.id}`,
      examId: exam.id,
      openStatus: 0,
      scheduledDate: exam.scheduledDate,
      startTime: exam.startTime,
      classroomId: classroom.id,
      createdBy: teacherId,
    })),
  );
}

function buildSubmissions(
  students: ReturnType<typeof buildStudents>,
  questions: ReturnType<typeof buildQuestions>,
  choices: ReturnType<typeof buildChoices>,
) {
  const answers: Array<{
    id: string;
    submissionId: string;
    questionId: string;
    selectedChoiceId: string;
    isCorrect: number;
  }> = [];

  const submissions = students.flatMap((student) =>
    exams.map((exam, examIndex) => {
      const submissionId = `seed_demo_submission_${student.id}_${exam.id}`;
      const questionSet = questions.filter((question) => question.examId === exam.id);
      const proficiency = performanceBands[(student.studentIndex + examIndex) % performanceBands.length];
      const startedAt = Date.UTC(2026, 0, 10 + examIndex * 14, 7 + (student.studentIndex % 5), student.studentIndex % 50, 0);
      let correctAnswers = 0;

      questionSet.forEach((question, questionIndex) => {
        const scoreSeed = ((student.studentIndex + 3) * 17 + (examIndex + 1) * 13 + (questionIndex + 1) * 7) % 100;
        const shouldBeCorrect = scoreSeed / 100 < proficiency;
        const selectedChoiceIndex = shouldBeCorrect
          ? question.correctChoiceIndex
          : (question.correctChoiceIndex + 1 + ((student.studentIndex + examIndex + questionIndex) % 3)) % choiceLabels.length;
        const selectedLabel = choiceLabels[selectedChoiceIndex];
        const selectedChoice = choices.find(
          (choice) => choice.questionId === question.id && choice.label === selectedLabel,
        );

        if (!selectedChoice) {
          throw new Error(`Missing choice for ${question.id} ${selectedLabel}`);
        }

        if (shouldBeCorrect) {
          correctAnswers += 1;
        }

        answers.push({
          id: `seed_demo_answer_${submissionId}_${question.id}`,
          submissionId,
          questionId: question.id,
          selectedChoiceId: selectedChoice.id,
          isCorrect: shouldBeCorrect ? 1 : 0,
        });
      });

      const totalQuestions = questionSet.length;
      const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);
      const submittedAt = startedAt + (18 + examIndex * 3 + (student.studentIndex % 8)) * 60_000;

      return {
        id: submissionId,
        studentId: student.id,
        examId: exam.id,
        startedAt,
        submittedAt,
        totalQuestions,
        correctAnswers,
        scorePercent,
      };
    }),
  );

  return { submissions, answers };
}

async function main() {
  const students = buildStudents();
  const questions = buildQuestions();
  const choices = buildChoices(questions);
  const announcements = buildAnnouncements();
  const { submissions, answers } = buildSubmissions(students, questions, choices);

  const sqlStatements = [
    "-- Generated by scripts/seed-demo-data.ts",
    "PRAGMA foreign_keys = ON;",
    "DELETE FROM student_exam_answers WHERE id LIKE 'seed_demo_%';",
    "DELETE FROM student_exam_submissions WHERE id LIKE 'seed_demo_%';",
    "DELETE FROM student_exam_sessions WHERE id LIKE 'seed_demo_%';",
    "DELETE FROM announced_exam_grades WHERE id LIKE 'seed_demo_%';",
    "DELETE FROM announced_exams WHERE id LIKE 'seed_demo_%';",
    "DELETE FROM choices WHERE id LIKE 'seed_demo_%';",
    "DELETE FROM questions WHERE id LIKE 'seed_demo_%';",
    "DELETE FROM students WHERE id LIKE 'seed_demo_%';",
    "DELETE FROM classrooms WHERE id LIKE 'seed_demo_%';",
    "DELETE FROM exams WHERE id LIKE 'seed_demo_%';",
    `INSERT OR IGNORE INTO teachers (id, firstName, lastName, email, phone) VALUES (${sqlString(teacherId)}, ${sqlString("Seed")}, ${sqlString("Teacher")}, ${sqlString("seed.teacher@pinequest.test")}, ${sqlString("99000000")});`,
    insertRows(
      "classrooms",
      ["id", "teacherId", "className", "classCode", "createdAt"],
      classrooms.map((classroom) => [
        sqlString(classroom.id),
        sqlString(teacherId),
        sqlString(classroom.className),
        sqlString(classroom.classCode),
        String(classroom.createdAt),
      ]),
      25,
    ),
    insertRows(
      "students",
      ["id", "firstName", "lastName", "email", "phone", "grade", "className", "inviteCode", "classroomId", "teacherId"],
      students.map((student) => [
        sqlString(student.id),
        sqlString(student.firstName),
        sqlString(student.lastName),
        sqlString(student.email),
        sqlString(student.phone),
        sqlString(student.grade),
        sqlString(student.className),
        sqlString(student.inviteCode),
        sqlString(student.classroomId),
        sqlString(student.teacherId),
      ]),
      25,
    ),
    insertRows(
      "exams",
      ["id", "title", "subject", "description", "duration", "grade", "fileUrl", "createdBy"],
      exams.map((exam) => [
        sqlString(exam.id),
        sqlString(exam.title),
        sqlString(exam.subject),
        sqlString(exam.description),
        String(exam.duration),
        sqlString(exam.grade),
        "NULL",
        sqlString(teacherId),
      ]),
      10,
    ),
    insertRows(
      "questions",
      ["id", "type", "question", "examId", "indexOnExam", "imageUrl", "videoUrl", "topic", "difficulty"],
      questions.map((question) => [
        sqlString(question.id),
        sqlString(question.type),
        sqlString(question.question),
        sqlString(question.examId),
        String(question.indexOnExam),
        "NULL",
        "NULL",
        sqlString(question.topic),
        sqlString(question.difficulty),
      ]),
      25,
    ),
    insertRows(
      "choices",
      ["id", "questionId", "text", "label", "imageUrl", "videoUrl", "isCorrect"],
      choices.map((choice) => [
        sqlString(choice.id),
        sqlString(choice.questionId),
        sqlString(choice.text),
        sqlString(choice.label),
        "NULL",
        "NULL",
        String(choice.isCorrect),
      ]),
      40,
    ),
    insertRows(
      "announced_exams",
      ["id", "examId", "openStatus", "scheduledDate", "startTime", "createdBy"],
      announcements.map((announcement) => [
        sqlString(announcement.id),
        sqlString(announcement.examId),
        String(announcement.openStatus),
        sqlString(announcement.scheduledDate),
        sqlString(announcement.startTime),
        sqlString(announcement.createdBy),
      ]),
      30,
    ),
    insertRows(
      "announced_exam_grades",
      ["id", "classroomId", "announcedExamId", "createdBy"],
      announcements.map((announcement) => [
        sqlString(`seed_demo_grade_link_${announcement.id}`),
        sqlString(announcement.classroomId),
        sqlString(announcement.id),
        sqlString(teacherId),
      ]),
      30,
    ),
    insertRows(
      "student_exam_submissions",
      ["id", "studentId", "examId", "startedAt", "submittedAt", "totalQuestions", "correctAnswers", "scorePercent"],
      submissions.map((submission) => [
        sqlString(submission.id),
        sqlString(submission.studentId),
        sqlString(submission.examId),
        String(submission.startedAt),
        String(submission.submittedAt),
        String(submission.totalQuestions),
        String(submission.correctAnswers),
        String(submission.scorePercent),
      ]),
      40,
    ),
    insertRows(
      "student_exam_answers",
      ["id", "submissionId", "questionId", "selectedChoiceId", "answerText", "isCorrect"],
      answers.map((answer) => [
        sqlString(answer.id),
        sqlString(answer.submissionId),
        sqlString(answer.questionId),
        sqlString(answer.selectedChoiceId),
        "NULL",
        String(answer.isCorrect),
      ]),
      80,
    ),
    "",
  ].filter(Boolean);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, sqlStatements.join("\n\n"));

  console.log(`Wrote ${outputPath}`);
  console.log(`Classrooms: ${classrooms.length}`);
  console.log(`Students: ${students.length}`);
  console.log(`Exams: ${exams.length}`);
  console.log(`Questions: ${questions.length}`);
  console.log(`Choices: ${choices.length}`);
  console.log(`Announcements: ${announcements.length}`);
  console.log(`Submissions: ${submissions.length}`);
  console.log(`Answers: ${answers.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
