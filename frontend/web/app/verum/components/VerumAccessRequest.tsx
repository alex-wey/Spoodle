"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  GraduationCap,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVMA_ACCREDITED_SCHOOLS } from "../lib/avmaSchools";
import { US_STATES } from "../lib/usStates";
import {
  isBypassEmail,
  writeVerumBypassSession,
  writeVerumStudentSession,
} from "../lib/verumAccessSession";
import { useVerum } from "./VerumContext";

/** Primary accent — matches Verum confirm / platform green (ProfileView, modals) */
const SPOODLE_GREEN = "#3BB272";

type Role = "veterinarian" | "student" | null;
type Step = "role" | "vet_form" | "student_form" | "confirm_student" | "confirm_pending";

function isEduEmail(email: string): boolean {
  const t = email.trim().toLowerCase();
  const at = t.lastIndexOf("@");
  if (at < 0) return false;
  return t.slice(at).endsWith(".edu");
}

const inputClass =
  "h-11 rounded-xl border-white/10 bg-white/[0.06] text-[15px] text-white shadow-inner placeholder:text-white/40 " +
  "focus-visible:border-[#4559A7]/60 focus-visible:ring-2 focus-visible:ring-[#4559A7]/30 transition-[border-color,box-shadow]";

const selectTriggerClass =
  "h-11 rounded-xl border-white/10 bg-white/[0.06] text-[15px] text-white shadow-inner " +
  "focus:ring-2 focus:ring-[#4559A7]/30 data-[placeholder]:text-white/40";

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45";

