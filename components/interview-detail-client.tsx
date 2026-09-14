"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import {
  Mic2,
  FileText,
  Timer,
  UserCheck,
  Quote,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Save,
  Trash2,
  Printer,
  Copy,
  Check,
  Sparkles,
  ArrowLeft,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  ListOrdered,
  Volume2,
  AlertCircle,
  ExternalLink,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { InterviewStatus } from "@prisma/client";
import { updateInterviewAction, updateInterviewStatusAction } from "@/app/(app)/interviews/actions";

// Types
interface RundownBlock {
  id: string;
  order: number;
  title: string;
  durationMin: number;
  status: "EN_ATTENTE" | "EN_COURS" | "VALIDE";
  notes: string;
  speaker?: string;
}

interface QuestionItem {
  id: string;
  order: number;
  text: string;
  answered: boolean;
}

interface QuoteItem {
  id: string;
  text: string;
  speaker: string;
  timestamp?: string;
}

interface InterviewDetailClientProps {
  interview: {
    id: string;
    title: string;
    status: InterviewStatus;
    shootingDate: Date | null;
    location: string | null;
    notes: string | null;
    deliverables: string | null;
    audioUrl: string | null;
    transcript: string | null;
    rundown: any;
    questions: any;
    quotes: any;
    contact: {
      id: string;
      nom: string;
      email: string | null;
      telephone: string | null;
      entreprise: string | null;
      notes: string | null;
      type: string;
    } | null;
  };
}

