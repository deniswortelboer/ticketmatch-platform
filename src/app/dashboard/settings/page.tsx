"use client";

import { useEffect, useState, useCallback } from "react";
import { useCurrency } from "@/components/CurrencySelector";
import { CURRENCIES } from "@/lib/currency";
import UpgradeLock from "@/components/UpgradeLock";
import { createClient } from "@/lib/supabase";

type Profile = {
  full_name: string;
  email: string;
};

type Company = {
  id: string;
  name: string;
  company_type: string;
  phone: string;
  kvk_number: string;
  vat_number: string;
  plan: string;
  plan_id: string;
  plan_activated_at: string;
};

type TeamMember = {
  id: string;
  full_name: string;
  email: string;
  role: string;
};

const COUNTRIES = [
  { code: "NL", name: "Netherlands", flag: "\ud83c\uddf3\ud83c\uddf1" },
  { code: "BE", name: "Belgium", flag: "\ud83c\udde7\ud83c\uddea" },
  { code: "DE", name: "Germany", flag: "\ud83c\udde9\ud83c\uddea" },
  { code: "FR", name: "France", flag: "\ud83c\uddeb\ud83c\uddf7" },
  { code: "GB", name: "United Kingdom", flag: "\ud83c\uddec\ud83c\udde7" },
  { code: "US", name: "United States", flag: "\ud83c\uddfa\ud83c\uddf8" },
  { code: "ES", name: "Spain", flag: "\ud83c\uddea\ud83c\uddf8" },
  { code: "IT", name: "Italy", flag: "\ud83c\uddee\ud83c\uddf9" },
  { code: "PT", name: "Portugal", flag: "\ud83c\uddf5\ud83c\uddf9" },
  { code: "AT", name: "Austria", flag: "\ud83c\udde6\ud83c\uddf9" },
  { code: "CH", name: "Switzerland", flag: "\ud83c\udde8\ud83c\udded" },
  { code: "SE", name: "Sweden", flag: "\ud83c\uddf8\ud83c\uddea" },
  { code: "NO", name: "Norway", flag: "\ud83c\uddf3\ud83c\uddf4" },
  { code: "DK", name: "Denmark", flag: "\ud83c\udde9\ud83c\uddf0" },
  { code: "PL", name: "Poland", flag: "\ud83c\uddf5\ud83c\uddf1" },
  { code: "CZ", name: "Czech Republic", flag: "\ud83c\udde8\ud83c\uddff" },
  { code: "IE", name: "Ireland", flag: "\ud83c\uddee\ud83c\uddea" },
  { code: "CN", name: "China", flag: "\ud83c\udde8\ud83c\uddf3" },
  { code: "TW", name: "Taiwan", flag: "\ud83c\uddf9\ud83c\uddfc" },
  { code: "JP", name: "Japan", flag: "\ud83c\uddef\ud83c\uddf5" },
  { code: "KR", name: "South Korea", flag: "\ud83c\uddf0\ud83c\uddf7" },
  { code: "SG", name: "Singapore", flag: "\ud83c\uddf8\ud83c\uddec" },
  { code: "AU", name: "Australia", flag: "\ud83c\udde6\ud83c\uddfa" },
  { code: "CA", name: "Canada", flag: "\ud83c\udde8\ud83c\udde6" },
  { code: "BR", name: "Brazil", flag: "\ud83c\udde7\ud83c\uddf7" },
  { code: "MX", name: "Mexico", flag: "\ud83c\uddf2\ud83c\uddfd" },
  { code: "AE", name: "United Arab Emirates", flag: "\ud83c\udde6\ud83c\uddea" },
  { code: "SA", name: "Saudi Arabia", flag: "\ud83c\uddf8\ud83c\udde6" },
  { code: "IN", name: "India", flag: "\ud83c\uddee\ud83c\uddf3" },
  { code: "TH", name: "Thailand", flag: "\ud83c\uddf9\ud83c\udded" },
  { code: "ID", name: "Indonesia", flag: "\ud83c\uddee\ud83c\udde9" },
  { code: "MY", name: "Malaysia", flag: "\ud83c\uddf2\ud83c\uddfe" },
  { code: "ZA", name: "South Africa", flag: "\ud83c\uddff\ud83c\udde6" },
  { code: "TR", name: "Turkey", flag: "\ud83c\uddf9\ud83c\uddf7" },
  { code: "RU", name: "Russia", flag: "\ud83c\uddf7\ud83c\uddfa" },
  { code: "OTHER", name: "Other", flag: "\ud83c\udf0d" },
];