export default function VerumAccessRequest({ onGranted }: { onGranted: () => void }) {
  const { resetToDemo, updateProfile } = useVerum();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role>(null);

  const [vetName, setVetName] = useState("");
  const [vetEmail, setVetEmail] = useState("");
  const [vetState, setVetState] = useState("");
  const [vetLicense, setVetLicense] = useState("");
  const [vetPractice, setVetPractice] = useState("");

  const [stuName, setStuName] = useState("");
  const [stuEmail, setStuEmail] = useState("");
  const [stuSchool, setStuSchool] = useState("");
  const [stuYear, setStuYear] = useState("");

  const [studentEmailError, setStudentEmailError] = useState("");

  const eduValid = useMemo(() => isBypassEmail(stuEmail), [stuEmail]);
  const studentBypassReady = useMemo(() => isBypassEmail(stuEmail), [stuEmail]);
  const studentCanSubmit = isBypassEmail(stuEmail) && stuName.trim() && stuSchool && stuYear.trim();

  const handleRoleSelect = (r: NonNullable<Role>) => {
    setRole(r);
  };

  const goToRoleForm = () => {
    if (!role) return;
    setStep(role === "veterinarian" ? "vet_form" : "student_form");
  };

  const handleVetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBypassEmail(vetEmail)) {
      writeVerumBypassSession();
      resetToDemo();
      onGranted();
      return;
    }
    if (!vetName.trim() || !vetEmail.trim() || !vetState || !vetLicense.trim()) return;
    setStep("confirm_pending");
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentEmailError("");
    if (isBypassEmail(stuEmail)) {
      writeVerumBypassSession();
      resetToDemo();
      onGranted();
      return;
    }
    // Only approved emails can access
    if (!stuEmail.includes('@') || stuEmail.length < 3) {
      setStudentEmailError("Please enter a valid email address");
      return;
    }
    // Block access for non-approved emails
    setStudentEmailError("This email is not authorized. Please contact support for access.");
    return;
  };

  const handleStudentContinue = () => {
    const parts = stuName.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || parts[0] || "";
    const fullName = stuName.trim();
    writeVerumStudentSession({
      firstName,
      lastName,
      email: stuEmail.trim(),
      fullName,
    });
    updateProfile({ name: fullName, email: stuEmail.trim() });
    onGranted();
  };

  const resetFlow = () => {
    setStep("role");
    setRole(null);
    setStudentEmailError("");
  };

  const primaryButtonClass =
    "h-12 w-full rounded-xl text-[15px] font-semibold shadow-lg transition-all " +
    "hover:brightness-110 hover:shadow-xl active:scale-[0.99] disabled:opacity-40 disabled:hover:brightness-100 disabled:active:scale-100";

  return (
    <div className="relative flex h-dvh w-full min-h-0 flex-col overflow-hidden text-foreground">
      {/* Background — aligned with Verum chat atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222,47%,8%)] via-[hsl(230,35%,12%)] to-[hsl(222,40%,10%)]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-0 h-96 w-96 rounded-full bg-[#4559A7]/30 blur-3xl mix-blend-screen" />
        <div className="absolute -right-10 top-24 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl mix-blend-screen" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-[#3BB272]/12 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          <div className="flex min-h-full w-full flex-col justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-8">
            <div className="mx-auto w-full max-w-[440px] space-y-6 sm:space-y-8">
          {/* Header */}
          <header className="flex flex-col items-center text-center">
            <div className="relative mb-5 h-24 w-[min(100%,300px)] sm:mb-6 sm:h-28 sm:w-[min(100%,360px)] md:h-32 md:w-[min(100%,420px)]">
              <Image
                src="/spoodle-logo.png"
                alt="Spoodle"
                fill
                sizes="(max-width: 640px) 300px, (max-width: 768px) 360px, 420px"
                className="object-contain object-center drop-shadow-md"
                priority
              />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Request access
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/55">
              Evidence-based literature tools for veterinarians and veterinary students.
            </p>
          </header>

          {/* Panel */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
            {step === "role" && (
              <div className="space-y-6">
                <p className="text-center text-sm font-medium text-white/60">How would you describe yourself?</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("veterinarian")}
                    className={`group relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all duration-200 sm:p-5 ${
                      role === "veterinarian"
                        ? "border-[#3BB272] bg-[#3BB272]/[0.08] shadow-[0_0_24px_-4px_rgba(59,178,114,0.45)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div
                      className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                        role === "veterinarian" ? "bg-[#3BB272]/20 text-[#3BB272]" : "bg-white/10 text-white/70"
                      }`}
                    >
                      <Stethoscope className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <span className="font-semibold text-white">Veterinarian</span>
                    <span className="mt-1 text-xs leading-snug text-white/50">
                      Licensed DVM — credential review before access
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("student")}
                    className={`group relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all duration-200 sm:p-5 ${
                      role === "student"
                        ? "border-[#3BB272] bg-[#3BB272]/[0.08] shadow-[0_0_24px_-4px_rgba(59,178,114,0.45)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div
                      className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                        role === "student" ? "bg-[#3BB272]/20 text-[#3BB272]" : "bg-white/10 text-white/70"
                      }`}
                    >
                      <GraduationCap className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <span className="font-semibold text-white">Vet student</span>
                    <span className="mt-1 text-xs leading-snug text-white/50">
                      Currently enrolled in veterinary school
                    </span>
                  </button>
                </div>
                <Button
                  type="button"
                  disabled={!role}
                  onClick={goToRoleForm}
                  className={primaryButtonClass}
                  style={
                    role
                      ? { backgroundColor: SPOODLE_GREEN, color: "#fff" }
                      : { backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }
                  }
                >
                  Continue
                </Button>
              </div>
            )}

            {step === "vet_form" && (
              <form onSubmit={handleVetSubmit} className="space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Veterinarian credentialing</h2>
                    <p className="mt-1 text-xs text-white/45">We verify licenses with state boards.</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetFlow}
                    className="-mr-2 h-9 shrink-0 gap-1 rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vet-name" className={labelClass}>
                      Full name
                    </Label>
                    <Input
                      id="vet-name"
                      value={vetName}
                      onChange={(e) => setVetName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vet-email" className={labelClass}>
                      Email
                    </Label>
                    <Input
                      id="vet-email"
                      type="email"
                      value={vetEmail}
                      onChange={(e) => setVetEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>State of licensure</Label>
                    <Select value={vetState} onValueChange={setVetState}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 rounded-xl border-white/10 bg-[hsl(222,47%,14%)] text-foreground">
                        {US_STATES.map((s) => (
                          <SelectItem key={s.value} value={s.value} className="rounded-lg focus:bg-white/10">
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vet-license" className={labelClass}>
                      License number
                    </Label>
                    <Input
                      id="vet-license"
                      value={vetLicense}
                      onChange={(e) => setVetLicense(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vet-practice" className={labelClass}>
                      Practice name <span className="font-normal normal-case tracking-normal text-white/35">(optional)</span>
                    </Label>
                    <Input
                      id="vet-practice"
                      value={vetPractice}
                      onChange={(e) => setVetPractice(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className={primaryButtonClass}
                  style={{ backgroundColor: SPOODLE_GREEN, color: "#fff" }}
                >
                  Submit for review
                </Button>
              </form>
            )}

            {step === "student_form" && (
              <form onSubmit={handleStudentSubmit} className="space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Student access</h2>
                    <p className="mt-1 text-xs text-white/45">Access is restricted to approved emails only.</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetFlow}
                    className="-mr-2 h-9 shrink-0 gap-1 rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stu-name" className={labelClass}>
                      Full name
                    </Label>
                    <Input
                      id="stu-name"
                      value={stuName}
                      onChange={(e) => setStuName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stu-email" className={labelClass}>
                      School email
                    </Label>
                    <Input
                      id="stu-email"
                      type="email"
                      value={stuEmail}
                      onChange={(e) => {
                        setStuEmail(e.target.value);
                        setStudentEmailError("");
                      }}
                      className={inputClass}
                    />
                    {stuEmail && (
                      <p
                        className={`flex items-center gap-1.5 text-xs ${
                          studentBypassReady ? "text-emerald-400/90" : "text-red-400/90"
                        }`}
                      >
                        {studentBypassReady ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            Email accepted
                          </>
                        ) : (
                          "This email is not authorized"
                        )}
                      </p>
                    )}
                    {studentEmailError && <p className="text-xs text-red-400/90">{studentEmailError}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>AVMA-accredited school</Label>
                    <Select value={stuSchool} onValueChange={setStuSchool}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Select your school" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 rounded-xl border-white/10 bg-[hsl(222,47%,14%)] text-foreground">
                        {AVMA_ACCREDITED_SCHOOLS.map((school) => (
                          <SelectItem key={school} value={school} className="rounded-lg focus:bg-white/10">
                            {school}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stu-year" className={labelClass}>
                      Expected graduation year
                    </Label>
                    <Input
                      id="stu-year"
                      type="number"
                      min={new Date().getFullYear()}
                      max={new Date().getFullYear() + 8}
                      value={stuYear}
                      onChange={(e) => setStuYear(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={!studentCanSubmit}
                  className={primaryButtonClass}
                  style={{ backgroundColor: SPOODLE_GREEN, color: "#fff" }}
                >
                  Verify &amp; continue
                </Button>
              </form>
            )}

            {step === "confirm_student" && (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 className="h-9 w-9" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Welcome, {stuName.trim().split(/\s+/)[0]}!
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    Your email is confirmed. Continue to access Verum with the profile you provided.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleStudentContinue}
                  className={primaryButtonClass}
                  style={{ backgroundColor: SPOODLE_GREEN, color: "#fff" }}
                >
                  Continue to Spoodle
                </Button>
              </div>
            )}

            {step === "confirm_pending" && (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4559A7]/25 text-[#7c8fd4]">
                  <Clock className="h-8 w-8" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Thank you, {vetName.trim().split(/\s+/)[0]}!
                  </h2>
                  <p className="mt-3 text-left text-sm leading-relaxed text-white/55">
                    Your license details are with our team for verification with your state board. We&apos;ll email{" "}
                    <span className="font-medium text-white/85">{vetEmail}</span> when your Spoodle access is approved —
                    usually within <span className="text-white/70">1–2 business days</span>.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFlow}
                  className="h-12 w-full rounded-xl border-white/15 bg-transparent text-white/85 hover:bg-white/10 hover:text-white"
                >
                  Return to start
                </Button>
              </div>
            )}
          </div>

              <p className="pb-2 text-center text-[11px] leading-relaxed text-white/35 sm:pb-0">
                Spoodle surfaces licensed veterinary literature for research workflows. It does not replace clinical judgment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
