"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/25 transition active:scale-95"
      title="Imprimer ou enregistrer en PDF via le navigateur"
    >
      <Printer className="w-3.5 h-3.5" />
      <span>Imprimer / PDF</span>
    </button>
  );
}
