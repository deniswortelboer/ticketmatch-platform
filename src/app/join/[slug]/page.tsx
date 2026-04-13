"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

const CODE_LENGTH = 8;

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const slug = (params.slug as string) || "";

  const [reseller, setReseller] = useState<{ name: string; id: string } | null>(null);
  const [loadingReseller, setLoadingReseller] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Registration form
  const [step, setStep] = useState<"form" | "code">("form");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("travel-agency");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const companyTypes = [
    { value: "tour-operator", label: "Tour Operator" },
    { value: "travel-agency", label: "Travel Agency / OTA" },
    { value: "dmc", label: "DMC (Destination Management)" },
    { value: "mice", label: "MICE / Event Agency" },
    { value: "corporate", label: "Corporate Travel" },
    { value: "cruise", label: "Cruise Line" },
    { value: "other", label: "Other" },
  ];

  // Look up reseller by slug
  useEffect(() => {
    const fetchReseller = async () => {
      try {
        const res = await fetch(`/api/reseller/lookup?slug=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          setReseller(data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
      setLoadingReseller(false);
    };
    if (slug) fetchReseller();
  }, [slug]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim() || !companyName.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });

    if (otpError) {
      setError(otpError.message);
      setLoading(false);
      return;
    }

    setSuccess(`Verification code sent to ${email}`);
    setStep("code");
    setLoading(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
      if (pasted.length >= CODE_LENGTH) {
        const newCode = pasted.split("").slice(0, CODE_LENGTH);
        setCode(newCode);
        inputRefs.current[CODE_LENGTH - 1]?.focus();
        setTimeout(() => verifyCode(newCode.join("")), 200);
        return;
      }
    }
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (digit && index === CODE_LENGTH - 1) {
      const fullCode = newCode.join("");
      if (fullCode.length === CODE_LENGTH) setTimeout(() => verifyCode(fullCode), 200);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (otpCode: string) => {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otpCode,
      type: "email",
    });

    if (verifyError) {
      setError("Invalid code. Please try again.");
      setCode(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setLoading(false);
      return;
    }

    // Create company + profile via register API
    if (data.user) {
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.user.id,
            companyName,
            companyType,
            phone,
            contactName: fullName,
            email: email.trim(),
            message: JSON.stringify({
              referred_by: reseller?.id || null,
              reseller_slug: slug,
            }),
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          // Profile might already exist
          if (!err.error?.includes("duplicate")) {
            setError(err.error || "Registration failed");
            setLoading(false);
            return;
          }
        }
      } catch {
        // Continue to dashboard anyway
      }
    }

    router.push("/dashboard");
    router.refresh();
  };

  if (loadingReseller) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50/30 px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6" /><path d="M9 9l6 6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Invalid Invite Link</h1>
          <p className="mt-2 text-muted">This reseller link doesn&apos;t exist or has expired.</p>
          <Link href="/auth/login" className="mt-6 inline-block rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-blue-800">
              <span className="text-sm font-bold text-white">TM</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Ticket<span className="text-accent">Match</span>
              <span className="text-muted">.ai</span>
            </span>
          </Link>

          {/* Reseller badge */}
          {reseller && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
              </svg>
              <span className="text-sm text-blue-700">
                Invited by <strong>{reseller.name}</strong>
              </span>
            </div>
          )}

          {step === "form" ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight">Join TicketMatch.ai</h1>
              <p className="mt-2 text-sm text-muted">
                Create your free account and start booking for your groups.
              </p>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
              )}

              <form className="mt-6 space-y-4" onSubmit={handleRegister}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Your name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Company name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Travel Agency"
                    required
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Company type</label>
                  <select
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                  >
                    {companyTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Phone <span className="text-muted">(optional)</span></label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+31 6 1234 5678"
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim() || !fullName.trim() || !companyName.trim()}
                  className="h-12 w-full rounded-xl bg-foreground text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending code...
                    </span>
                  ) : (
                    "Get Started"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-medium text-accent hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep("form"); setError(""); setCode(Array(CODE_LENGTH).fill("")); }}
                className="mb-6 flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
                </svg>
                Back
              </button>

              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="mt-2 text-sm text-muted">
                We sent a verification code to <span className="font-medium text-foreground">{email}</span>
              </p>

              {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}
              {success && !error && <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-600">{success}</div>}

              <div className="mt-8 flex justify-center gap-2">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={CODE_LENGTH}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
                      if (pasted.length >= CODE_LENGTH) {
                        e.preventDefault();
                        const newCode = pasted.split("").slice(0, CODE_LENGTH);
                        setCode(newCode);
                        inputRefs.current[CODE_LENGTH - 1]?.focus();
                        setTimeout(() => verifyCode(pasted.slice(0, CODE_LENGTH)), 200);
                      }
                    }}
                    disabled={loading}
                    className={`h-13 w-11 rounded-xl border-2 text-center text-lg font-bold outline-none transition-all ${
                      digit ? "border-accent bg-accent/5 text-foreground" : "border-border bg-white text-foreground"
                    } focus:border-accent focus:ring-2 focus:ring-accent/10 disabled:opacity-50`}
                  />
                ))}
              </div>

              {loading && (
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-accent">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
                  Verifying...
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right — visual */}
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50/30 lg:flex">
        <div className="max-w-md px-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/10 text-accent">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Book group tickets at B2B rates
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Access museums, attractions and city experiences for your tour groups. All in one platform.
          </p>
          {reseller && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Partner of {reseller.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
