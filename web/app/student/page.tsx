"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type FormValues = {
  email: string;
  lastName: string;
  firstName: string;
  school: string;
  grade: string;
  group: string;
  password: string;
  confirmPassword: string;
};

const initialFormValues: FormValues = {
  email: "",
  lastName: "",
  firstName: "",
  school: "",
  grade: "",
  group: "",
  password: "",
  confirmPassword: "",
};

const inputClassName =
  "h-12 w-full rounded-[14px] border border-[#EAE6F5] bg-white px-4 text-[15px] text-[#1F1B2D] shadow-none outline-none transition-colors placeholder:text-[#B7B0C8] focus:border-[#A592FF] focus:ring-4 focus:ring-[#A592FF]/10";

function FormField({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  value,
  onChange,
}: {
  id: keyof FormValues;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder: string;
  autoComplete?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2.5">
      <label
        htmlFor={id}
        className="block text-[15px] font-semibold tracking-tight text-[#292235]"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        className={inputClassName}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
}

function PasswordField({
  id,
  label,
  placeholder,
  autoComplete,
  value,
  visible,
  onChange,
  onToggle,
}: {
  id: "password" | "confirmPassword";
  label: string;
  placeholder: string;
  autoComplete?: string;
  value: string;
  visible: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onToggle: () => void;
}) {
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="space-y-2.5">
      <label
        htmlFor={id}
        className="block text-[15px] font-semibold tracking-tight text-[#292235]"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className={`${inputClassName} pr-12`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
        />
        <button
          type="button"
          aria-label={visible ? "Нууц үгийг нуух" : "Нууц үгийг харах"}
          onClick={onToggle}
          className="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#A49CB9] transition hover:bg-[#F6F3FF] hover:text-[#6F5AD8]"
        >
          <Icon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
export function StudentIllustration() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "720px",
        aspectRatio: "679 / 642.86",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-6%",
          borderRadius: "80px",
          background: "linear-gradient(180deg, #E9D0F7 0%, #B8CBF7 100%)",
          opacity: 0.45,
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "3%",
          borderRadius: "60px",
          background: "linear-gradient(180deg, #E9D0F7 0%, #B8CBF7 100%)",
          opacity: 0.72,
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "6%",
          borderRadius: "48px",
          background: "linear-gradient(180deg, #EDE0FA 0%, #C5D4F8 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "6%",
          borderRadius: "48px",
          background:
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.55) 0%, transparent 62%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "6%",
          borderRadius: "48px",
          border: "1.5px solid rgba(255,255,255,0.6)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "6%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          height: "60px",
          borderRadius: "9999px",
          background: "rgba(214, 204, 255, 0.5)",
          filter: "blur(32px)",
          pointerEvents: "none",
        }}
      />
      <Image
        src="/studentHome.png"
        alt="Student illustration"
        width={560}
        height={560}
        style={{
          position: "relative",
          zIndex: 10,
          width: "78%",
          height: "auto",
          maxWidth: "none",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          display: "block",
        }}
      />
    </div>
  );
}

export default function StudentPage() {
  const { user } = useUser();
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);

  const resolvedFormValues = useMemo<FormValues>(() => {
    return {
      ...formValues,
      email: formValues.email || user?.primaryEmailAddress?.emailAddress || "",
      firstName: formValues.firstName || user?.firstName || "",
      lastName: formValues.lastName || user?.lastName || "",
    };
  }, [formValues, user]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormValues((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (feedback) {
      setFeedback(null);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (resolvedFormValues.password.length < 8) {
      setFeedback({
        tone: "error",
        message: "Нууц үг хамгийн багадаа 8 тэмдэгттэй байх хэрэгтэй.",
      });
      return;
    }

    if (resolvedFormValues.password !== resolvedFormValues.confirmPassword) {
      setFeedback({
        tone: "error",
        message: "Нууц үг давтах талбар ижил биш байна.",
      });
      return;
    }

    setFeedback({
      tone: "success",
      message: `${resolvedFormValues.firstName || "Сурагч"}-ийн бүртгэлийн мэдээлэл бэлэн боллоо.`,
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FEFCFF]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_42%,rgba(183,169,255,0.24),transparent_24%),radial-gradient(circle_at_66%_52%,rgba(190,236,255,0.16),transparent_18%),linear-gradient(180deg,#FFFFFF_0%,#FEFBFF_100%)]" />

      <section className="mx-auto grid min-h-screen w-full max-w-[1320px] items-center gap-10 px-6 py-8 lg:grid-cols-[minmax(0,1.08fr)_420px] lg:gap-16 lg:px-10 lg:py-12">
        <div className="order-2 lg:order-1">
          <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-[42px] px-4 py-8 lg:min-h-[720px] lg:px-8">
            <StudentIllustration />
          </div>
        </div>

        <div className="order-1 w-full max-w-[420px] justify-self-end lg:order-2">
          <div className="space-y-1">
            <p className="text-[13px] font-semibold tracking-[0.24em] text-[#A29AB9] uppercase">
              Student Account
            </p>
            <h1 className="text-[40px] leading-tight font-semibold tracking-tight text-[#201A2F]">
              Бүртгүүлэх
            </h1>
          </div>

          {feedback ? (
            <div
              className={`mt-6 rounded-[18px] border px-4 py-3 text-[14px] ${feedback.tone === "success"
                  ? "border-[#D6F4DD] bg-[#F4FFF6] text-[#1E6E36]"
                  : "border-[#FFD8D8] bg-[#FFF7F7] text-[#B63B3B]"
                }`}
            >
              {feedback.message}
            </div>
          ) : null}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <FormField
              id="email"
              label="И-мэйл"
              type="email"
              autoComplete="email"
              placeholder="example@school.mn"
              value={resolvedFormValues.email}
              onChange={handleInputChange}
            />

            <FormField
              id="lastName"
              label="Овог"
              autoComplete="family-name"
              placeholder="Овог"
              value={resolvedFormValues.lastName}
              onChange={handleInputChange}
            />

            <FormField
              id="firstName"
              label="Нэр"
              autoComplete="given-name"
              placeholder="Нэр"
              value={resolvedFormValues.firstName}
              onChange={handleInputChange}
            />

            <FormField
              id="school"
              label="Сургууль"
              autoComplete="organization"
              placeholder="Сургууль"
              value={resolvedFormValues.school}
              onChange={handleInputChange}
            />

            <FormField
              id="grade"
              label="Анги"
              placeholder="Анги"
              value={resolvedFormValues.grade}
              onChange={handleInputChange}
            />

            <FormField
              id="group"
              label="Бүлэг"
              placeholder="Бүлэг"
              value={resolvedFormValues.group}
              onChange={handleInputChange}
            />

            <PasswordField
              id="password"
              label="Нууц үг"
              autoComplete="new-password"
              placeholder="........"
              value={resolvedFormValues.password}
              visible={showPassword}
              onChange={handleInputChange}
              onToggle={() => setShowPassword((previous) => !previous)}
            />

            <PasswordField
              id="confirmPassword"
              label="Нууц үг давтах"
              autoComplete="new-password"
              placeholder="........"
              value={resolvedFormValues.confirmPassword}
              visible={showConfirmPassword}
              onChange={handleInputChange}
              onToggle={() => setShowConfirmPassword((previous) => !previous)}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="h-12 min-w-[116px] cursor-pointer rounded-[16px] bg-[#9B85FF] px-7 text-[15px] font-semibold text-white shadow-[0_16px_30px_rgba(155,133,255,0.34)] hover:bg-[#8D74FC]"
              >
                Бүртгүүлэх
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
