"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Mic2,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  UserCheck,
  Clock,
  ArrowRight,
  Archive,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  FileText,
  User,
  Quote,
  Sparkles,
} from "lucide-react";
import { InterviewStatus } from "@prisma/client";
import {
  createInterviewAction,
  updateInterviewStatusAction,
  archiveInterviewAction,
  deleteInterviewAction,
  InterviewFormData,
} from "@/app/(app)/interviews/actions";
import PreprodBriefModal from "@/components/preprod-brief-modal";

// Statuts demandés
const STATUS_TABS: { status: InterviewStatus | "ALL"; label: string; color: string }[] = [
  { status: "ALL", label: "Toutes", color: "border-neutral-700 text-neutral-300" },
  { status: InterviewStatus.PREPARATION, label: "Préparation", color: "border-amber-400/40 text-amber-400 bg-amber-400/10" },
  { status: InterviewStatus.PLANIFIE, label: "Planifié", color: "border-sky-400/40 text-sky-400 bg-sky-400/10" },
  { status: InterviewStatus.TOURNE, label: "Tourné", color: "border-indigo-400/40 text-indigo-400 bg-indigo-400/10" },
  { status: InterviewStatus.DERUSHE, label: "Dérushé", color: "border-purple-400/40 text-purple-400 bg-purple-400/10" },
  { status: InterviewStatus.LIVRE, label: "Livré", color: "border-emerald-400/40 text-emerald-400 bg-emerald-400/10" },
  { status: InterviewStatus.ARCHIVE, label: "Archivé", color: "border-neutral-700 text-neutral-500 bg-neutral-900" },
];

interface ContactOption {
  id: string;
  nom: string;
  entreprise: string | null;
  type: string;
}

interface InterviewItem {
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
  createdAt: Date;
  contact: {
    id: string;
    nom: string;
    entreprise: string | null;
    email: string | null;
    telephone: string | null;
  } | null;
}

interface InterviewsListClientProps {
  initialInterviews: InterviewItem[];
  availableContacts: ContactOption[];
}

