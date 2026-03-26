"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cloudflareGraphqlRequest } from "@/lib/cloudflare-graphql-client";

type SchoolItem = {
  id: string;
  schoolName: string;
  aimag: string;
};

type TeacherRequestItem = {
  id: string;
  schoolId: string;
  schoolName: string;
  subject: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: number;
};

type ClassroomItem = {
  id: string;
  className: string;
  classCode: string;
  createdAt: number;
  schoolName?: string | null;
};

const schoolsQuery = `
  query Schools {
    schools {
      id
      schoolName
      aimag
    }
  }
`;

const myTeacherRequestsQuery = `
  query MyTeacherRequests {
    myTeacherRequests {
      id
      schoolId
      schoolName
      subject
      status
      createdAt
    }
  }
`;

const classroomsByTeacherQuery = `
  query ClassroomsByTeacher {
    classroomsByTeacher {
      id
      className
      classCode
      createdAt
      schoolName
    }
  }
`;

const requestTeacherApprovalMutation = `
  mutation RequestTeacherApproval($input: createTeacherRequestInput!) {
    requestTeacherApproval(input: $input) {
      id
      schoolId
      schoolName
      subject
      status
      createdAt
    }
  }
`;

const createClassroomMutation = `
  mutation CreateClassroom($input: createClassroomInput!) {
    createClassroom(input: $input) {
      id
      className
      classCode
      createdAt
      schoolName
    }
  }
`;

function formatDate(timestamp: number) {
  if (!timestamp) {
    return "-";
  }
  return new Date(timestamp).toLocaleString();
}

