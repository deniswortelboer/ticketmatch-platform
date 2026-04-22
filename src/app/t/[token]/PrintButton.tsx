"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900 transition print:hidden w-full"
    >
      🖨️ Print deze pagina
    </button>
  );
}
