"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function RefPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string) || "";

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [referrer, setReferrer] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await fetch(`/api/affiliate/lookup?code=${encodeURIComponent(code)}`);
        if (res.ok) {
          const data = await res.json();
          setReferrer(data);

          // Set cookie for 30 days so it persists through registration (including OAuth)
          document.cookie = `affiliate_ref=${code};path=/;max-age=${30 * 24 * 60 * 60};SameSite=Lax`;

          // Redirect to registration with ref param
          router.push(`/auth/register?ref=${code}`);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    };

    if (code) validate();
  }, [code, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-blue-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500">Validating referral link...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-blue-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Invalid Referral Link</h1>
          <p className="mt-2 text-gray-500">This referral code is not valid or has expired.</p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/auth/register" className="rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors">
              Register without referral
            </Link>
            <Link href="/auth/login" className="rounded-xl border border-border px-6 py-3 text-sm font-medium hover:bg-gray-50 transition-colors">
              Sign in to existing account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If we got here and referrer is set, we're redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-blue-50">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        <p className="mt-4 text-sm text-gray-500">
          Redirecting you to registration{referrer ? ` — referred by ${referrer.name}` : ""}...
        </p>
      </div>
    </div>
  );
}