export function TeacherSchoolRequests() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [requests, setRequests] = useState<TeacherRequestItem[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomItem[]>([]);

  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [requestSubject, setRequestSubject] = useState("");
  const [className, setClassName] = useState("");
  const [selectedClassSchoolId, setSelectedClassSchoolId] = useState("");
  const [creatingClassroom, setCreatingClassroom] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [showClassCode, setShowClassCode] = useState(false);
  const [createdClassCode, setCreatedClassCode] = useState("");

  const approvedRequests = useMemo(
    () => requests.filter((item) => item.status === "APPROVED"),
    [requests],
  );

  useEffect(() => {
    if (!selectedClassSchoolId && approvedRequests.length > 0) {
      setSelectedClassSchoolId(approvedRequests[0].schoolId);
    }
  }, [approvedRequests, selectedClassSchoolId]);

  const loadTeacherPortal = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      throw new Error("Missing Clerk session token.");
    }

    const [schoolsData, requestsData, classroomsData] = await Promise.all([
      cloudflareGraphqlRequest<{ schools: SchoolItem[] }>({
        token,
        query: schoolsQuery,
      }),
      cloudflareGraphqlRequest<{ myTeacherRequests: TeacherRequestItem[] }>({
        token,
        query: myTeacherRequestsQuery,
      }),
      cloudflareGraphqlRequest<{ classroomsByTeacher: ClassroomItem[] }>({
        token,
        query: classroomsByTeacherQuery,
      }),
    ]);

    setSchools(schoolsData.schools ?? []);
    setRequests(requestsData.myTeacherRequests ?? []);
    setClassrooms(classroomsData.classroomsByTeacher ?? []);
  }, [getToken]);

  useEffect(() => {
    if (!selectedSchoolId && schools.length > 0) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [schools, selectedSchoolId]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    void (async () => {
      try {
        setLoading(true);
        setStatusMessage("Teacher portal ачаалж байна...");
        await loadTeacherPortal();
        setStatusMessage("");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Teacher portal load failed.";
        setStatusMessage(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, isSignedIn, loadTeacherPortal]);

  const handleSendRequest = async () => {
    if (!selectedSchoolId) {
      setStatusMessage("Сургууль сонгоно уу.");
      return;
    }

    try {
      setSendingRequest(true);
      setStatusMessage("");
      const token = await getToken();
      if (!token) {
        throw new Error("Missing Clerk session token.");
      }

      await cloudflareGraphqlRequest({
        token,
        query: requestTeacherApprovalMutation,
        variables: {
          input: {
            schoolId: selectedSchoolId,
            subject: requestSubject.trim() || undefined,
          },
        },
      });

      setRequestSubject("");
      await loadTeacherPortal();
      setStatusMessage("Сургууль руу хүсэлт амжилттай илгээлээ.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Request илгээхэд алдаа гарлаа.";
      setStatusMessage(message);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleCreateClassroom = async () => {
    const normalizedClassName = className.trim().toUpperCase();
    if (!normalizedClassName) {
      setStatusMessage("Class name is required.");
      return;
    }

    if (!selectedClassSchoolId) {
      setStatusMessage("Approved сургууль сонгоно уу.");
      return;
    }

    try {
      setCreatingClassroom(true);
      setStatusMessage("");
      const token = await getToken();
      if (!token) {
        throw new Error("Missing Clerk session token.");
      }

      const result = await cloudflareGraphqlRequest<{
        createClassroom: ClassroomItem;
      }>({
        token,
        query: createClassroomMutation,
        variables: {
          input: {
            className: normalizedClassName,
            schoolId: selectedClassSchoolId,
          },
        },
      });

      setClassName("");
      setCreatedClassCode(result.createClassroom?.classCode ?? "");
      setShowClassCode(true);
      await loadTeacherPortal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create classroom.";
      setStatusMessage(message);
    } finally {
      setCreatingClassroom(false);
    }
  };

  return (
    <section className="space-y-6">
      <article className="rounded-3xl border border-[#E7E8F0] bg-white p-6">
        <h2 className="text-xl font-semibold text-[#111111]">Сургууль руу хүсэлт илгээх</h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Сургууль сонгоод хүсэлт илгээсний дараа approve хүлээнэ.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr_auto]">
          <select
            className="h-11 rounded-xl border border-[#E7E8F0] bg-white px-3 text-sm"
            value={selectedSchoolId}
            onChange={(event) => setSelectedSchoolId(event.target.value)}
          >
            <option value="">Сургууль сонгох</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.schoolName} ({school.aimag})
              </option>
            ))}
          </select>
          <input
            className="h-11 rounded-xl border border-[#E7E8F0] bg-white px-3 text-sm"
            placeholder="Хичээл / Subject (сонголтоор)"
            value={requestSubject}
            onChange={(event) => setRequestSubject(event.target.value)}
          />
          <Button onClick={handleSendRequest} disabled={sendingRequest || loading}>
            {sendingRequest ? "Илгээж байна..." : "Request илгээх"}
          </Button>
        </div>

        {requests.length > 0 ? (
          <div className="mt-5 space-y-2">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-xl border border-[#E7E8F0] bg-[#FAFAFF] px-4 py-3 text-sm"
              >
                <p className="font-medium text-[#111111]">{request.schoolName}</p>
                <p className="mt-1 text-[#6B7280]">Subject: {request.subject}</p>
                <p className="mt-1 text-[#6B7280]">
                  Status: <span className="font-semibold">{request.status}</span>
                </p>
                <p className="mt-1 text-xs text-[#6B7280]">
                  Requested at: {formatDate(request.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </article>

      {approvedRequests.length > 0 ? (
        <article className="rounded-3xl border border-[#E7E8F0] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#111111]">Анги нээх</h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            Approve хийгдсэн сургууль дээрээ анги нээгээд class code-оо сурагчдад өгнө.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr_auto]">
            <select
              className="h-11 rounded-xl border border-[#E7E8F0] bg-white px-3 text-sm"
              value={selectedClassSchoolId}
              onChange={(event) => setSelectedClassSchoolId(event.target.value)}
            >
              <option value="">Approved сургууль сонгох</option>
              {approvedRequests.map((request) => (
                <option key={request.id} value={request.schoolId}>
                  {request.schoolName}
                </option>
              ))}
            </select>
            <input
              className="h-11 rounded-xl border border-[#E7E8F0] bg-white px-3 text-sm"
              placeholder="Class name (ex: 10A)"
              value={className}
              onChange={(event) => setClassName(event.target.value)}
            />
            <Button onClick={handleCreateClassroom} disabled={creatingClassroom || loading}>
              {creatingClassroom ? "Creating..." : "Create class"}
            </Button>
          </div>

          {classrooms.length > 0 ? (
            <div className="mt-5 space-y-2">
              {classrooms.map((classroom) => (
                <div
                  key={classroom.id}
                  className="rounded-xl border border-[#E7E8F0] bg-[#FAFAFF] px-4 py-3 text-sm"
                >
                  <p className="font-medium text-[#111111]">
                    · {classroom.className}
                    {classroom.schoolName ? ` (${classroom.schoolName})` : ""}
                  </p>
                  <p className="mt-1 text-[#6B7280]">
                    Class code: <span className="font-semibold">{classroom.classCode}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      ) : (
        <article className="rounded-3xl border border-[#E7E8F0] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#111111]">Анги нээх</h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            Request approve болсны дараа энэ хэсэг идэвхжинэ.
          </p>
        </article>
      )}

      {statusMessage ? (
        <p className="text-sm text-[#6B7280]">{statusMessage}</p>
      ) : null}

      <Dialog open={showClassCode} onOpenChange={setShowClassCode}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Class Code</DialogTitle>
            <p className="font-semibold text-2xl">{createdClassCode}</p>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
}
