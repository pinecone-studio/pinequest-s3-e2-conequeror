type SyncStudentInput = {
  fullName: string;
  email: string;
  phone: string;
};

type SyncRole = "student" | "teacher";

type GraphQLError = {
  message?: string;
};

type SyncResponse = {
  errors?: GraphQLError[];
  data?: {
    upsertStudent?: {
      id: string;
    } | null;
    upsertTeacher?: {
      id: string;
    } | null;
  };
};

const syncRoleMutation = `
  mutation SyncRoleProfile(
    $studentInput: upsertStudentInput!
    $teacherInput: upsertTeacherInput!
    $isStudent: Boolean!
    $isTeacher: Boolean!
  ) {
    upsertStudent(input: $studentInput) @include(if: $isStudent) {
      id
    }

    upsertTeacher(input: $teacherInput) @include(if: $isTeacher) {
      id
    }
  }
`;

export function getCloudflareGraphqlUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_GRAPHQL_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://127.0.0.1:8787/graphql";
  }

  return null;
}

export async function syncRoleProfileToCloudflare({
  token,
  apiUrl,
  role,
  input,
}: {
  token: string;
  apiUrl: string;
  role: SyncRole;
  input: SyncStudentInput;
}) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: syncRoleMutation,
      variables: {
        studentInput: input,
        teacherInput: input,
        isStudent: role === "student",
        isTeacher: role === "teacher",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Sync failed with status ${response.status}`);
  }

  const payload = (await response.json()) as SyncResponse;
  const errorMessage = payload.errors?.find((error) => error.message)?.message;

  if (errorMessage) {
    throw new Error(errorMessage);
  }

  const recordId =
    role === "teacher"
      ? payload.data?.upsertTeacher?.id
      : payload.data?.upsertStudent?.id;

  if (!recordId) {
    throw new Error("Cloudflare sync did not return a profile record.");
  }
}