export default function InterviewsListClient({
  initialInterviews,
  availableContacts,
}: InterviewsListClientProps) {
  const [interviews, setInterviews] = useState<InterviewItem[]>(initialInterviews);
  const [activeStatus, setActiveStatus] = useState<InterviewStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreprodModalOpen, setIsPreprodModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [contactId, setContactId] = useState("");
  const [isQuickCreateContact, setIsQuickCreateContact] = useState(false);
  const [newContactNom, setNewContactNom] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactEntreprise, setNewContactEntreprise] = useState("");
  const [shootingDate, setShootingDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [status, setStatus] = useState<InterviewStatus>(InterviewStatus.PREPARATION);

  const openCreateModal = () => {
    setTitle("");
    setContactId(availableContacts[0]?.id || "");
    setIsQuickCreateContact(false);
    setNewContactNom("");
    setNewContactEmail("");
    setNewContactEntreprise("");
    setShootingDate("");
    setLocation("");
    setNotes("");
    setDeliverables("");
    setStatus(InterviewStatus.PREPARATION);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const res = await archiveInterviewAction(id);
      if (res.success && res.interview) {
        setInterviews((prev) =>
          prev.map((it) => (it.id === id ? { ...it, status: InterviewStatus.ARCHIVE } : it))
        );
      }
    });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Voulez-vous vraiment supprimer définitivement cette interview ?")) return;
    startTransition(async () => {
      const res = await deleteInterviewAction(id);
      if (res.success) {
        setInterviews((prev) => prev.filter((it) => it.id !== id));
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Le titre du projet est obligatoire.");
      return;
    }

    if (isQuickCreateContact && !newContactNom.trim()) {
      setFormError("Le nom du nouvel invité est obligatoire.");
      return;
    }

    startTransition(async () => {
      const payload: InterviewFormData = {
        title,
        status,
        contactId: isQuickCreateContact ? undefined : contactId || undefined,
        shootingDate: shootingDate || undefined,
        location: location || undefined,
        notes: notes || undefined,
        deliverables: deliverables || undefined,
        newContact: isQuickCreateContact
          ? {
              nom: newContactNom,
              email: newContactEmail || undefined,
              entreprise: newContactEntreprise || undefined,
            }
          : undefined,
      };

      const res = await createInterviewAction(payload);
      if (res.success && res.interview) {
        const contactObj = isQuickCreateContact
          ? {
              id: res.interview.contactId || "new",
              nom: newContactNom,
              entreprise: newContactEntreprise || null,
              email: newContactEmail || null,
              telephone: null,
            }
          : availableContacts.find((c) => c.id === contactId)
          ? {
              id: contactId,
              nom: availableContacts.find((c) => c.id === contactId)!.nom,
              entreprise: availableContacts.find((c) => c.id === contactId)!.entreprise,
              email: null,
              telephone: null,
            }
          : null;

        setInterviews((prev) => [
          {
            ...(res.interview as any),
            contact: contactObj,
          },
          ...prev,
        ]);
        setIsModalOpen(false);
      } else {
        setFormError(res.error || "Erreur lors de la création.");
      }
    });
  };

  const filteredInterviews = interviews.filter((it) => {
    const matchesStatus = activeStatus === "ALL" || it.status === activeStatus;
    const matchesSearch =
      it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (it.contact?.nom && it.contact.nom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (it.notes && it.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (st: InterviewStatus) => {
    switch (st) {
      case InterviewStatus.PREPARATION:
        return "bg-amber-400/10 text-amber-400 border-amber-400/30";
      case InterviewStatus.PLANIFIE:
        return "bg-sky-400/10 text-sky-400 border-sky-400/30";
      case InterviewStatus.TOURNE:
        return "bg-indigo-400/10 text-indigo-400 border-indigo-400/30";
      case InterviewStatus.DERUSHE:
        return "bg-purple-400/10 text-purple-400 border-purple-400/30";
      case InterviewStatus.LIVRE:
        return "bg-emerald-400/10 text-emerald-400 border-emerald-400/30";
      case InterviewStatus.ARCHIVE:
        return "bg-neutral-800 text-neutral-400 border-neutral-700";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Actions Rapides */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary border border-brand-accent/30 text-brand-accent flex items-center justify-center shadow-md shadow-brand-secondary/40">
            <Mic2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Interviews, Dérushage & Conducteur d'antenne
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cadrage éditorial, trames de questions, minutage studio et extraction de citations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setIsPreprodModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-brand-secondary hover:bg-brand-primary text-brand-cream hover:text-white border border-brand-accent/40 text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-brand-accentLight" />
            <span>Préparer une production depuis un brief</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            id="new-interview-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/20 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle interview</span>
          </button>
        </div>
      </div>

      {/* 2. Filtres par statut (Tabs) & Recherche */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.status}
              onClick={() => setActiveStatus(tab.status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                activeStatus === tab.status
                  ? "bg-brand-primary text-brand-cream border-brand-accent shadow-md shadow-brand-secondary/50"
                  : "bg-neutral-900/60 text-neutral-400 hover:text-white border-neutral-800 hover:border-neutral-700"
              }`}
            >
              {tab.label}
              {tab.status !== "ALL" && (
                <span className="ml-2 font-mono text-[10px] opacity-70">
                  {interviews.filter((i) => i.status === tab.status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 p-3 bg-neutral-900/40 border border-neutral-800 rounded-2xl">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par sujet, invité, angle..."
              className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
          <div className="text-xs text-neutral-400">
            {filteredInterviews.length} interview{filteredInterviews.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* 3. Liste / Tableau des Interviews */}
      {filteredInterviews.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl bg-neutral-900/30 border border-dashed border-neutral-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-brand-primary/80 border border-brand-accent/30 text-brand-accent flex items-center justify-center mx-auto shadow-xl shadow-brand-secondary/40">
            <Mic2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">Aucune interview trouvée</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Planifiez une nouvelle interview, préparez votre conducteur de direct et associez un invité.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold transition shadow-lg shadow-brand-accent/20"
          >
            <Plus className="w-4 h-4" />
            <span>Créer une interview</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInterviews.map((item) => {
            const dateStr = item.shootingDate
              ? new Date(item.shootingDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Date à fixer";

            const rundownBlocks = Array.isArray(item.rundown) ? item.rundown : [];
            const questionsCount = Array.isArray(item.questions) ? item.questions.length : 0;
            const quotesCount = Array.isArray(item.quotes) ? item.quotes.length : 0;

            return (
              <div
                key={item.id}
                className="group bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800 hover:border-brand-accent/40 rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>

                    {item.contact && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-950 border border-neutral-800 text-brand-cream">
                        <UserCheck className="w-3.5 h-3.5 text-brand-accentLight" />
                        <span>{item.contact.nom}</span>
                        {item.contact.entreprise && (
                          <span className="text-neutral-500 font-normal">
                            ({item.contact.entreprise})
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <div>
                    <Link
                      href={`/interviews/${item.id}`}
                      className="text-lg font-black text-white group-hover:text-brand-accent transition-colors tracking-tight line-clamp-1 inline-block"
                    >
                      {item.title}
                    </Link>
                    {item.notes && (
                      <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Métadonnées de tournage & badge rundown */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{dateStr}</span>
                    </div>

                    {item.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="truncate max-w-[200px]">{item.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 border-l border-neutral-800 pl-3">
                      <span className="text-[11px] font-mono">
                        📋 {questionsCount} question{questionsCount > 1 ? "s" : ""}
                      </span>
                      <span className="text-[11px] font-mono">
                        ⏱ {rundownBlocks.length} séquences
                      </span>
                      {quotesCount > 0 && (
                        <span className="text-[11px] font-mono text-amber-400">
                          💬 {quotesCount} citation{quotesCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Boutons d'Action */}
                <div className="flex items-center gap-3 self-end lg:self-center flex-shrink-0">
                  {item.status !== InterviewStatus.ARCHIVE && (
                    <button
                      onClick={(e) => handleArchive(item.id, e)}
                      className="p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
                      title="Archiver l'interview"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2.5 rounded-xl bg-neutral-950 hover:bg-rose-950/80 text-neutral-400 hover:text-rose-400 border border-neutral-800 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    href={`/interviews/${item.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-secondary border border-brand-accent/30 text-brand-cream text-xs font-bold transition group-hover:border-brand-accent"
                  >
                    <span>Ouvrir la fiche</span>
                    <ArrowRight className="w-4 h-4 text-brand-accent" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Modale de Création d'Interview */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary border border-brand-accent/30 text-brand-accent flex items-center justify-center">
                  <Mic2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Nouvelle Interview</h3>
                  <p className="text-xs text-neutral-400">
                    Sujet, invité, date de tournage et brief d'angle
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Titre du projet / Sujet d'enquête *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex. Enquête Cabinets de Conseil, Débat Souveraineté..."
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  required
                />
              </div>

              {/* Sélection / Création Invité */}
              <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">
                    Invité ou Source associée
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsQuickCreateContact(!isQuickCreateContact)}
                    className="text-[11px] font-bold text-brand-accent hover:underline"
                  >
                    {isQuickCreateContact
                      ? "← Choisir parmi les contacts existants"
                      : "+ Créer un nouvel invité rapidement"}
                  </button>
                </div>

                {!isQuickCreateContact ? (
                  <div>
                    <select
                      value={contactId}
                      onChange={(e) => setContactId(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                    >
                      <option value="">-- Aucun invité assigné --</option>
                      {availableContacts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom} {c.entreprise ? `(${c.entreprise})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    <input
                      type="text"
                      value={newContactNom}
                      onChange={(e) => setNewContactNom(e.target.value)}
                      placeholder="Nom et prénom de l'invité *"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newContactEntreprise}
                        onChange={(e) => setNewContactEntreprise(e.target.value)}
                        placeholder="Fonction / Organisation"
                        className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                      />
                      <input
                        type="email"
                        value={newContactEmail}
                        onChange={(e) => setNewContactEmail(e.target.value)}
                        placeholder="Email de contact"
                        className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Date & Lieu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Date de tournage / enregistrement
                  </label>
                  <input
                    type="date"
                    value={shootingDate}
                    onChange={(e) => setShootingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Lieu / Studio
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex. Studio A Radio France, distanciel Zoom..."
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>
              </div>

              {/* Brief éditorial / Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Brief éditorial & angle d'enquête
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Objectif de l'échange, éléments contradictoires à obtenir, documents d'appui..."
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Livrables attendus
                </label>
                <input
                  type="text"
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  placeholder="Ex. Conducteur 35 min + 2 extraits réseaux sociaux"
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold transition shadow-md shadow-brand-accent/20 disabled:opacity-50"
                >
                  {isPending ? "Création en cours..." : "Créer l'interview"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modale Assistant de Pré-production */}
      <PreprodBriefModal
        isOpen={isPreprodModalOpen}
        onClose={() => setIsPreprodModalOpen(false)}
      />
    </div>
  );
}
