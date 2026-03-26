import type { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getRoleHomePath, isUserRole } from "@/lib/auth-role";

export default async function SchoolLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const role = user.unsafeMetadata?.role;
  if (!isUserRole(role)) {
    redirect("/dashboard");
  }

  if (role !== "school") {
    redirect(getRoleHomePath(role));
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      {children}
    </main>
  );
}
