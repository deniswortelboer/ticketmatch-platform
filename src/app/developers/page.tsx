"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const CODE_LENGTH = 8;

export default function DevelopersPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "code">("form");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [apiDocsUrl, setApiDocsUrl] = useState("");
  const [techStack, setTechStack] = useState("");
  const [useCase, setUseCase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    if (data.user) {
      try {
        await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.user.id,
            companyName,
            companyType: "developer",
            phone,
            contactName: fullName,
            email: email.trim(),
            message: JSON.stringify({
              role: "developer",
              api_docs_url: apiDocsUrl,
              tech_stack: techStack,
              use_case: useCase,
            }),
          }),
        });
      } catch {
        // Continue anyway
      }
    }

    router.push("/dashboard/partner/docs");
    router.refresh();
  };

  const benefits = [
    { title: "API Integration", desc: "Connect your venue system directly to our platform via REST API", icon: "code" },
    { title: "Developer Docs", desc: "Full API documentation, SDKs, and code examples in any language", icon: "book" },
    { title: "Developer Agent", desc: "AI assistant trained on our API that generates integration code", icon: "bot" },
    { title: "Sandbox Environment", desc: "Test your integration safely before going live", icon: "shield" },
  ];

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

          {step === "form" ? (
            <>
              <div className="mb-2 inline-flex items-center rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-medium text-purple-700">
                Developer Program
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Apply as Developer</h1>
              <p className="mt-2 text-sm text-muted">
                Integrate your platform with TicketMatch.ai. Get API access, developer docs, and a dedicated AI assistant.
              </p>

              {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}

              <form className="mt-6 space-y-4" onSubmit={handleRegister}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Your name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jan de Vries" required className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Company</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your Company" required className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dev@company.com" required className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">API documentation URL <span className="text-muted">(optional)</span></label>
                  <input type="url" value={apiDocsUrl} onChange={(e) => setApiDocsUrl(e.target.value)} placeholder="https://docs.yourapi.com" className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Tech stack <span className="text-muted">(optional)</span></label>
                  <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="REST API, Node.js, PostgreSQL..." className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Phone <span className="text-muted">(optional)</span></label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+31 6 1234 5678" className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">What do you want to integrate? <span className="text-muted">(optional)</span></label>
                  <textarea value={useCase} onChange={(e) => setUseCase(e.target.value)} placeholder="Describe your platform and what you'd like to connect to TicketMatch..." rows={3} className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none" />
                </div>
                <button type="submit" disabled={loading || !email.trim() || !fullName.trim() || !companyName.trim()} className="h-12 w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending code...
                    </span>
                  ) : (
                    "Apply as Developer"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-medium text-accent hover:underline">Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => { setStep("form"); setError(""); setCode(Array(CODE_LENGTH).fill("")); }} className="mb-6 flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
                Back
              </button>

              <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="mt-2 text-sm text-muted">We sent a verification code to <span className="font-medium text-foreground">{email}</span></p>

              {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}
              {success && !error && <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-600">{success}</div>}

              <div className="mt-8 flex justify-center gap-2">
                {code.map((digit, i) => (
                  <input key={i} ref={(el) => { inputRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={CODE_LENGTH} value={digit} onChange={(e) => handleCodeChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)} onPaste={(e) => { const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH); if (pasted.length >= CODE_LENGTH) { e.preventDefault(); const newCode = pasted.split("").slice(0, CODE_LENGTH); setCode(newCode); inputRefs.current[CODE_LENGTH - 1]?.focus(); setTimeout(() => verifyCode(pasted.slice(0, CODE_LENGTH)), 200); } }} disabled={loading} className={`h-13 w-11 rounded-xl border-2 text-center text-lg font-bold outline-none transition-all ${digit ? "border-accent bg-accent/5 text-foreground" : "border-border bg-white text-foreground"} focus:border-accent focus:ring-2 focus:ring-accent/10 disabled:opacity-50`} />
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

      {/* Right — benefits */}
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50/30 lg:flex">
        <div className="max-w-md px-12">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-2">Developer Program</h2>
          <p className="text-sm text-muted text-center mb-8">Everything you need to integrate with TicketMatch</p>
          <div className="space-y-5">
            {benefits.map((b) => (
              <div key={b.title} className="flex items-start gap-4 rounded-2xl bg-white/80 border border-purple-100 p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  {b.icon === "code" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>}
                  {b.icon === "book" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>}
                  {b.icon === "bot" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>}
                  {b.icon === "shield" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{b.title}</h3>
                  <p className="text-sm text-muted mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