export default function InterviewDetailClient({ interview }: InterviewDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"preparation" | "rundown" | "derushage">("rundown");
  const [isPending, startTransition] = useTransition();
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // 1. État Questions ordonnables
  const [questions, setQuestions] = useState<QuestionItem[]>(
    Array.isArray(interview.questions) && interview.questions.length > 0
      ? interview.questions
      : [
          { id: "q1", order: 1, text: "Pouvez-vous situer le contexte de votre alerte ?", answered: false },
          { id: "q2", order: 2, text: "Quels documents matériels étayent vos déclarations ?", answered: false },
        ]
  );
  const [newQuestionText, setNewQuestionText] = useState("");

  // 2. État Rundown & Chronomètre
  const [blocks, setBlocks] = useState<RundownBlock[]>(
    Array.isArray(interview.rundown) && interview.rundown.length > 0
      ? interview.rundown
      : [
          { id: "b1", order: 1, title: "1. Accroche & Teaser", durationMin: 2, status: "EN_ATTENTE", notes: "Citer l'extrait clé.", speaker: "Louise Presse" },
          { id: "b2", order: 2, title: "2. Révélations & Faits", durationMin: 15, status: "EN_ATTENTE", notes: "Dérouler l'enquête.", speaker: "Invité" },
          { id: "b3", order: 3, title: "3. Droit de réponse", durationMin: 8, status: "EN_ATTENTE", notes: "Confronter aux arguments adverses.", speaker: "Louise Presse" },
        ]
  );
  const [newBlockTitle, setNewBlockTitle] = useState("");
  const [newBlockDuration, setNewBlockDuration] = useState(5);
  const [newBlockSpeaker, setNewBlockSpeaker] = useState(interview.contact?.nom || "Invité");
  const [newBlockNotes, setNewBlockNotes] = useState("");

  // Chronomètre interactif
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 3. État Dérushage, Retranscription & Citations (Quotes)
  const [audioUrlInput, setAudioUrlInput] = useState(interview.audioUrl || "");
  const [transcriptText, setTranscriptText] = useState(
    interview.transcript ||
      `[00:00:15 - Louise Presse] : Bienvenue dans cet entretien d'investigation. Nous recevons ${
        interview.contact?.nom || "notre invité"
      }.\n\n[00:01:20 - ${interview.contact?.nom || "Invité"}] : Ce dossier révèle des manquements graves dans la gestion des fonds publics...`
  );
  const [quotes, setQuotes] = useState<QuoteItem[]>(
    Array.isArray(interview.quotes) && interview.quotes.length > 0 ? interview.quotes : []
  );
  const [selectedQuoteText, setSelectedQuoteText] = useState("");
  const [selectedQuoteSpeaker, setSelectedQuoteSpeaker] = useState(interview.contact?.nom || "Invité");
  const [selectedQuoteTime, setSelectedQuoteTime] = useState("");
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);

  // Sauvegarde globale automatique ou manuelle
  const triggerSave = (customMsg = "Enregistré avec succès") => {
    startTransition(async () => {
      await updateInterviewAction(interview.id, {
        questions,
        rundown: blocks,
        transcript: transcriptText,
        quotes,
        audioUrl: audioUrlInput,
      });
      setSavedNotice(customMsg);
      setTimeout(() => setSavedNotice(null), 2500);
    });
  };

  // Handlers Questions
  const addQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ: QuestionItem = {
      id: `q-${Date.now()}`,
      order: questions.length + 1,
      text: newQuestionText.trim(),
      answered: false,
    };
    const updated = [...questions, newQ];
    setQuestions(updated);
    setNewQuestionText("");
    startTransition(async () => {
      await updateInterviewAction(interview.id, { questions: updated });
    });
  };

  const toggleQuestionAnswered = (id: string) => {
    const updated = questions.map((q) => (q.id === id ? { ...q, answered: !q.answered } : q));
    setQuestions(updated);
    startTransition(async () => {
      await updateInterviewAction(interview.id, { questions: updated });
    });
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    )
      return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...questions];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    const reordered = updated.map((q, i) => ({ ...q, order: i + 1 }));
    setQuestions(reordered);
    startTransition(async () => {
      await updateInterviewAction(interview.id, { questions: reordered });
    });
  };

  const deleteQuestion = (id: string) => {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    startTransition(async () => {
      await updateInterviewAction(interview.id, { questions: updated });
    });
  };

  // Handlers Rundown
  const addBlock = () => {
    if (!newBlockTitle.trim()) return;
    const newB: RundownBlock = {
      id: `b-${Date.now()}`,
      order: blocks.length + 1,
      title: newBlockTitle.trim(),
      durationMin: newBlockDuration || 5,
      status: "EN_ATTENTE",
      notes: newBlockNotes.trim(),
      speaker: newBlockSpeaker.trim(),
    };
    const updated = [...blocks, newB];
    setBlocks(updated);
    setNewBlockTitle("");
    setNewBlockNotes("");
    startTransition(async () => {
      await updateInterviewAction(interview.id, { rundown: updated });
    });
  };

  const setBlockStatus = (id: string, st: "EN_ATTENTE" | "EN_COURS" | "VALIDE") => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, status: st } : b));
    setBlocks(updated);
    startTransition(async () => {
      await updateInterviewAction(interview.id, { rundown: updated });
    });
  };

  const deleteBlock = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    setBlocks(updated);
    startTransition(async () => {
      await updateInterviewAction(interview.id, { rundown: updated });
    });
  };

  // Calculs Rundown
  const totalRundownMin = blocks.reduce((acc, b) => acc + (b.durationMin || 0), 0);
  const elapsedMinutes = timerSeconds / 60;
  const remainingMinutes = Math.max(0, totalRundownMin - elapsedMinutes);

  // Handlers Dérushage & Citations
  const handleExtractFromSelection = () => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 5) {
      setSelectedQuoteText(sel);
    }
  };

  const addQuote = () => {
    if (!selectedQuoteText.trim()) return;
    const newQ: QuoteItem = {
      id: `quote-${Date.now()}`,
      text: selectedQuoteText.trim(),
      speaker: selectedQuoteSpeaker.trim() || interview.contact?.nom || "Invité",
      timestamp: selectedQuoteTime.trim() || undefined,
    };
    const updated = [newQ, ...quotes];
    setQuotes(updated);
    setSelectedQuoteText("");
    setSelectedQuoteTime("");
    startTransition(async () => {
      await updateInterviewAction(interview.id, { quotes: updated });
    });
  };

  const copyQuote = (quote: QuoteItem) => {
    navigator.clipboard.writeText(`« ${quote.text} » — ${quote.speaker}`);
    setCopiedQuoteId(quote.id);
    setTimeout(() => setCopiedQuoteId(null), 2000);
  };

  const deleteQuote = (id: string) => {
    const updated = quotes.filter((q) => q.id !== id);
    setQuotes(updated);
    startTransition(async () => {
      await updateInterviewAction(interview.id, { quotes: updated });
    });
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 print:p-0 print:space-y-4">
      {/* 1. Header Fiche & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/interviews"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-semibold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Interviews</span>
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="text-xs font-mono font-bold text-brand-accent tracking-wider uppercase">
              {interview.status}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            {interview.title}
          </h1>

          {interview.contact && (
            <p className="text-xs text-neutral-400 flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-brand-accentLight" />
              <span>
                Invité : <strong className="text-white">{interview.contact.nom}</strong>
                {interview.contact.entreprise ? ` (${interview.contact.entreprise})` : ""}
              </span>
              {interview.location && (
                <>
                  <span className="text-neutral-600">•</span>
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{interview.location}</span>
                </>
              )}
            </p>
          )}
        </div>

        {/* Actions Rapides Header */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {savedNotice && (
            <span className="text-xs text-emerald-400 font-semibold animate-in fade-in">
              ✓ {savedNotice}
            </span>
          )}

          <button
            type="button"
            onClick={() => triggerSave("Enregistré")}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs font-bold transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Enregistrer</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-brand-secondary border border-brand-accent/30 text-brand-cream text-xs font-bold transition"
            title="Imprimer le conducteur épuré pour le studio"
          >
            <Printer className="w-3.5 h-3.5 text-brand-accent" />
            <span>Imprimer / PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Onglets de Navigation de la Fiche */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 print:hidden">
        <button
          onClick={() => setActiveTab("rundown")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "rundown"
              ? "bg-brand-primary text-brand-cream border border-brand-accent/40 shadow-md shadow-brand-secondary/40"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Timer className="w-4 h-4 text-brand-accent" />
          <span>Conducteur d'antenne (Rundown en direct)</span>
        </button>

        <button
          onClick={() => setActiveTab("preparation")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "preparation"
              ? "bg-brand-primary text-brand-cream border border-brand-accent/40 shadow-md shadow-brand-secondary/40"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4 text-brand-accentLight" />
          <span>Préparation & Questions</span>
        </button>

        <button
          onClick={() => setActiveTab("derushage")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "derushage"
              ? "bg-brand-primary text-brand-cream border border-brand-accent/40 shadow-md shadow-brand-secondary/40"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Quote className="w-4 h-4 text-amber-400" />
          <span>Dérushage & Citations ({quotes.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ONGLET 2 : CONDUCTEUR D'ANTENNE & CHRONOMÈTRE (RUNDOWN)                   */}
      {/* ========================================================================= */}
      {activeTab === "rundown" && (
        <div className="space-y-6">
          {/* Chronomètre Grand Format & Minutage */}
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 print:border-neutral-400">
            <div className="flex items-center gap-5">
              <div className="px-3.5 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isTimerRunning ? "bg-rose-500 animate-pulse" : "bg-neutral-600"
                  }`}
                />
                <span className="text-[11px] font-mono font-extrabold text-neutral-300 uppercase tracking-wider">
                  {isTimerRunning ? "ON AIR" : "STUDIO PAUSE"}
                </span>
              </div>

              <div className="font-mono text-5xl sm:text-6xl font-black text-white tabular-nums tracking-tight">
                {formatTimer(timerSeconds)}
              </div>
            </div>

            {/* Indicateurs de temps calculés */}
            <div className="flex items-center gap-6 text-center sm:text-right">
              <div>
                <div className="text-[11px] text-neutral-400">Durée théorique totale</div>
                <div className="text-xl font-bold text-white font-mono mt-0.5">
                  {totalRundownMin} min
                </div>
              </div>
              <div className="border-l border-neutral-800 pl-6">
                <div className="text-[11px] text-neutral-400">Temps estimé restant</div>
                <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">
                  {remainingMinutes.toFixed(1)} min
                </div>
              </div>
            </div>

            {/* Boutons de contrôle chrono */}
            <div className="flex items-center gap-2.5 print:hidden">
              <button
                type="button"
                onClick={toggleTimer}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-lg transition active:scale-95 ${
                  isTimerRunning
                    ? "bg-rose-600 hover:bg-rose-500 text-white"
                    : "bg-brand-accent hover:bg-brand-accentLight text-white shadow-brand-accent/25"
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Lancer le direct</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetTimer}
                className="p-2.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
                title="Remise à zéro"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tableau des séquences du conducteur */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-brand-accent" />
                <h3 className="text-sm font-bold text-white">Séquences minutées du conducteur</h3>
              </div>
              <span className="text-xs text-neutral-400">
                {blocks.filter((b) => b.status === "VALIDE").length} / {blocks.length} séquences
                bouclées
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">Titre du bloc / Séquence</th>
                    <th className="py-3 px-4 w-32">Durée estimée</th>
                    <th className="py-3 px-4 w-48">Intervenant</th>
                    <th className="py-3 px-4">Notes & Relances</th>
                    <th className="py-3 px-4 w-44 print:hidden">Statut</th>
                    <th className="py-3 px-4 text-right w-16 print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {blocks.map((b, idx) => (
                    <tr
                      key={b.id}
                      className={`transition ${
                        b.status === "EN_COURS"
                          ? "bg-brand-primary/40 text-white font-medium"
                          : b.status === "VALIDE"
                          ? "opacity-60 bg-neutral-950/30"
                          : "hover:bg-neutral-800/30"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{b.title}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-accentLight">
                        ⏱ {b.durationMin} min
                      </td>
                      <td className="py-3.5 px-4 font-medium text-neutral-300">
                        {b.speaker || "Louise Presse"}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-300 italic">{b.notes}</td>
                      <td className="py-3.5 px-4 print:hidden">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setBlockStatus(b.id, "EN_ATTENTE")}
                            className={`px-2 py-1 rounded text-[10px] font-bold ${
                              b.status === "EN_ATTENTE"
                                ? "bg-neutral-800 text-neutral-200 border border-neutral-700"
                                : "text-neutral-500 hover:text-neutral-300"
                            }`}
                          >
                            Attente
                          </button>
                          <button
                            type="button"
                            onClick={() => setBlockStatus(b.id, "EN_COURS")}
                            className={`px-2 py-1 rounded text-[10px] font-bold ${
                              b.status === "EN_COURS"
                                ? "bg-brand-accent text-white shadow"
                                : "text-neutral-500 hover:text-brand-accentLight"
                            }`}
                          >
                            En cours
                          </button>
                          <button
                            type="button"
                            onClick={() => setBlockStatus(b.id, "VALIDE")}
                            className={`px-2 py-1 rounded text-[10px] font-bold ${
                              b.status === "VALIDE"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "text-neutral-500 hover:text-emerald-400"
                            }`}
                          >
                            ✓ Fini
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right print:hidden">
                        <button
                          type="button"
                          onClick={() => deleteBlock(b.id)}
                          className="p-1 text-neutral-500 hover:text-rose-400 transition"
                          title="Supprimer la séquence"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Formulaire rapide d'ajout de séquence */}
            <div className="p-4 bg-neutral-950/80 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 print:hidden">
              <input
                type="text"
                value={newBlockTitle}
                onChange={(e) => setNewBlockTitle(e.target.value)}
                placeholder="Titre du nouveau bloc (ex. 4. Question sur les finances)..."
                className="flex-1 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={newBlockDuration}
                  onChange={(e) => setNewBlockDuration(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white text-center font-mono focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  title="Durée en minutes"
                />
                <span className="text-xs text-neutral-400">min</span>

                <input
                  type="text"
                  value={newBlockSpeaker}
                  onChange={(e) => setNewBlockSpeaker(e.target.value)}
                  placeholder="Intervenant"
                  className="w-32 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />

                <button
                  type="button"
                  onClick={addBlock}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter séquence</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ONGLET 1 : PRÉPARATION & QUESTIONS                                        */}
      {/* ========================================================================= */}
      {activeTab === "preparation" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne Gauche : Fiche Invité */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800">
                <UserCheck className="w-4 h-4 text-brand-accent" />
                <h3 className="text-sm font-bold text-white">Fiche d'identité de l'Invité</h3>
              </div>

              {interview.contact ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="text-neutral-400 text-[11px]">Nom & Prénom</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {interview.contact.nom}
                    </div>
                  </div>

                  {interview.contact.entreprise && (
                    <div>
                      <div className="text-neutral-400 text-[11px]">Fonction / Organisation</div>
                      <div className="font-semibold text-neutral-200 mt-0.5">
                        {interview.contact.entreprise}
                      </div>
                    </div>
                  )}

                  {interview.contact.email && (
                    <div>
                      <div className="text-neutral-400 text-[11px]">Email direct</div>
                      <a
                        href={`mailto:${interview.contact.email}`}
                        className="text-brand-accent hover:underline mt-0.5 block font-mono"
                      >
                        {interview.contact.email}
                      </a>
                    </div>
                  )}

                  {interview.contact.telephone && (
                    <div>
                      <div className="text-neutral-400 text-[11px]">Téléphone</div>
                      <div className="text-neutral-200 mt-0.5 font-mono">
                        {interview.contact.telephone}
                      </div>
                    </div>
                  )}

                  {interview.contact.notes && (
                    <div className="pt-2 border-t border-neutral-800">
                      <div className="text-neutral-400 text-[11px]">Notes de veille / Biographie</div>
                      <p className="text-neutral-300 italic mt-1 leading-relaxed">
                        {interview.contact.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-neutral-500 italic">
                  Aucun contact rattaché à cette interview.
                </div>
              )}
            </div>

            {/* Brief de tournage */}
            <div className="p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800 shadow-xl space-y-3 text-xs">
              <h4 className="font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-accentLight" />
                <span>Angle d'enquête & Brief</span>
              </h4>
              <p className="text-neutral-300 leading-relaxed">
                {interview.notes || "Aucun brief spécifique renseigné."}
              </p>
              {interview.deliverables && (
                <div className="pt-2 border-t border-neutral-800 text-[11px]">
                  <strong className="text-neutral-400">Livrables :</strong> {interview.deliverables}
                </div>
              )}
            </div>
          </div>

          {/* Colonne Droite : Trame des Questions Ordonnables */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-brand-accent" />
                  <h3 className="text-sm font-bold text-white">
                    Trame des questions ordonnables ({questions.length})
                  </h3>
                </div>
                <span className="text-xs text-neutral-400">
                  {questions.filter((q) => q.answered).length} abordée(s)
                </span>
              </div>

              {/* Liste des questions */}
              <div className="space-y-2.5">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      q.answered
                        ? "bg-neutral-950/40 border-neutral-800/80 opacity-60"
                        : "bg-neutral-950/80 border-neutral-800 hover:border-brand-accent/40"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={q.answered}
                        onChange={() => toggleQuestionAnswered(q.id)}
                        className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-brand-accent focus:ring-brand-accent accent-brand-accent cursor-pointer"
                        title="Marquer comme abordée"
                      />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-neutral-500 font-bold">
                          QUESTION #{idx + 1}
                        </span>
                        <p
                          className={`text-xs font-medium ${
                            q.answered ? "text-neutral-400 line-through" : "text-white"
                          }`}
                        >
                          {q.text}
                        </p>
                      </div>
                    </div>

                    {/* Ordonnancement & Suppression */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => moveQuestion(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded bg-neutral-900 text-neutral-400 hover:text-white disabled:opacity-30"
                        title="Monter"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(idx, "down")}
                        disabled={idx === questions.length - 1}
                        className="p-1 rounded bg-neutral-900 text-neutral-400 hover:text-white disabled:opacity-30"
                        title="Descendre"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteQuestion(q.id)}
                        className="p-1 rounded bg-neutral-900 text-neutral-500 hover:text-rose-400"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulaire ajout de question */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addQuestion();
                    }
                  }}
                  placeholder="Saisissez une nouvelle question clé pour l'interview..."
                  className="flex-1 px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold transition shadow-sm"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ONGLET 3 : DÉRUSHAGE, RETRANSCRIPTION & CITATIONS (PUNCHLINES)             */}
      {/* ========================================================================= */}
      {activeTab === "derushage" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 2 Colonnes : Zone de transcription brute & Lecteur Audio */}
          <div className="lg:col-span-2 space-y-4">
            {/* Champ Lien Audio */}
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 flex-shrink-0">
                <Volume2 className="w-4 h-4 text-brand-accent" />
                <span>Flux / Fichier audio du rush :</span>
              </div>
              <input
                type="url"
                value={audioUrlInput}
                onChange={(e) => setAudioUrlInput(e.target.value)}
                placeholder="https://audio.local/rushes/interview-raw.mp3"
                className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
              <button
                type="button"
                onClick={() => triggerSave("Lien audio mis à jour")}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl"
              >
                Enregistrer le lien
              </button>
            </div>

            {/* Lecteur Audio Intégré si audioUrl présent */}
            {audioUrlInput && (
              <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
                <audio src={audioUrlInput} controls className="w-full h-10 accent-amber-400" />
              </div>
            )}

            {/* Zone de Retranscription */}
            <div className="p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-accentLight" />
                    <span>Retranscription intégrale & Verbatims</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Sélectionnez une phrase avec votre souris pour l'extraire immédiatement en citation.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExtractFromSelection}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold transition"
                  title="Extraire le texte sélectionné"
                >
                  <Quote className="w-3.5 h-3.5" />
                  <span>Extraire la sélection</span>
                </button>
              </div>

              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                onMouseUp={handleExtractFromSelection}
                rows={14}
                placeholder="Collez ou rédigez ici la retranscription brute de l'enregistrement..."
                className="w-full p-4 bg-neutral-950/90 border border-neutral-800 rounded-2xl text-xs sm:text-sm text-neutral-200 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-accent resize-y"
              />
            </div>
          </div>

          {/* Colonne Droite : Barre Latérale Citations / Punchlines */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800 shadow-xl space-y-4 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Quote className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Punchlines & Citations Clés</h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {quotes.length} extraite{quotes.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Formulaire ajout citation */}
              <div className="space-y-2.5 p-3.5 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
                <textarea
                  value={selectedQuoteText}
                  onChange={(e) => setSelectedQuoteText(e.target.value)}
                  rows={3}
                  placeholder="Phrase clé / citation à sauvegarder..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={selectedQuoteSpeaker}
                    onChange={(e) => setSelectedQuoteSpeaker(e.target.value)}
                    placeholder="Intervenant"
                    className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                  <input
                    type="text"
                    value={selectedQuoteTime}
                    onChange={(e) => setSelectedQuoteTime(e.target.value)}
                    placeholder="Timecode (ex. 04:22)"
                    className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <button
                  type="button"
                  onClick={addQuote}
                  disabled={!selectedQuoteText.trim()}
                  className="w-full py-2 bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                >
                  Ajouter à la liste des citations
                </button>
              </div>

              {/* Liste des citations */}
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {quotes.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500 italic">
                    Aucune citation extraite. Sélectionnez du texte dans la retranscription pour l'ajouter.
                  </div>
                ) : (
                  quotes.map((q) => (
                    <div
                      key={q.id}
                      className="p-3.5 bg-neutral-950/70 border border-neutral-800 hover:border-amber-400/40 rounded-2xl space-y-2 group transition"
                    >
                      <p className="text-xs text-neutral-200 italic leading-relaxed">
                        « {q.text} »
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-900 text-neutral-400">
                        <span className="font-semibold text-brand-cream">{q.speaker}</span>
                        {q.timestamp && (
                          <span className="font-mono text-neutral-500">⏱ {q.timestamp}</span>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyQuote(q)}
                            className="p-1 text-neutral-400 hover:text-white transition"
                            title="Copier la citation"
                          >
                            {copiedQuoteId === q.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteQuote(q.id)}
                            className="p-1 text-neutral-500 hover:text-rose-400 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
