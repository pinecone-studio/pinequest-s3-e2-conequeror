import { Hono } from "hono";
import { cors } from "hono/cors";
import { eq } from "drizzle-orm";
import { getCorsOrigins, type WorkerBindings } from "./config/runtime";
import { getDb } from "./db/client";
import { announcedExams } from "./db/schemas/announcedExams.schema";
import { exams } from "./db/schemas/exam.schema";
import { studentExamSessions } from "./db/schemas/student-exam-session.schema";
import {
	getRequestAuth,
	getResolvedRequestAuth,
	resolveRequestStudentId,
	yoga,
} from "./server";

const app = new Hono<{ Bindings: WorkerBindings }>();
const SESSION_INTEGRITY_PATH = "/session-integrity";

type SessionIntegrityAction = {
	id: string;
	type: "start" | "heartbeat" | "stop";
	userId: string;
	examId: string;
	deviceId: string;
	sessionId: string;
	timestamp: number;
};

function isSessionIntegrityAction(value: unknown): value is SessionIntegrityAction {
	if (!value || typeof value !== "object") {
		return false;
	}

	const action = value as Record<string, unknown>;

	return (
		typeof action.id === "string" &&
		(action.type === "start" || action.type === "heartbeat" || action.type === "stop") &&
		typeof action.userId === "string" &&
		typeof action.examId === "string" &&
		typeof action.deviceId === "string" &&
		typeof action.sessionId === "string" &&
		typeof action.timestamp === "number" &&
		Number.isFinite(action.timestamp)
	);
}

function sanitizePathSegment(value: string) {
	return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

app.get("/", (c) => c.text("Hello World!"));

app.use("/graphql", (c, next) =>
	cors({
		origin: getCorsOrigins(c.env),
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["GET", "POST", "OPTIONS"],
		credentials: true
	})(c, next),
);

app.use("/uploads/*", (c, next) =>
	cors({
		origin: getCorsOrigins(c.env),
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "OPTIONS"],
		credentials: true,
	})(c, next),
);

app.use(SESSION_INTEGRITY_PATH, (c, next) =>
	cors({
		origin: getCorsOrigins(c.env),
		allowHeaders: [
			"Content-Type",
			"Authorization",
			"x-mobile-demo-key",
			"x-mobile-student-email",
			"x-mobile-student-invite-code",
		],
		allowMethods: ["POST", "OPTIONS"],
		credentials: true,
	})(c, next),
);

app.all("/graphql", (c) =>
	yoga.fetch(c.req.raw, {
		env: c.env,
	}),
);

