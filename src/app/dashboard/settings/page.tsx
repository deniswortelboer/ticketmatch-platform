"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useCurrency } from "@/components/CurrencySelector";
import { CURRENCIES } from "@/lib/currency";

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
  });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, email, company_id, companies(id, name, company_type, phone, kvk_number, vat_number, message)")
        .eq("id", user.id)
        .single();

      if (prof) {
        setProfile({ full_name: prof.full_name || "", email: prof.email || user.email || "" });

        const comp = Array.isArray(prof.companies) ? prof.companies[0] : prof.companies;
        if (comp) {
          let msg: Record<string, string> = {};
          try { msg = comp.message ? JSON.parse(comp.message) : {}; } catch {}

          setCompany({
            id: comp.id || "",
            name: comp.name || "",
            company_type: comp.company_type || "",
            phone: comp.phone || "",
            kvk_number: comp.kvk_number || "",
            vat_number: comp.vat_number || "",
            plan: (msg.plan as string) || "free",
            plan_id: (msg.plan_id as string) || "",
            plan_activated_at: (msg.plan_activated_at as string) || "",
          });

          setCountry((msg.country as string) || "NL");
          setCity((msg.city as string) || "");
          setAddress((msg.address as string) || "");
          setWebsite((msg.website as string) || "");

          const { data: team } = await supabase
            .from("profiles")
            .select("id, full_name, email, role")
            .eq("company_id", comp.id);

          if (team) setTeamMembers(team.map(t => ({
            id: t.id,
            full_name: t.full_name || "",
            email: t.email || "",
            role: t.role || "member",
          })));
        }

        try {
          const stored = localStorage.getItem("tm_notifications");
          if (stored) setNotifications(JSON.parse(stored));
        } catch {}
      }

      setLoading(false);
    };
    load();
  }, []);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ full_name: profile.full_name }).eq("id", user.id);
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
        // Reload team members
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: prof } = await supabase.from("profiles").select("company_id").eq("id", authUser.id).single();
          if (prof?.company_id) {
            const { data: team } = await supabase.from("profiles").select("id, full_name, email, role").eq("company_id", prof.company_id);
            if (team) setTeamMembers(team.map(t => ({ id: t.id, full_name: t.full_name || "", email: t.email || "", role: t.role || "member" })));
          }
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
          {activeTab === "billing" && (
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
                  <div className="flex-1">
                    <p className="text-lg font-bold capitalize">{company.plan || "Free"} Plan</p>
                    {company.plan_id ? (
                      <p className="text-xs text-muted">
                        {company.plan_id.includes("annual") ? "Annual billing" : "Monthly billing"}
                        {company.plan_activated_at && ` \u00b7 Active since ${new Date(company.plan_activated_at).toLocaleDateString()}`}
                      </p>
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
              </div>

              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Billing Information</h2>
                <p className="text-sm text-muted mb-4">Payments are processed securely via Mollie.</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-border/40 px-5 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Payment Method</p>
                      <p className="text-xs text-muted">Managed by Mollie &middot; iDEAL, Credit Card, PayPal &amp; more</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-border/40 px-5 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Invoices</p>
                      <p className="text-xs text-muted">Coming soon &middot; Download your invoices here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  <span className="ml-auto rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">Coming Soon</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border/40 px-5 py-4 opacity-60">
                  <div>
                    <p className="text-sm font-medium">Enable WhatsApp notifications</p>
                    <p className="text-xs text-muted">Receive booking confirmations and reminders via WhatsApp.</p>
                  </div>
                  <button
                    disabled
                    className="relative h-6 w-11 shrink-0 rounded-full bg-gray-200 cursor-not-allowed"
                  >
                    <span className="absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow" />
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
                  </div>
                )}

                <div className="mt-4 rounded-xl bg-green-50 p-4 border border-green-100">
                  <p className="text-xs text-green-700">
                    <strong>Coming Q3 2026:</strong> WhatsApp Business integration for instant notifications.
                    You&apos;ll receive booking confirmations, reminders, and status updates directly on WhatsApp.
                  </p>
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
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Login Method</h2>
                <p className="text-sm text-muted mb-4">You are currently signed in via:</p>
                <div className="flex items-center gap-3 rounded-xl border border-border/40 px-5 py-4 max-w-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Google Account</p>
                    <p className="text-xs text-muted">{profile.email}</p>
                  </div>
                  <span className="ml-auto rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">Connected</span>
                </div>
              </div>

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
          )}
        </div>
      </div>
    </>
  );
}
