"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id, companies(name, message)")
        .eq("id", user.id)
        .single();

      const companies = profile?.companies as unknown as { name: string; message: string } | { name: string; message: string }[] | null;
      const comp = Array.isArray(companies) ? companies[0] : companies;
      setCompanyName(comp?.name || "Your company");

      // If already approved, redirect to dashboard
      try {
        const msg = comp?.message ? JSON.parse(comp.message) : {};
        if (msg.approved === true) {
          router.push("/dashboard");
          return;
        }
      } catch {}
    };
    load();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="rounded-2xl bg-white shadow-xl shadow-blue-900/5 border border-border/60 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0f1729] to-[#1a2744] px-8 py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/25">
              <span className="text-lg font-bold text-white">TM</span>
            </div>
            <h1 className="text-xl font-semibold text-white">
              Ticket<span className="text-blue-400">Match</span>
            </h1>
          </div>

          {/* Content */}
          <div className="px-8 py-8 text-center">
            {/* Clock icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-[#0f1729] mb-2">
              Account Under Review
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              {companyName && (
                <span className="font-medium text-gray-700">{companyName}</span>
              )}
            </p>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Your account is being reviewed by our team. This usually takes less than
              <span className="font-semibold text-gray-700"> 24 hours</span>.
              You will receive an email once your account has been approved.
            </p>

            {/* Info box */}
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 mb-6">
              <p className="text-xs text-blue-700 font-medium mb-1">Need help?</p>
              <p className="text-xs text-blue-600">
                Contact us at{" "}
                <a href="mailto:hello@ticketmatch.ai" className="font-semibold underline underline-offset-2 hover:text-blue-800">
                  hello@ticketmatch.ai
                </a>
              </p>
            </div>

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