app.post(SESSION_INTEGRITY_PATH, async (c) => {
	const db = getDb(c.env);
	const auth = await getResolvedRequestAuth(c.req.raw, c.env, db);

	if (!auth.isAuthenticated || !auth.userId) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	let body: unknown;

	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid JSON body." }, 400);
	}

	if (!isSessionIntegrityAction(body)) {
		return c.json({ error: "Invalid session payload." }, 400);
	}

	const action = body;
	const resolvedStudentId = await resolveRequestStudentId(c.req.raw, c.env, db, auth);

	if (!resolvedStudentId) {
		return c.json({ error: "Student profile not found for this session." }, 403);
	}

	const announcedExam = await db
		.select({ examId: announcedExams.examId })
		.from(announcedExams)
		.where(eq(announcedExams.id, action.examId))
		.get();
	const persistedExamId = announcedExam?.examId ?? action.examId;
	const examExists = await db
		.select({ id: exams.id })
		.from(exams)
		.where(eq(exams.id, persistedExamId))
		.get();

	if (!examExists) {
		return c.json({ error: "Exam not found for this session." }, 404);
	}

	const sessionKey = `${resolvedStudentId}::${action.examId}`;
	const now = Date.now();
	const existing = await db
		.select()
		.from(studentExamSessions)
		.where(eq(studentExamSessions.id, sessionKey))
		.get();

	if (!existing) {
		if (action.type === "stop") {
			return c.json({ status: "ok" as const });
		}

		await db.insert(studentExamSessions).values({
			id: sessionKey,
			studentId: resolvedStudentId,
			examId: persistedExamId,
			sessionId: action.sessionId,
			deviceId: action.deviceId,
			startedAt: action.timestamp,
			lastHeartbeatAt: action.timestamp,
			lastActionAt: action.timestamp,
			createdAt: now,
			updatedAt: now,
		});

		return c.json({ status: "ok" as const });
	}

	const isSameSession =
		existing.sessionId === action.sessionId && existing.deviceId === action.deviceId;

	if (!isSameSession) {
		if (action.type !== "start" || action.timestamp <= existing.lastActionAt) {
			return c.json({ status: "replaced_by_other_device" as const });
		}

		await db
			.update(studentExamSessions)
			.set({
				sessionId: action.sessionId,
				deviceId: action.deviceId,
				startedAt: action.timestamp,
				lastHeartbeatAt: action.timestamp,
				lastActionAt: action.timestamp,
				updatedAt: now,
			})
			.where(eq(studentExamSessions.id, sessionKey));

		return c.json({ status: "ok" as const });
	}

	if (action.type === "stop") {
		await db.delete(studentExamSessions).where(eq(studentExamSessions.id, sessionKey));
		return c.json({ status: "ok" as const });
	}

	await db
		.update(studentExamSessions)
		.set({
			lastHeartbeatAt: action.timestamp,
			lastActionAt: action.timestamp,
			updatedAt: now,
		})
		.where(eq(studentExamSessions.id, sessionKey));

	return c.json({ status: "ok" as const });
});

app.post("/uploads/question-image", async (c) => {
	if (!c.env.exam_media) {
		return c.json({ error: "Question media bucket is not configured." }, 500);
	}
 
	const auth = await getRequestAuth(c.req.raw, c.env);
	if (!auth.isAuthenticated || !auth.userId) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const formData = await c.req.raw.formData();
	const file = formData.get("file");
	const examId = String(formData.get("examId") ?? "").trim();
	const questionId = String(formData.get("questionId") ?? "draft").trim();
	const choiceId = String(formData.get("choiceId") ?? "").trim();

	if (!(file instanceof File)) {
		return c.json({ error: "No file uploaded." }, 400);
	}

	if (!file.type.startsWith("image/")) {
		return c.json({ error: "Only image uploads are supported." }, 400);
	}

	if (!examId) {
		return c.json({ error: "examId is required." }, 400);
	}

	const safeFileName = sanitizePathSegment(file.name || "image");
	const keyParts = [
		"question-media",
		sanitizePathSegment(auth.userId),
		sanitizePathSegment(examId),
		sanitizePathSegment(questionId),
	];

	if (choiceId) {
		keyParts.push(sanitizePathSegment(choiceId));
	}

	keyParts.push(`${Date.now()}-${safeFileName}`);
	const key = keyParts.join("/");

	await c.env.exam_media.put(key, file.stream(), {
		httpMetadata: {
			contentType: file.type,
			contentDisposition: "inline",
		},
		customMetadata: {
			uploadedBy: auth.userId,
			examId,
			questionId,
			choiceId,
		},
	});

	const url = new URL(c.req.url);
	url.pathname = `/media/${key}`;
	url.search = "";

	return c.json({
		key,
		url: url.toString(),
	});
});

app.get("/media/*", async (c) => {
	if (!c.env.exam_media) {
		return c.text("Question media bucket is not configured.", 500);
	}

	const key = decodeURIComponent(c.req.path.replace(/^\/media\//, ""));
	if (!key) {
		return c.text("Missing media key.", 400);
	}

	const object = await c.env.exam_media.get(key);
	if (!object) {
		return c.text("Not found.", 404);
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	headers.set("cache-control", headers.get("cache-control") ?? "public, max-age=31536000, immutable");

	return new Response(object.body, {
		headers,
	});
});

export default app;
