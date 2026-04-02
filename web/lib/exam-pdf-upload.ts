import { getCloudflareGraphqlUrl } from "@/lib/cloudflare-sync";

function getExamPdfUploadUrl() {
  const graphqlUrl = getCloudflareGraphqlUrl();

  if (!graphqlUrl) {
    throw new Error("GraphQL URL тохируулагдаагүй байна.");
  }

  return graphqlUrl.replace(/\/graphql\/?$/, "/uploads/exam-pdf");
}

export async function uploadExamPdfFile({
  examId,
  file,
  token,
}: {
  examId: string;
  file: File;
  token: string | null;
}) {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("examId", examId);

  const response = await fetch(getExamPdfUploadUrl(), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const payload = (await response.json()) as { url?: string; error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "PDF файлыг R2 руу хадгалж чадсангүй.");
  }

  if (!payload.url) {
    throw new Error("PDF файлын URL буцаагдсангүй.");
  }

  return payload.url;
}
