import { SchoolProfileSync } from "@/components/school/school-profile-sync";
import { SchoolTeacherApprovals } from "@/components/school/school-teacher-approvals";

export default function SchoolPage() {
  return (
    <section className="space-y-6">
      <article className="rounded-3xl border border-border/70 bg-card/90 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          School Test Page
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Багшийн хүсэлтүүдийг approve/reject хийх хэсэг.
        </p>
        <SchoolProfileSync />
      </article>
      <SchoolTeacherApprovals />
    </section>
  );
}
