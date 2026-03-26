"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { cloudflareGraphqlRequest } from "@/lib/cloudflare-graphql-client";

const upsertSchoolMutation = `
  mutation UpsertSchool($input: upsertSchoolInput!) {
    upsertSchool(input: $input) {
      id
    }
  }
`;

export function SchoolProfileSync() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState("");
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (hasSyncedRef.current || !isLoaded || !isSignedIn || !user) {
      return;
    }

    const role = user.unsafeMetadata?.role;
    if (role !== "school") {
      return;
    }

    const schoolName = String(user.unsafeMetadata?.schoolName ?? "").trim();
    const managerFirstName = String(user.unsafeMetadata?.firstName ?? "").trim();
    const managerLastName = String(user.unsafeMetadata?.lastName ?? "").trim();
    const aimag = String(user.unsafeMetadata?.aimag ?? "").trim();
    const email = user.primaryEmailAddress?.emailAddress?.trim() ?? "";

    if (!schoolName || !managerFirstName || !managerLastName || !aimag || !email) {
      setStatus("Сургуулийн бүртгэлийн мэдээлэл дутуу байна.");
      return;
    }

    void (async () => {
      try {
        setStatus("Сургуулийн мэдээлэл синк хийж байна...");
        const token = await getToken();
        if (!token) {
          throw new Error("Missing Clerk session token.");
        }

        await cloudflareGraphqlRequest({
          token,
          query: upsertSchoolMutation,
          variables: {
            input: {
              schoolName,
              email,
              managerLastName,
              managerFirstName,
              aimag,
            },
          },
        });

        hasSyncedRef.current = true;
        setStatus("Сургуулийн бүртгэл амжилттай синк хийгдлээ.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Сургуулийн синк амжилтгүй.";
        setStatus(message);
      }
    })();
  }, [getToken, isLoaded, isSignedIn, user]);

  if (!status) {
    return null;
  }

  return <p className="mt-3 text-sm text-muted-foreground">{status}</p>;
}
