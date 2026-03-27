"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FileText, LogOut, Users } from "lucide-react";

const navItems = [
  {
    label: "Хяналтын самбар",
    href: "/teacher/dashboard",
    icon: LayoutGrid,
  },
  {
    label: "Шалгалтууд",
    href: "/teacher/exams",
    icon: FileText,
  },
  {
    label: "Сургууль",
    href: "/teacher",
    icon: Users,
  },
] as const;

function isNavItemActive(
  pathname: string,
  href: (typeof navItems)[number]["href"],
) {
  if (href === "/teacher") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TeacherHeader() {
  const pathname = usePathname();
  const { openUserProfile, signOut } = useClerk();
  const { user } = useUser();
  const rawFullName = user?.unsafeMetadata?.fullName;
  const rawRole = user?.unsafeMetadata?.role;
  const displayName =
    typeof rawFullName === "string" && rawFullName.trim()
      ? rawFullName
      : [user?.lastName, user?.firstName].filter(Boolean).join(" ") ||
        user?.fullName ||
        user?.firstName ||
        user?.username ||
        "Багш";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const roleLabel = rawRole === "teacher" ? "Багш" : "Хэрэглэгч";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E7E8F0] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/teacher/dashboard" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="PineQuest logo"
            width={44}
            height={34}
            className="h-10 w-11 object-contain"
          />
          <div className="flex flex-col leading-none text-black">
            <span className="text-[16px] font-medium tracking-widest uppercase">
              Learning
            </span>
            <span className="text-[17px] tracking-tight">MS</span>
          </div>
        </Link>

        <nav className="flex items-center gap-8 lg:gap-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavItemActive(pathname, item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2.5 text-[15px] font-medium transition ${
                  isActive
                    ? "text-[#8B6FF7]"
                    : "text-[#5B5563] hover:text-[#8B6FF7]"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 border-l border-[#E7E8F0] pl-5">
          <button
            type="button"
            onClick={() => openUserProfile()}
            aria-label="Open profile"
            className="flex items-center gap-3 text-left transition hover:opacity-90"
          >
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[#E7E8F0] bg-gradient-to-br from-[#F4A261] to-[#E76F51] text-[14px] font-bold text-white">
              {initials || "Б"}
            </div>

            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-semibold text-[#111111]">
                  {displayName}
                </p>
                <span className="rounded-full bg-[#F2F0FF] px-2.5 py-1 text-[11px] font-semibold text-[#7E66DC]">
                  {roleLabel}
                </span>
              </div>
              <p className="mt-1 text-[12px] font-medium text-[#9A98A3]">
                {email || "teacher@pinequest.app"}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => void signOut({ redirectUrl: "/sign-in" })}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#D8DAE3] px-4 text-[13px] font-medium text-[#51475A] transition hover:border-[#8B7FE8] hover:bg-[#F7F3FF] hover:text-[#6A54D8]"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