// Country-specific field labels, placeholders, and formats
function getCountryFields(code: string) {
  const fields: Record<string, { regLabel: string; regPlaceholder: string; taxLabel: string; taxPlaceholder: string; phonePlaceholder: string; cityLabel: string; addressLabel: string; postalLabel: string }> = {
    NL: { regLabel: "KVK Number", regPlaceholder: "12345678", taxLabel: "BTW Number", taxPlaceholder: "NL123456789B01", phonePlaceholder: "+31 6 1234 5678", cityLabel: "City", addressLabel: "Address", postalLabel: "Postal Code" },
    BE: { regLabel: "KBO/BCE Number", regPlaceholder: "0123.456.789", taxLabel: "BTW Number", taxPlaceholder: "BE0123456789", phonePlaceholder: "+32 470 12 34 56", cityLabel: "City", addressLabel: "Address", postalLabel: "Postal Code" },
    DE: { regLabel: "Handelsregisternummer", regPlaceholder: "HRB 12345", taxLabel: "USt-IdNr", taxPlaceholder: "DE123456789", phonePlaceholder: "+49 170 1234567", cityLabel: "Stadt", addressLabel: "Adresse", postalLabel: "PLZ" },
    FR: { regLabel: "SIRET Number", regPlaceholder: "123 456 789 00012", taxLabel: "TVA Number", taxPlaceholder: "FR12345678901", phonePlaceholder: "+33 6 12 34 56 78", cityLabel: "Ville", addressLabel: "Adresse", postalLabel: "Code Postal" },
    GB: { regLabel: "Company Number", regPlaceholder: "12345678", taxLabel: "VAT Number", taxPlaceholder: "GB123456789", phonePlaceholder: "+44 7700 900000", cityLabel: "City", addressLabel: "Address", postalLabel: "Postcode" },
    US: { regLabel: "EIN (Employer ID)", regPlaceholder: "12-3456789", taxLabel: "Tax ID", taxPlaceholder: "12-3456789", phonePlaceholder: "+1 (555) 123-4567", cityLabel: "City", addressLabel: "Address", postalLabel: "ZIP Code" },
    ES: { regLabel: "CIF Number", regPlaceholder: "B12345678", taxLabel: "NIF/IVA Number", taxPlaceholder: "ESB12345678", phonePlaceholder: "+34 612 345 678", cityLabel: "Ciudad", addressLabel: "Direccion", postalLabel: "Codigo Postal" },
    IT: { regLabel: "REA Number", regPlaceholder: "MI-1234567", taxLabel: "Partita IVA", taxPlaceholder: "IT12345678901", phonePlaceholder: "+39 312 345 6789", cityLabel: "Citta", addressLabel: "Indirizzo", postalLabel: "CAP" },
    PT: { regLabel: "NIPC Number", regPlaceholder: "123456789", taxLabel: "NIF Number", taxPlaceholder: "PT123456789", phonePlaceholder: "+351 912 345 678", cityLabel: "Cidade", addressLabel: "Morada", postalLabel: "Codigo Postal" },
    AT: { regLabel: "Firmenbuchnummer", regPlaceholder: "FN 12345a", taxLabel: "UID-Nummer", taxPlaceholder: "ATU12345678", phonePlaceholder: "+43 664 1234567", cityLabel: "Stadt", addressLabel: "Adresse", postalLabel: "PLZ" },
    CH: { regLabel: "UID Number", regPlaceholder: "CHE-123.456.789", taxLabel: "MWST Number", taxPlaceholder: "CHE-123.456.789 MWST", phonePlaceholder: "+41 79 123 45 67", cityLabel: "Stadt / Ville", addressLabel: "Adresse", postalLabel: "PLZ / NPA" },
    SE: { regLabel: "Org. Number", regPlaceholder: "123456-7890", taxLabel: "VAT Number (Moms)", taxPlaceholder: "SE123456789001", phonePlaceholder: "+46 70 123 45 67", cityLabel: "Stad", addressLabel: "Adress", postalLabel: "Postnummer" },
    NO: { regLabel: "Org. Number", regPlaceholder: "123 456 789", taxLabel: "MVA Number", taxPlaceholder: "NO123456789MVA", phonePlaceholder: "+47 412 34 567", cityLabel: "By", addressLabel: "Adresse", postalLabel: "Postnummer" },
    DK: { regLabel: "CVR Number", regPlaceholder: "12345678", taxLabel: "VAT Number (Moms)", taxPlaceholder: "DK12345678", phonePlaceholder: "+45 12 34 56 78", cityLabel: "By", addressLabel: "Adresse", postalLabel: "Postnummer" },
    PL: { regLabel: "KRS Number", regPlaceholder: "0000123456", taxLabel: "NIP Number", taxPlaceholder: "PL1234567890", phonePlaceholder: "+48 512 345 678", cityLabel: "Miasto", addressLabel: "Adres", postalLabel: "Kod pocztowy" },
    CZ: { regLabel: "ICO Number", regPlaceholder: "12345678", taxLabel: "DIC Number", taxPlaceholder: "CZ12345678", phonePlaceholder: "+420 601 234 567", cityLabel: "Mesto", addressLabel: "Adresa", postalLabel: "PSC" },
    IE: { regLabel: "CRO Number", regPlaceholder: "123456", taxLabel: "VAT Number", taxPlaceholder: "IE1234567T", phonePlaceholder: "+353 85 123 4567", cityLabel: "City", addressLabel: "Address", postalLabel: "Eircode" },
    CN: { regLabel: "USCC (统一社会信用代码)", regPlaceholder: "91110000MA12345X6Y", taxLabel: "Tax Registration (税号)", taxPlaceholder: "91110000MA12345X6Y", phonePlaceholder: "+86 138 0000 0000", cityLabel: "City (城市)", addressLabel: "Address (地址)", postalLabel: "Postal Code (邮编)" },
    TW: { regLabel: "UBN (統一編號)", regPlaceholder: "12345678", taxLabel: "Tax ID (統一編號)", taxPlaceholder: "12345678", phonePlaceholder: "+886 912 345 678", cityLabel: "City (城市)", addressLabel: "Address (地址)", postalLabel: "Postal Code (郵遞區號)" },
    JP: { regLabel: "Corporate Number (法人番号)", regPlaceholder: "1234567890123", taxLabel: "Tax Number", taxPlaceholder: "T1234567890123", phonePlaceholder: "+81 90 1234 5678", cityLabel: "City (市)", addressLabel: "Address (住所)", postalLabel: "Postal Code (〒)" },
    KR: { regLabel: "Business Reg. Number (사업자등록번호)", regPlaceholder: "123-45-67890", taxLabel: "Tax ID", taxPlaceholder: "123-45-67890", phonePlaceholder: "+82 10 1234 5678", cityLabel: "City (시)", addressLabel: "Address (주소)", postalLabel: "Postal Code (우편번호)" },
    SG: { regLabel: "UEN Number", regPlaceholder: "201812345A", taxLabel: "GST Registration", taxPlaceholder: "M12345678A", phonePlaceholder: "+65 9123 4567", cityLabel: "City", addressLabel: "Address", postalLabel: "Postal Code" },
    AU: { regLabel: "ABN (Business Number)", regPlaceholder: "12 345 678 901", taxLabel: "GST Number", taxPlaceholder: "12 345 678 901", phonePlaceholder: "+61 412 345 678", cityLabel: "City", addressLabel: "Address", postalLabel: "Postcode" },
    CA: { regLabel: "Business Number (BN)", regPlaceholder: "123456789", taxLabel: "GST/HST Number", taxPlaceholder: "123456789RT0001", phonePlaceholder: "+1 (416) 123-4567", cityLabel: "City", addressLabel: "Address", postalLabel: "Postal Code" },
    BR: { regLabel: "CNPJ", regPlaceholder: "12.345.678/0001-90", taxLabel: "Tax ID (CNPJ)", taxPlaceholder: "12.345.678/0001-90", phonePlaceholder: "+55 11 91234-5678", cityLabel: "Cidade", addressLabel: "Endereco", postalLabel: "CEP" },
    MX: { regLabel: "RFC Number", regPlaceholder: "ABC123456XY0", taxLabel: "RFC Number", taxPlaceholder: "ABC123456XY0", phonePlaceholder: "+52 55 1234 5678", cityLabel: "Ciudad", addressLabel: "Direccion", postalLabel: "Codigo Postal" },
    AE: { regLabel: "Trade License Number", regPlaceholder: "12345", taxLabel: "TRN (Tax Reg.)", taxPlaceholder: "100123456789003", phonePlaceholder: "+971 50 123 4567", cityLabel: "City / Emirate", addressLabel: "Address", postalLabel: "P.O. Box" },
    SA: { regLabel: "CR Number (سجل تجاري)", regPlaceholder: "1010123456", taxLabel: "VAT Number", taxPlaceholder: "300123456789003", phonePlaceholder: "+966 50 123 4567", cityLabel: "City (مدينة)", addressLabel: "Address (عنوان)", postalLabel: "Postal Code" },
    IN: { regLabel: "CIN / LLPIN", regPlaceholder: "U12345MH2020PTC123456", taxLabel: "GSTIN", taxPlaceholder: "22AAAAA0000A1Z5", phonePlaceholder: "+91 98765 43210", cityLabel: "City", addressLabel: "Address", postalLabel: "PIN Code" },
    TH: { regLabel: "Tax ID (เลขประจำตัวผู้เสียภาษี)", regPlaceholder: "0123456789012", taxLabel: "VAT Number", taxPlaceholder: "0123456789012", phonePlaceholder: "+66 81 234 5678", cityLabel: "City (เมือง)", addressLabel: "Address (ที่อยู่)", postalLabel: "Postal Code (รหัสไปรษณีย์)" },
    ID: { regLabel: "NIB Number", regPlaceholder: "1234567890123", taxLabel: "NPWP Number", taxPlaceholder: "12.345.678.9-012.000", phonePlaceholder: "+62 812 3456 7890", cityLabel: "City (Kota)", addressLabel: "Address (Alamat)", postalLabel: "Postal Code (Kode Pos)" },
    MY: { regLabel: "SSM Registration", regPlaceholder: "201901012345", taxLabel: "SST Number", taxPlaceholder: "W10-1234-56789012", phonePlaceholder: "+60 12 345 6789", cityLabel: "City (Bandar)", addressLabel: "Address (Alamat)", postalLabel: "Postcode (Poskod)" },
    ZA: { regLabel: "CIPC Registration", regPlaceholder: "2019/123456/07", taxLabel: "VAT Number", taxPlaceholder: "4123456789", phonePlaceholder: "+27 71 123 4567", cityLabel: "City", addressLabel: "Address", postalLabel: "Postal Code" },
    TR: { regLabel: "MERSIS Number", regPlaceholder: "0123456789012345", taxLabel: "Tax Number (Vergi No)", taxPlaceholder: "1234567890", phonePlaceholder: "+90 532 123 45 67", cityLabel: "Sehir", addressLabel: "Adres", postalLabel: "Posta Kodu" },
    RU: { regLabel: "OGRN Number", regPlaceholder: "1234567890123", taxLabel: "INN Number", taxPlaceholder: "1234567890", phonePlaceholder: "+7 912 345 67 89", cityLabel: "Gorod (Город)", addressLabel: "Adres (Адрес)", postalLabel: "Index (Индекс)" },
  };

  return fields[code] || {
    regLabel: "Company Registration Number",
    regPlaceholder: "Registration number",
    taxLabel: "Tax / VAT Number",
    taxPlaceholder: "Tax number",
    phonePlaceholder: "+00 000 000 0000",
    cityLabel: "City",
    addressLabel: "Address",
    postalLabel: "Postal Code",
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<Profile>({ full_name: "", email: "" });
  const [country, setCountry] = useState("NL");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [company, setCompany] = useState<Company>({ id: "", name: "", company_type: "", phone: "", kvk_number: "", vat_number: "", plan: "free", plan_id: "", plan_activated_at: "" });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { currency, setCurrency: setCurrencyPref } = useCurrency();
  const [notifications, setNotifications] = useState({
    booking_confirmations: true,
    booking_reminders: true,
    status_updates: true,
    new_venues: true,
    weekly_summary: false,
    monthly_report: false,
    marketing: false,
    whatsapp_enabled: false,
    whatsapp_number: "",
    // Billing notifications (added 2026-04-22)
    payment_succeeded: true,
    payment_failed: true,
    invoice_ready: true,
    subscription_renewed: true,
    subscription_renewal_warning: true,
    subscription_cancelled: true,
    payment_method_expiring: true,
  });

  // White Label state
  const [whitelabel, setWhitelabel] = useState({
    logo: "" as string,
    primaryColor: "#2563EB",
    secondaryColor: "#1E40AF",
    customDomain: "",
    emailFromName: "",
    emailReplyTo: "",
    emailLogoEnabled: false,
    showTicketMatchBranding: true,
    showPoweredBy: true,
    welcomeMessage: "Welcome! Here is your itinerary.",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoDragOver, setLogoDragOver] = useState(false);

  // Security tab — login methods (identities), MFA factors, sign-out-others.
  // Loaded lazily on tab activation; safe to no-op on transient auth errors.
  type Identity = { provider: string; identity_data?: Record<string, unknown> };
  type MfaFactor = { id: string; factor_type: string; friendly_name?: string; status: string };
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [mfaFactors, setMfaFactors] = useState<MfaFactor[]>([]);
  const [securityLoaded, setSecurityLoaded] = useState(false);
  const [mfaEnroll, setMfaEnroll] = useState<{ factorId: string; qrSvg: string; secret: string } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [securityBusy, setSecurityBusy] = useState(false);
  const [securityNote, setSecurityNote] = useState("");

  // Billing tab — subscription summary + invoices via Stripe.
  type BillingSubscription = {
    hasSubscription: boolean;
    status: string | null;
    productName: string | null;
    amount: number | null;
    currency: string | null;
    interval: string | null;
    currentPeriodEnd: number | null;
    cancelAtPeriodEnd: boolean;
  };
  type BillingInvoice = {
    id: string;
    number: string | null;
    date: number;
    amount: number;
    currency: string;
    status: string | null;
    hostedUrl: string | null;
    pdfUrl: string | null;
  };
  const [billingSubscription, setBillingSubscription] = useState<BillingSubscription | null>(null);
  const [billingInvoices, setBillingInvoices] = useState<BillingInvoice[]>([]);
  const [billingLoaded, setBillingLoaded] = useState(false);

  const refreshSecurity = useCallback(async () => {
    try {
      const supabase = createClient();
      const [{ data: userData }, { data: factorData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.mfa.listFactors(),
      ]);
      const ids = (userData.user?.identities || []) as Identity[];
      setIdentities(ids);
      // listFactors returns { totp: Factor[], phone: Factor[], all: Factor[] }
      const all = (factorData?.all as MfaFactor[] | undefined) || [];
      setMfaFactors(all);
      setSecurityLoaded(true);
    } catch (err) {
      console.warn("Security load failed:", err);
      setSecurityLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "security" && !securityLoaded) {
      refreshSecurity();
    }
  }, [activeTab, securityLoaded, refreshSecurity]);

  // Lazy-load billing summary on tab activation. Soft-fail on errors —
  // Plan card still renders from `company.plan`, just without status/invoices.
  useEffect(() => {
    if (activeTab !== "billing" || billingLoaded) return;
    (async () => {
      try {
        const res = await fetch("/api/stripe/billing-summary");
        if (!res.ok) {
          setBillingLoaded(true);
          return;
        }
        const data = await res.json();
        setBillingSubscription(data.subscription || null);
        setBillingInvoices(Array.isArray(data.invoices) ? data.invoices : []);
      } catch (err) {
        console.warn("Billing load failed:", err);
      } finally {
        setBillingLoaded(true);
      }
    })();
  }, [activeTab, billingLoaded]);

  const connectProvider = useCallback(async (provider: "google" | "azure") => {
    setSecurityBusy(true);
    setSecurityNote("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.linkIdentity({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard/settings?tab=security` },
      });
      if (error) {
        setSecurityNote(`Could not start ${provider} link: ${error.message}`);
      }
    } catch (err) {
      setSecurityNote("Could not connect provider. Please try again.");
      console.error(err);
    } finally {
      setSecurityBusy(false);
    }
  }, []);

  const unlinkProvider = useCallback(async (identity: Identity) => {
    if (identities.length <= 1) {
      setSecurityNote("Cannot unlink the only login method — you'd lock yourself out. Add another method first.");
      return;
    }
    if (!confirm(`Remove ${identity.provider} as a login method?`)) return;
    setSecurityBusy(true);
    setSecurityNote("");
    try {
      const supabase = createClient();
      // Cast: Supabase's TS types differ across versions on unlinkIdentity arg.
      const { error } = await supabase.auth.unlinkIdentity(identity as unknown as Parameters<typeof supabase.auth.unlinkIdentity>[0]);
      if (error) {
        setSecurityNote(`Could not unlink: ${error.message}`);
      } else {
        await refreshSecurity();
      }
    } catch (err) {
      setSecurityNote("Could not unlink provider.");
      console.error(err);
    } finally {
      setSecurityBusy(false);
    }
  }, [identities.length, refreshSecurity]);

  const startMfaEnroll = useCallback(async () => {
    setSecurityBusy(true);
    setMfaError("");
    setSecurityNote("");
    try {
      const supabase = createClient();
      const { data: factorList } = await supabase.auth.mfa.listFactors();
      const stale = factorList?.all?.filter((f) => f.status !== "verified") ?? [];
      for (const f of stale) {
        try {
          await supabase.auth.mfa.unenroll({ factorId: f.id });
        } catch (err) {
          console.warn("Could not clean up stale factor", f.id, err);
        }
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `TicketMatch (${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()})`,
      });
      if (error || !data) {
        setMfaError(error?.message || "Could not start enrollment.");
        return;
      }
      setMfaEnroll({
        factorId: data.id,
        qrSvg: data.totp.qr_code,
        secret: data.totp.secret,
      });
    } catch (err) {
      setMfaError(err instanceof Error ? err.message : "Could not start enrollment.");
      console.error(err);
    } finally {
      setSecurityBusy(false);
    }
  }, []);

  const cancelMfaEnroll = useCallback(async () => {
    if (!mfaEnroll) return;
    try {
      const supabase = createClient();
      await supabase.auth.mfa.unenroll({ factorId: mfaEnroll.factorId });
    } catch (err) {
      console.warn("MFA cancel-unenroll failed:", err);
    }
    setMfaEnroll(null);
    setMfaCode("");
    setMfaError("");
  }, [mfaEnroll]);

  const verifyMfaEnroll = useCallback(async () => {
    if (!mfaEnroll) return;
    if (mfaCode.replace(/\D/g, "").length !== 6) {
      setMfaError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setSecurityBusy(true);
    setMfaError("");
    try {
      const supabase = createClient();
      const { data: chData, error: chError } = await supabase.auth.mfa.challenge({
        factorId: mfaEnroll.factorId,
      });
      if (chError || !chData) {
        setMfaError(chError?.message || "Could not verify — try again.");
        return;
      }
      const { error: vError } = await supabase.auth.mfa.verify({
        factorId: mfaEnroll.factorId,
        challengeId: chData.id,
        code: mfaCode.replace(/\D/g, ""),
      });
      if (vError) {
        setMfaError(vError.message || "Invalid code. Try again.");
        return;
      }
      setMfaEnroll(null);
      setMfaCode("");
      setSecurityNote("Two-factor authentication enabled.");
      await refreshSecurity();
    } catch (err) {
      setMfaError("Verification failed. Try again.");
      console.error(err);
    } finally {
      setSecurityBusy(false);
    }
  }, [mfaEnroll, mfaCode, refreshSecurity]);

  const removeMfaFactor = useCallback(async (factorId: string) => {
    if (!confirm("Remove this two-factor method? You'll lose 2FA protection until you set up a new one.")) return;
    setSecurityBusy(true);
    setSecurityNote("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) {
        setSecurityNote(`Could not remove: ${error.message}`);
      } else {
        setSecurityNote("Two-factor method removed.");
        await refreshSecurity();
      }
    } catch (err) {
      setSecurityNote("Could not remove factor.");
      console.error(err);
    } finally {
      setSecurityBusy(false);
    }
  }, [refreshSecurity]);

  const signOutOtherSessions = useCallback(async () => {
    if (!confirm("Sign out of all other devices? You'll stay signed in here.")) return;
    setSecurityBusy(true);
    setSecurityNote("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "others" });
      if (error) {
        setSecurityNote(`Could not sign out other sessions: ${error.message}`);
      } else {
        setSecurityNote("Signed out from all other devices.");
      }
    } catch (err) {
      setSecurityNote("Could not sign out other sessions.");
      console.error(err);
    } finally {
      setSecurityBusy(false);
    }
  }, []);

  const sendPasswordReset = useCallback(async () => {
    setSecurityBusy(true);
    setSecurityNote("");
    try {
      const supabase = createClient();
      const email = profile.email;
      if (!email) {
        setSecurityNote("No email on file.");
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) {
        setSecurityNote(`Could not send reset link: ${error.message}`);
      } else {
        setSecurityNote(`Password reset link sent to ${email}.`);
      }
    } catch (err) {
      setSecurityNote("Could not send reset link.");
      console.error(err);
    } finally {
      setSecurityBusy(false);
    }
  }, [profile.email]);

  // Load whitelabel settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("tm_whitelabel");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setWhitelabel(prev => ({ ...prev, ...parsed }));
        if (parsed.logo) setLogoPreview(parsed.logo);
      } catch {}
    }
  }, []);

  const handleLogoDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLogoDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setLogoPreview(dataUrl);
        setWhitelabel(prev => ({ ...prev, logo: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleLogoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setLogoPreview(dataUrl);
        setWhitelabel(prev => ({ ...prev, logo: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();

        setProfile(data.profile);

        if (data.company) {
          let msg: Record<string, string> = {};
          try { msg = data.company.message ? JSON.parse(data.company.message) : {}; } catch {}

          setCompany({
            id: data.company.id,
            name: data.company.name,
            company_type: data.company.company_type,
            phone: data.company.phone,
            kvk_number: data.company.kvk_number,
            vat_number: data.company.vat_number,
            plan: msg.plan || "free",
            plan_id: msg.plan_id || "",
            plan_activated_at: msg.plan_activated_at || "",
          });

          setCountry(msg.country || "NL");
          setCity(msg.city || "");
          setAddress(msg.address || "");
          setWebsite(msg.website || "");
        }

        if (data.team) {
          setTeamMembers(data.team);
        }

        try {
          const stored = localStorage.getItem("tm_notifications");
          if (stored) setNotifications(JSON.parse(stored));
        } catch {}
      } catch (err) {
        console.error("Settings load error:", err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveWhitelabel = async () => {
    // Local cache so the preview/Logo upload survive a refresh — logo file
    // upload + persistence is a follow-up; for now logo stays in localStorage.
    localStorage.setItem("tm_whitelabel", JSON.stringify(whitelabel));
    // Push the bits that ACTUALLY change customer-facing delivery (branding
    // mode + primary color) to the DB so PDFs, emails and wallet passes
    // pick them up. Soft-fail on the network call — the local UI still
    // shows a saved confirmation; admin can resync if needed.
    try {
      await fetch("/api/company/whitelabel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryColor: whitelabel.primaryColor,
          showPoweredBy: whitelabel.showPoweredBy,
        }),
      });
    } catch (err) {
      console.warn("White-label remote save failed:", err);
    }
    showSaved();
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: company.id,
        name: company.name,
        phone: company.phone,
        kvk_number: company.kvk_number,
        vat_number: company.vat_number,
        fullName: profile.full_name,
        country,
        city,
        address,
        website,
      }),
    });
    setSaving(false);
    showSaved();
  };

  const handleSaveCompany = async () => {
    setSaving(true);

    // Save company fields via API
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: company.id,
        name: company.name,
        phone: company.phone,
        kvk_number: company.kvk_number,
        vat_number: company.vat_number,
        country,
        city,
        address,
        website,
      }),
    });

    setSaving(false);
    showSaved();
  };

  const handleSaveNotifications = () => {
    localStorage.setItem("tm_notifications", JSON.stringify(notifications));
    showSaved();
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    setInviteMsg(null);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteMsg({ type: "success", text: data.message });
        setInviteEmail("");
        // Reload team members via API
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.team) setTeamMembers(profileData.team);
        }
      } else {
        setInviteMsg({ type: "error", text: data.error });
      }
    } catch {
      setInviteMsg({ type: "error", text: "Something went wrong" });
    }
    setInviting(false);
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from your team?`)) return;
    try {
      const res = await fetch("/api/team/invite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (res.ok) {
        setTeamMembers(teamMembers.filter(m => m.id !== memberId));
        showSaved();
      }
    } catch {}
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" },
    { id: "company", label: "Company", icon: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" },
    { id: "team", label: "Team", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
    { id: "billing", label: "Plan & Billing", icon: "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" },
    { id: "notifications", label: "Notifications", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" },
    { id: "api", label: "API Access", icon: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" },
    { id: "security", label: "Security", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
    { id: "whitelabel", label: "White Label", icon: "M12 2a10 10 0 1 0 0 20 2 2 0 0 1 0-4 2 2 0 0 1 0-4 10 10 0 0 0 0-12zM7.5 13a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm2-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm2 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" },
  ];

  const selectedCountry = COUNTRIES.find(c => c.code === country);
  const cf = getCountryFields(country);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-accent" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your account, company, and preferences.</p>
      </div>

      {saved && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Saved successfully
        </div>
      )}

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Sidebar tabs */}
        <div className="lg:w-56 shrink-0">
          <div className="rounded-2xl border border-border/60 bg-white p-2 shadow-sm flex lg:flex-col gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-foreground text-white shadow-sm"
                    : "text-muted hover:bg-gray-50 hover:text-foreground"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* ─── PROFILE ─── */}
          {activeTab === "profile" && (
            <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">Personal Information</h2>
              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="h-12 w-full rounded-xl border border-border bg-gray-50 px-4 text-sm text-muted cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-muted">Email cannot be changed. Contact support if needed.</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Preferred Currency</label>
                  <select
                    value={currency.code}
                    onChange={(e) => setCurrencyPref(e.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-muted">All prices will be shown in this currency. Database values remain in EUR.</p>
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ─── COMPANY ─── */}
          {activeTab === "company" && (
            <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">Company Details</h2>
              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Company Name</label>
                  <input
                    type="text"
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Country</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">{selectedCountry?.flag}</span>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="h-12 w-full rounded-xl border border-border bg-white pl-12 pr-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10 appearance-none"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{cf.cityLabel}</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={cf.cityLabel}
                      className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{cf.addressLabel}</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={cf.addressLabel}
                      className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.yourcompany.com"
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Phone</label>
                  <input
                    type="tel"
                    value={company.phone}
                    onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                    placeholder={cf.phonePlaceholder}
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{cf.regLabel}</label>
                    <input
                      type="text"
                      value={company.kvk_number}
                      onChange={(e) => setCompany({ ...company, kvk_number: e.target.value })}
                      placeholder={cf.regPlaceholder}
                      className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{cf.taxLabel}</label>
                    <input
                      type="text"
                      value={company.vat_number}
                      onChange={(e) => setCompany({ ...company, vat_number: e.target.value })}
                      placeholder={cf.taxPlaceholder}
                      className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Company Type</label>
                  <div className="h-12 flex items-center rounded-xl border border-border bg-gray-50 px-4 text-sm text-muted">
                    {company.company_type === "tour-operator" ? "Tour Operator" :
                     company.company_type === "travel-agency" ? "Travel Agency" :
                     company.company_type === "dmc" ? "DMC (Destination Management)" :
                     company.company_type === "mice" ? "MICE / Event Agency" :
                     company.company_type === "corporate" ? "Corporate Travel" :
                     company.company_type === "supplier" ? "Supplier / Partner" :
                     company.company_type || "Not set"}
                  </div>
                </div>

                <button
                  onClick={handleSaveCompany}
                  disabled={saving}
                  className="rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ─── TEAM ─── */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-6">Team Members</h2>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between rounded-xl border border-border/40 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                          {member.full_name ? member.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.full_name || "No name"}</p>
                          <p className="text-xs text-muted">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          member.role === "owner" ? "bg-amber-50 text-amber-700" :
                          member.role === "admin" ? "bg-blue-50 text-blue-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {member.role === "owner" ? "Owner" : member.role === "admin" ? "Admin" : "Member"}
                        </span>
                        {member.email !== profile.email && (
                          <button
                            onClick={() => handleRemoveMember(member.id, member.full_name || member.email)}
                            className="rounded-lg p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Remove from team"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <p className="text-sm text-muted text-center py-4">No team members yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Invite Team Member</h2>
                <p className="text-sm text-muted mb-4">Send an invitation to join your company on TicketMatch.</p>

                {inviteMsg && (
                  <div className={`mb-4 rounded-xl p-3 text-sm ${
                    inviteMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {inviteMsg.text}
                  </div>
                )}

                <div className="flex gap-3 max-w-lg">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="h-12 flex-1 rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="h-12 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={handleInvite}
                    disabled={inviting || !inviteEmail}
                    className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 whitespace-nowrap disabled:opacity-50"
                  >
                    {inviting ? "Sending..." : "Send Invite"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted">
                  Free: 1 member &middot; Pro: 3 members &middot; Enterprise: Unlimited
                </p>
              </div>
            </div>
          )}

          {/* ─── PLAN & BILLING ─── */}
          {activeTab === "billing" && (() => {
            const sub = billingSubscription;
            const statusBadge = (() => {
              if (!sub?.hasSubscription || !sub.status) return null;
              const map: Record<string, { label: string; cls: string }> = {
                active: { label: "Active", cls: "bg-green-50 border-green-200 text-green-700" },
                trialing: { label: "Trial", cls: "bg-blue-50 border-blue-200 text-blue-700" },
                past_due: { label: "Past due", cls: "bg-orange-50 border-orange-200 text-orange-700" },
                unpaid: { label: "Unpaid", cls: "bg-red-50 border-red-200 text-red-700" },
                canceled: { label: "Canceled", cls: "bg-gray-100 border-border text-muted" },
                incomplete: { label: "Incomplete", cls: "bg-amber-50 border-amber-200 text-amber-700" },
                incomplete_expired: { label: "Expired", cls: "bg-gray-100 border-border text-muted" },
                paused: { label: "Paused", cls: "bg-gray-100 border-border text-muted" },
              };
              return map[sub.status] || { label: sub.status, cls: "bg-gray-100 border-border text-muted" };
            })();
            const formatMoney = (amt: number, cur: string) => {
              try { return new Intl.NumberFormat("nl-NL", { style: "currency", currency: cur }).format(amt); }
              catch { return `${cur} ${amt.toFixed(2)}`; }
            };
            const formatDate = (unixSec: number) =>
              new Date(unixSec * 1000).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });

            return (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-6">Current Plan</h2>
                <div className="flex items-center gap-4 rounded-xl border border-border/40 p-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    company.plan === "enterprise" ? "bg-purple-100" :
                    company.plan === "pro" ? "bg-blue-100" : "bg-gray-100"
                  }`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={
                      company.plan === "enterprise" ? "#8b5cf6" :
                      company.plan === "pro" ? "#3b82f6" : "#6b7280"
                    } strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-lg font-bold capitalize">{company.plan || "Free"} Plan</p>
                      {statusBadge && (
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusBadge.cls}`}>
                          {statusBadge.label}
                        </span>
                      )}
                      {sub?.cancelAtPeriodEnd && (
                        <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[10px] font-semibold text-orange-700">
                          Cancels at period end
                        </span>
                      )}
                    </div>
                    {company.plan_id ? (
                      <p className="text-xs text-muted">
                        {company.plan_id.includes("annual") ? "Annual billing" : "Monthly billing"}
                        {company.plan_activated_at && ` \u00b7 Active since ${new Date(company.plan_activated_at).toLocaleDateString()}`}
                      </p>
                    ) : company.plan && company.plan !== "free" ? (
                      <p className="text-xs text-muted capitalize">{company.plan} features unlocked.</p>
                    ) : (
                      <p className="text-xs text-muted">You&apos;re on the free plan with basic features.</p>
                    )}
                  </div>
                  <a
                    href="/dashboard/pricing"
                    className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700"
                  >
                    {company.plan === "free" || !company.plan ? "Upgrade" : "Change Plan"}
                  </a>
                </div>

                {/* Next billing line — only when an active subscription exists */}
                {sub?.hasSubscription && sub.currentPeriodEnd && (
                  <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-gray-50/60 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {sub.cancelAtPeriodEnd ? "Access until" : "Next invoice"}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDate(sub.currentPeriodEnd)}
                        {sub.amount != null && sub.currency && !sub.cancelAtPeriodEnd && (
                          <span> &middot; {formatMoney(sub.amount, sub.currency)}{sub.interval ? ` / ${sub.interval}` : ""}</span>
                        )}
                      </p>
                    </div>
                    {sub.productName && (
                      <span className="hidden sm:inline text-xs text-muted truncate">{sub.productName}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Billing Information</h2>
                <p className="text-sm text-muted mb-4">Payments are processed securely via Stripe.</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-border/40 px-5 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payment Method</p>
                      <p className="text-xs text-muted">Managed by Stripe &middot; Card, iDEAL, Apple Pay, Google Pay &amp; more</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-border/40 px-5 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Invoices &amp; payment method</p>
                      <p className="text-xs text-muted">Update card, cancel subscription, download invoices</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/stripe/portal", { method: "POST" });
                        const json = await res.json();
                        if (json.url) {
                          window.location.href = json.url;
                        } else {
                          alert(json.error || "Could not open billing portal. Subscribe to a paid plan first.");
                        }
                      } catch {
                        alert("Could not open billing portal. Please try again.");
                      }
                    }}
                    className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700"
                  >
                    Open Stripe Billing Portal
                  </button>
                </div>
              </div>

              {/* ─── Invoices ─── */}
              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Invoices</h2>
                    <p className="text-sm text-muted">Recent invoices from Stripe. Open the Billing Portal above for the full history.</p>
                  </div>
                </div>
                {!billingLoaded ? (
                  <p className="text-sm text-muted">Loading…</p>
                ) : billingInvoices.length === 0 ? (
                  <p className="text-sm text-muted">No invoices yet. They appear here once you activate a paid plan.</p>
                ) : (
                  <div className="overflow-x-auto -mx-2">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/40 text-left text-xs uppercase tracking-wider text-muted/70">
                          <th className="px-2 py-2 font-medium">Date</th>
                          <th className="px-2 py-2 font-medium">Number</th>
                          <th className="px-2 py-2 font-medium">Amount</th>
                          <th className="px-2 py-2 font-medium">Status</th>
                          <th className="px-2 py-2 font-medium text-right">PDF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingInvoices.map((inv) => {
                          const statusCls = inv.status === "paid"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : inv.status === "open"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-gray-100 text-muted border border-border";
                          return (
                            <tr key={inv.id} className="border-b border-border/30 hover:bg-gray-50/40">
                              <td className="px-2 py-3 text-foreground whitespace-nowrap">{formatDate(inv.date)}</td>
                              <td className="px-2 py-3 text-muted">{inv.number || "—"}</td>
                              <td className="px-2 py-3 font-medium text-foreground whitespace-nowrap">{formatMoney(inv.amount, inv.currency)}</td>
                              <td className="px-2 py-3">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusCls}`}>
                                  {inv.status || "—"}
                                </span>
                              </td>
                              <td className="px-2 py-3 text-right whitespace-nowrap">
                                {inv.pdfUrl ? (
                                  <a
                                    href={inv.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-medium text-accent hover:underline"
                                  >
                                    Download
                                  </a>
                                ) : inv.hostedUrl ? (
                                  <a
                                    href={inv.hostedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-medium text-accent hover:underline"
                                  >
                                    View
                                  </a>
                                ) : (
                                  <span className="text-xs text-muted">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            );
          })()}

          {/* ─── NOTIFICATIONS ─── */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Email Notifications</h2>
                    <p className="text-xs text-muted">Choose which emails you want to receive.</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted mb-3 px-1">Bookings</p>
                  {[
                    { key: "booking_confirmations", label: "Booking confirmations", desc: "Email when a booking is confirmed, cancelled or updated." },
                    { key: "booking_reminders", label: "Booking reminders", desc: "Reminder 48 hours before a scheduled activity." },
                    { key: "status_updates", label: "Status updates", desc: "When a venue responds to your booking request." },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-xl border border-border/40 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                          notifications[item.key as keyof typeof notifications] ? "bg-accent" : "bg-gray-200"
                        }`}
                      >
                        <span className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          notifications[item.key as keyof typeof notifications] ? "translate-x-5" : ""
                        }`} />
                      </button>
                    </div>
                  ))}

                  <p className="text-xs font-medium uppercase tracking-wider text-muted mb-3 mt-6 px-1">Reports & Updates</p>
                  {[
                    { key: "new_venues", label: "New venues added", desc: "Get notified when new venues are added to the catalog." },
                    { key: "weekly_summary", label: "Weekly summary", desc: "Every Monday: overview of your bookings and groups." },
                    { key: "monthly_report", label: "Monthly report", desc: "Monthly PDF report with savings, bookings and trends." },
                    { key: "marketing", label: "Product updates", desc: "New features, tips, and platform improvements." },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-xl border border-border/40 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                          notifications[item.key as keyof typeof notifications] ? "bg-accent" : "bg-gray-200"
                        }`}
                      >
                        <span className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          notifications[item.key as keyof typeof notifications] ? "translate-x-5" : ""
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp Notifications */}
              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">WhatsApp Notifications</h2>
                    <p className="text-xs text-muted">Get instant booking updates on WhatsApp.</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border/40 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">Enable WhatsApp notifications</p>
                    <p className="text-xs text-muted">Receive booking confirmations and reminders via WhatsApp.</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, whatsapp_enabled: !notifications.whatsapp_enabled })}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      notifications.whatsapp_enabled ? "bg-accent" : "bg-gray-200"
                    }`}
                  >
                    <span className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      notifications.whatsapp_enabled ? "translate-x-5" : ""
                    }`} />
                  </button>
                </div>

                {notifications.whatsapp_enabled && (
                  <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-medium">WhatsApp number</label>
                    <input
                      type="tel"
                      value={notifications.whatsapp_number}
                      onChange={(e) => setNotifications({ ...notifications, whatsapp_number: e.target.value })}
                      placeholder="+31 6 1234 5678"
                      className="h-11 w-full max-w-sm rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                    />
                    <p className="mt-2 text-xs text-muted">
                      Include country code. We&apos;ll send you a one-time hello template to verify.
                    </p>
                  </div>
                )}
              </div>

              {/* Billing & Payment Notifications */}
              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Billing &amp; Payments</h2>
                    <p className="text-xs text-muted">Get notified about invoices, subscriptions, and payment issues.</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {[
                    { key: "payment_succeeded", label: "Payment succeeded", desc: "When a booking invoice or subscription is paid." },
                    { key: "payment_failed", label: "Payment failed", desc: "When a card is declined or a payment fails — high urgency." },
                    { key: "invoice_ready", label: "Invoice ready", desc: "When a new invoice is available to download." },
                    { key: "subscription_renewed", label: "Subscription renewed", desc: "After a successful monthly or yearly renewal." },
                    { key: "subscription_renewal_warning", label: "Renewal in 7 days", desc: "Reminder before your next subscription charge." },
                    { key: "subscription_cancelled", label: "Subscription cancelled", desc: "When a subscription ends or is cancelled." },
                    { key: "payment_method_expiring", label: "Card expiring in 30 days", desc: "Warning so you can update your card before it lapses." },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-xl border border-border/40 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                          notifications[item.key as keyof typeof notifications] ? "bg-accent" : "bg-gray-200"
                        }`}
                      >
                        <span className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          notifications[item.key as keyof typeof notifications] ? "translate-x-5" : ""
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save */}
              <button
                onClick={handleSaveNotifications}
                className="rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800"
              >
                Save Preferences
              </button>
            </div>
          )}

          {/* ─── API ACCESS ─── */}
          {activeTab === "api" && (
            <div className="space-y-6">
              {/* API Key */}
              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">API Key</h2>
                    <p className="text-sm text-muted mt-1">Use this key to authenticate your API requests.</p>
                  </div>
                  {company.plan === "enterprise" ? (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">Active</span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">Enterprise only</span>
                  )}
                </div>

                {company.plan === "enterprise" ? (
                  <div className="space-y-4 max-w-lg">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Your API Key</label>
                      <div className="flex gap-2">
                        <div className="h-12 flex-1 flex items-center rounded-xl border border-border bg-gray-50 px-4 font-mono text-sm text-muted">
                          tm_live_••••••••••••••••••••••••
                        </div>
                        <button className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
                          Copy
                        </button>
                      </div>
                      <p className="mt-1.5 text-xs text-muted">Keep this key secret. Never share it in client-side code.</p>
                    </div>
                    <button className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                      Regenerate Key
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Enterprise plan required</p>
                        <p className="text-xs text-amber-600 mt-1">API access is available on the Enterprise plan. Integrate TicketMatch directly into your own systems.</p>
                        <a href="/dashboard/pricing" className="mt-3 inline-block rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition-colors">
                          Upgrade to Enterprise
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Usage & Rate Limits */}
              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Usage & Rate Limits</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-border/40 p-4 text-center">
                    <p className="text-2xl font-bold">{company.plan === "enterprise" ? "10,000" : "0"}</p>
                    <p className="text-xs text-muted mt-1">Requests / month</p>
                    {company.plan === "enterprise" && (
                      <div className="mt-2 h-1.5 rounded-full bg-gray-100">
                        <div className="h-1.5 rounded-full bg-accent" style={{ width: "3%" }} />
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl border border-border/40 p-4 text-center">
                    <p className="text-2xl font-bold">{company.plan === "enterprise" ? "100" : "0"}</p>
                    <p className="text-xs text-muted mt-1">Requests / minute</p>
                  </div>
                  <div className="rounded-xl border border-border/40 p-4 text-center">
                    <p className="text-2xl font-bold">{company.plan === "enterprise" ? "5" : "0"}</p>
                    <p className="text-xs text-muted mt-1">Webhooks active</p>
                  </div>
                </div>
              </div>

              {/* Available Endpoints */}
              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Available Endpoints</h2>
                <div className="space-y-2">
                  {[
                    { method: "GET", path: "/api/v1/catalog", desc: "Browse available venues and experiences" },
                    { method: "GET", path: "/api/v1/availability", desc: "Check real-time availability for a venue" },
                    { method: "POST", path: "/api/v1/bookings", desc: "Create a new booking" },
                    { method: "GET", path: "/api/v1/bookings/:id", desc: "Get booking details and status" },
                    { method: "DELETE", path: "/api/v1/bookings/:id", desc: "Cancel a booking" },
                    { method: "POST", path: "/api/v1/webhooks", desc: "Register a webhook for status updates" },
                  ].map((ep) => (
                    <div key={ep.path} className="flex items-center gap-3 rounded-xl border border-border/40 px-4 py-3">
                      <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${
                        ep.method === "GET" ? "bg-blue-100 text-blue-700" :
                        ep.method === "POST" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {ep.method}
                      </span>
                      <code className="text-sm font-mono font-medium">{ep.path}</code>
                      <span className="ml-auto text-xs text-muted hidden sm:block">{ep.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documentation link */}
              <a href="/partners/tech" target="_blank" className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold group-hover:text-blue-600 transition-colors">Full API Documentation</p>
                  <p className="text-xs text-muted">Endpoints, data models, authentication &amp; integration guide</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-gray-300 group-hover:text-blue-500 transition-colors">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          )}

          {/* ─── SECURITY ─── */}
          {activeTab === "security" && (() => {
            const providerInfo: Record<string, { label: string; iconBg: string; icon: React.ReactNode }> = {
              google: {
                label: "Google",
                iconBg: "bg-blue-50",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                  </svg>
                ),
              },
              azure: {
                label: "Microsoft",
                iconBg: "bg-blue-50",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                ),
              },
              email: {
                label: "Email (magic link)",
                iconBg: "bg-amber-50",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                ),
              },
            };
            const connectedProviders = new Set(identities.map((i) => i.provider));
            const orderedProviders: Array<keyof typeof providerInfo> = ["google", "azure", "email"];
            const totpFactors = mfaFactors.filter((f) => f.factor_type === "totp" && f.status === "verified");

            return (
              <div className="space-y-6">

                {/* ─── Login Methods ─── */}
                <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Login Methods</h2>
                    <p className="text-sm text-muted">Connect more sign-in options so you&apos;re never locked out.</p>
                  </div>
                  {!securityLoaded ? (
                    <p className="text-sm text-muted">Loading…</p>
                  ) : (
                    <div className="space-y-2">
                      {orderedProviders.map((p) => {
                        const info = providerInfo[p];
                        const linkedIdentities = identities.filter((id) => id.provider === p);
                        const isConnected = connectedProviders.has(p);
                        return (
                          <div key={p} className="flex items-center gap-3 rounded-xl border border-border/40 px-5 py-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${info.iconBg}`}>
                              {info.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{info.label}</p>
                              <p className="truncate text-xs text-muted">
                                {isConnected
                                  ? (linkedIdentities[0]?.identity_data?.email as string) || profile.email
                                  : `Add ${info.label} as a backup login.`}
                              </p>
                            </div>
                            {isConnected ? (
                              <>
                                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">Connected</span>
                                {p !== "email" && identities.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => unlinkProvider(linkedIdentities[0])}
                                    disabled={securityBusy}
                                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-red-200 hover:text-red-600 disabled:opacity-50"
                                  >
                                    Unlink
                                  </button>
                                )}
                              </>
                            ) : p === "email" ? (
                              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-muted">Not linked</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => connectProvider(p as "google" | "azure")}
                                disabled={securityBusy}
                                className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-foreground/90 disabled:opacity-50"
                              >
                                Connect
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ─── Password ─── */}
                <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Password</h2>
                    <p className="text-sm text-muted">
                      Set or change a password for email-and-password sign-in. We&apos;ll email you a secure reset link.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={sendPasswordReset}
                    disabled={securityBusy || !profile.email}
                    className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                  >
                    Send password reset email
                  </button>
                </div>

                {/* ─── Two-factor Authentication ─── */}
                <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">Two-factor Authentication</h2>
                      <p className="text-sm text-muted">
                        Protect your account with a 6-digit code from an authenticator app
                        (Google Authenticator, 1Password, Authy, …).
                      </p>
                    </div>
                    {totpFactors.length > 0 && (
                      <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border border-green-200">
                        Enabled
                      </span>
                    )}
                  </div>

                  {/* Existing factors list */}
                  {totpFactors.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {totpFactors.map((f) => (
                        <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border/40 px-5 py-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{f.friendly_name || "Authenticator app"}</p>
                            <p className="text-xs text-muted">TOTP · Active</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMfaFactor(f.id)}
                            disabled={securityBusy}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-red-200 hover:text-red-600 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Enroll flow */}
                  {!mfaEnroll && totpFactors.length === 0 && (
                    <button
                      type="button"
                      onClick={startMfaEnroll}
                      disabled={securityBusy}
                      className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-foreground/90 disabled:opacity-50"
                    >
                      Set up authenticator app
                    </button>
                  )}
                  {!mfaEnroll && totpFactors.length > 0 && (
                    <button
                      type="button"
                      onClick={startMfaEnroll}
                      disabled={securityBusy}
                      className="rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-gray-50 disabled:opacity-50"
                    >
                      Add another authenticator
                    </button>
                  )}

                  {!mfaEnroll && mfaError && (
                    <p className="mt-2 text-sm text-red-600">{mfaError}</p>
                  )}

                  {mfaEnroll && (
                    <div className="rounded-xl border border-border/60 bg-gray-50/50 p-5 space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1">1. Scan this QR with your authenticator app</p>
                        <p className="text-xs text-muted">Or enter the secret manually if scanning isn&apos;t possible.</p>
                      </div>
                      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                        <div className="rounded-xl bg-white p-3 border border-border/60 shrink-0">
                          {/* qr_code is a data:image/svg+xml URL — render via <img>, not innerHTML */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={mfaEnroll.qrSvg} alt="2FA QR code" width={200} height={200} />
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                          <p className="text-xs font-medium text-muted mb-1">Manual setup secret</p>
                          <code className="block break-all rounded-lg border border-border/60 bg-white px-3 py-2 text-xs font-mono text-foreground">
                            {mfaEnroll.secret}
                          </code>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">2. Enter the 6-digit code</p>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="123456"
                          autoComplete="one-time-code"
                          className="h-11 w-32 rounded-xl border border-border bg-white px-4 text-center text-base font-mono tracking-[0.3em] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                        />
                      </div>
                      {mfaError && <p className="text-sm text-red-600">{mfaError}</p>}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={verifyMfaEnroll}
                          disabled={securityBusy || mfaCode.length !== 6}
                          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                        >
                          Verify &amp; enable
                        </button>
                        <button
                          type="button"
                          onClick={cancelMfaEnroll}
                          disabled={securityBusy}
                          className="rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-muted transition-all hover:bg-gray-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ─── Active Sessions ─── */}
                <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Active Sessions</h2>
                    <p className="text-sm text-muted">
                      You&apos;re signed in on this device. If a phone or laptop went missing, sign out everywhere else.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={signOutOtherSessions}
                    disabled={securityBusy}
                    className="rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sign out of all other devices
                  </button>
                </div>

                {/* Inline status / errors for the whole tab */}
                {securityNote && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/60 px-5 py-3 text-sm text-blue-800">
                    {securityNote}
                  </div>
                )}

                {/* ─── Danger Zone ─── */}
                <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
                  <h2 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h2>
                  <p className="text-sm text-red-600/70 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => { if (confirm("Are you sure? This will permanently delete your account and all data.")) { alert("Please contact hello@ticketmatch.ai to delete your account."); } }}
                    className="rounded-xl border border-red-300 bg-white px-5 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ─── WHITE LABEL ─── */}
          {activeTab === "whitelabel" && (
            <div className="space-y-6">

              {/* Header */}
              <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">White Label Branding</h2>
                    <p className="mt-1 text-sm text-muted">Customize how your brand appears on shared itineraries and client-facing pages.</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                    Premium Feature
                  </span>
                </div>
              </div>

              {/* ─── BRANDING SECTION ─── */}
              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Branding</h3>
                    <p className="text-sm text-muted mt-0.5">Upload your logo and set brand colors</p>
                  </div>
                  <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold text-green-700 border border-green-200">All Plans</span>
                </div>

                {/* Logo Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Company Logo</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setLogoDragOver(true); }}
                    onDragLeave={() => setLogoDragOver(false)}
                    onDrop={handleLogoDrop}
                    className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${logoDragOver ? "border-accent bg-accent/5" : "border-border/60 hover:border-accent/40 hover:bg-gray-50/50"}`}
                  >
                    {logoPreview ? (
                      <div className="flex flex-col items-center gap-3">
                        <img src={logoPreview} alt="Logo preview" className="h-16 max-w-[200px] object-contain rounded-lg" />
                        <button
                          onClick={() => { setLogoPreview(null); setWhitelabel(prev => ({ ...prev, logo: "" })); }}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Remove logo
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted/40 mb-2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                        <p className="text-sm text-muted">Drag & drop your logo here, or <span className="text-accent font-medium">browse</span></p>
                        <p className="text-xs text-muted/60 mt-1">PNG, JPG, or SVG. Max 2MB.</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Brand Color</label>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl border border-border/60 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: whitelabel.primaryColor }}
                      />
                      <input
                        type="text"
                        value={whitelabel.primaryColor}
                        onChange={e => setWhitelabel(prev => ({ ...prev, primaryColor: e.target.value }))}
                        placeholder="#2563EB"
                        className="flex-1 rounded-xl border border-border/60 bg-white px-4 py-2.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none font-mono"
                      />
                      <input
                        type="color"
                        value={whitelabel.primaryColor}
                        onChange={e => setWhitelabel(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="h-10 w-10 rounded-lg border border-border/60 cursor-pointer bg-transparent p-0.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Secondary Color</label>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl border border-border/60 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: whitelabel.secondaryColor }}
                      />
                      <input
                        type="text"
                        value={whitelabel.secondaryColor}
                        onChange={e => setWhitelabel(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        placeholder="#1E40AF"
                        className="flex-1 rounded-xl border border-border/60 bg-white px-4 py-2.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none font-mono"
                      />
                      <input
                        type="color"
                        value={whitelabel.secondaryColor}
                        onChange={e => setWhitelabel(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="h-10 w-10 rounded-lg border border-border/60 cursor-pointer bg-transparent p-0.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Branding Preview */}
                <div>
                  <label className="block text-sm font-medium mb-2">Preview</label>
                  <div className="rounded-xl border border-border/40 bg-gray-50/50 p-5 max-w-md">
                    <div className="rounded-lg bg-white border border-border/40 shadow-sm overflow-hidden">
                      {/* Preview Header */}
                      <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: whitelabel.primaryColor }}>
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="h-6 max-w-[80px] object-contain rounded" style={{ filter: "brightness(0) invert(1)" }} />
                        ) : (
                          <div className="h-6 w-20 rounded bg-white/20" />
                        )}
                        <span className="text-xs text-white/80 font-medium ml-auto">Shared Itinerary</span>
                      </div>
                      {/* Preview Body */}
                      <div className="p-4 space-y-2">
                        <div className="h-3 w-3/4 rounded bg-gray-200" />
                        <div className="h-3 w-1/2 rounded bg-gray-100" />
                        <div className="mt-3 flex gap-2">
                          <div className="h-8 flex-1 rounded-lg flex items-center justify-center text-[10px] font-semibold text-white" style={{ backgroundColor: whitelabel.primaryColor }}>
                            View Details
                          </div>
                          <div className="h-8 flex-1 rounded-lg flex items-center justify-center text-[10px] font-semibold border" style={{ borderColor: whitelabel.secondaryColor, color: whitelabel.secondaryColor }}>
                            Download PDF
                          </div>
                        </div>
                      </div>
                      {/* Preview Footer */}
                      {whitelabel.showPoweredBy && (
                        <div className="px-4 py-2 border-t border-border/40 text-center">
                          <span className="text-[9px] text-muted/50">Powered by TicketMatch.ai</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── CUSTOM DOMAIN ─── */}
              <UpgradeLock feature="Custom Domain" plan="Enterprise" locked={company.plan !== "enterprise"}>
                <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Custom Domain</h3>
                      <p className="text-sm text-muted mt-0.5">Use your own domain for client-facing pages</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200">Enterprise</span>
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">Coming Soon</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Custom Domain</label>
                      <input
                        type="text"
                        value={whitelabel.customDomain}
                        onChange={e => setWhitelabel(prev => ({ ...prev, customDomain: e.target.value }))}
                        placeholder="bookings.mycompany.com"
                        className="w-full max-w-md rounded-xl border border-border/60 bg-white px-4 py-2.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none"
                      />
                    </div>
                    <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-4 max-w-md">
                      <div className="flex items-start gap-2.5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                        <div>
                          <p className="text-xs font-medium text-blue-800">DNS Configuration</p>
                          <p className="text-xs text-blue-600 mt-1">Point a CNAME record for your subdomain to <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[11px] font-mono">custom.ticketmatch.ai</code></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </UpgradeLock>

              {/* ─── EMAIL BRANDING ─── */}
              <UpgradeLock feature="Email Branding" plan="Pro" locked={company.plan === "free"}>
                <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Email Branding</h3>
                      <p className="text-sm text-muted mt-0.5">Customize outgoing emails with your brand</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">Pro + Enterprise</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">From Name</label>
                      <input
                        type="text"
                        value={whitelabel.emailFromName}
                        onChange={e => setWhitelabel(prev => ({ ...prev, emailFromName: e.target.value }))}
                        placeholder="MyCompany via TicketMatch"
                        className="w-full max-w-md rounded-xl border border-border/60 bg-white px-4 py-2.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none"
                      />
                      <p className="text-xs text-muted mt-1">This name appears as the sender in client emails</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Reply-to Email</label>
                      <input
                        type="email"
                        value={whitelabel.emailReplyTo}
                        onChange={e => setWhitelabel(prev => ({ ...prev, emailReplyTo: e.target.value }))}
                        placeholder="bookings@mycompany.com"
                        className="w-full max-w-md rounded-xl border border-border/60 bg-white px-4 py-2.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none"
                      />
                      <p className="text-xs text-muted mt-1">Client replies go to this address</p>
                    </div>

                    <div className="flex items-center justify-between max-w-md rounded-xl border border-border/40 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">Logo in Email Headers</p>
                        <p className="text-xs text-muted mt-0.5">Show your logo at the top of all outgoing emails</p>
                      </div>
                      <button
                        onClick={() => setWhitelabel(prev => ({ ...prev, emailLogoEnabled: !prev.emailLogoEnabled }))}
                        className={`relative h-6 w-11 rounded-full transition-colors ${whitelabel.emailLogoEnabled ? "bg-accent" : "bg-gray-200"}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${whitelabel.emailLogoEnabled ? "left-[22px]" : "left-0.5"}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </UpgradeLock>

              {/* ─── SHAREABLE PAGE BRANDING ─── */}
              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Shareable Page Branding</h3>
                    <p className="text-sm text-muted mt-0.5">Control branding on pages shared with your clients</p>
                  </div>
                  <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold text-green-700 border border-green-200">All Plans</span>
                </div>

                <div className="space-y-4">
                  {/* Show TicketMatch Branding Toggle */}
                  <div className="flex items-center justify-between max-w-md rounded-xl border border-border/40 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Show TicketMatch Branding</p>
                      <p className="text-xs text-muted mt-0.5">Display TicketMatch branding on shared itineraries</p>
                    </div>
                    <UpgradeLock feature="Remove TicketMatch Branding" plan="Pro" locked={company.plan === "free" && !whitelabel.showTicketMatchBranding}>
                      <button
                        onClick={() => {
                          if (company.plan === "free" && whitelabel.showTicketMatchBranding) return;
                          setWhitelabel(prev => ({ ...prev, showTicketMatchBranding: !prev.showTicketMatchBranding }));
                        }}
                        className={`relative h-6 w-11 rounded-full transition-colors ${whitelabel.showTicketMatchBranding ? "bg-accent" : "bg-gray-200"}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${whitelabel.showTicketMatchBranding ? "left-[22px]" : "left-0.5"}`} />
                      </button>
                    </UpgradeLock>
                  </div>

                  {/* Show Powered By Footer Toggle */}
                  <div className="flex items-center justify-between max-w-md rounded-xl border border-border/40 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">&ldquo;Powered by TicketMatch&rdquo; Footer</p>
                      <p className="text-xs text-muted mt-0.5">Show footer attribution on shared pages</p>
                    </div>
                    <UpgradeLock feature="Remove Powered By Footer" plan="Pro" locked={company.plan === "free" && !whitelabel.showPoweredBy}>
                      <button
                        onClick={() => {
                          if (company.plan === "free" && whitelabel.showPoweredBy) return;
                          setWhitelabel(prev => ({ ...prev, showPoweredBy: !prev.showPoweredBy }));
                        }}
                        className={`relative h-6 w-11 rounded-full transition-colors ${whitelabel.showPoweredBy ? "bg-accent" : "bg-gray-200"}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${whitelabel.showPoweredBy ? "left-[22px]" : "left-0.5"}`} />
                      </button>
                    </UpgradeLock>
                  </div>

                  {/* Welcome Message */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Custom Welcome Message</label>
                    <textarea
                      value={whitelabel.welcomeMessage}
                      onChange={e => setWhitelabel(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                      placeholder="Welcome! Here is your personalized itinerary..."
                      rows={3}
                      className="w-full max-w-md rounded-xl border border-border/60 bg-white px-4 py-2.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none resize-none"
                    />
                    <p className="text-xs text-muted mt-1">Shown at the top of shared itinerary pages</p>
                  </div>

                  {/* Live Preview */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Live Preview</label>
                    <div className="rounded-xl border border-border/40 bg-gray-50/50 p-5 max-w-md">
                      <div className="rounded-lg bg-white border border-border/40 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: whitelabel.primaryColor }}>
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="h-5 max-w-[70px] object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                          ) : (
                            <div className="h-5 w-16 rounded bg-white/20" />
                          )}
                          {!whitelabel.showTicketMatchBranding ? null : (
                            <span className="text-[9px] text-white/60 ml-auto">via TicketMatch.ai</span>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-muted italic">{whitelabel.welcomeMessage || "Welcome message..."}</p>
                          <div className="mt-3 space-y-1.5">
                            <div className="h-2.5 w-full rounded bg-gray-100" />
                            <div className="h-2.5 w-4/5 rounded bg-gray-100" />
                            <div className="h-2.5 w-3/5 rounded bg-gray-50" />
                          </div>
                        </div>
                        {whitelabel.showPoweredBy && (
                          <div className="px-4 py-2 border-t border-border/40 text-center">
                            <span className="text-[8px] text-muted/40">Powered by TicketMatch.ai</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── SAVE BUTTON ─── */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveWhitelabel}
                  className="rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  {saving ? "Saving..." : "Save White Label Settings"}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
