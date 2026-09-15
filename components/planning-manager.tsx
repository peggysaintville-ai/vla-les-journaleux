"use client";

import { useState, useTransition, useActionState } from "react";
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  UserCheck,
  Video,
  Radio,
  Scissors,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
} from "lucide-react";
import {
  createPlanningSessionAction,
  deletePlanningSessionAction,
  updatePlanningStatusAction,
} from "@/app/(app)/planning/actions";

export interface PlanningUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface PlanningEvent {
  id: string;
  title: string;
  startDate: string | Date;
  endDate: string | Date;
  eventType: string | null;
  status: string | null;
  location: string | null;
  description: string | null;
  userId: string | null;
  user?: PlanningUser | null;
}

interface PlanningManagerProps {
  initialEvents: PlanningEvent[];
  journalists: PlanningUser[];
  currentUserId?: string;
}

export default function PlanningManager({
  initialEvents,
  journalists,
  currentUserId,
}: PlanningManagerProps) {
  const [events, setEvents] = useState<PlanningEvent[]>(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [, startTransition] = useTransition();

  // Valeurs du formulaire
  const [title, setTitle] = useState("");
  const [startDateTime, setStartDateTime] = useState(() => {
    // Demain à 14:00 par défaut
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(14, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [eventType, setEventType] = useState("INTERVIEW");
  const [assignedUserId, setAssignedUserId] = useState(
    currentUserId || journalists[0]?.id || ""
  );
  const [status, setStatus] = useState("PLANIFIE");
  const [location, setLocation] = useState("Studio Audio Central");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setTitle("");
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(14, 0, 0, 0);
    setStartDateTime(d.toISOString().slice(0, 16));
    setEventType("INTERVIEW");
    setAssignedUserId(currentUserId || journalists[0]?.id || "");
    setStatus("PLANIFIE");
    setLocation("Studio Audio Central");
    setDescription("");
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const [formState, formAction, isSaving] = useActionState(async (prev: unknown, fd: FormData) => {
    fd.set("eventType", eventType);
    fd.set("status", status);
    fd.set("userId", assignedUserId);

    const res = await createPlanningSessionAction(null, fd);
    if (res.success && res.event) {
      setIsModalOpen(false);
      setToast({ type: "success", text: res.message || "Session planifiée avec succès !" });
      setEvents((prevList) => [res.event, ...prevList].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      ));
      resetForm();
    } else if (res.error) {
      setToast({ type: "error", text: res.error });
    }
    return res;
  }, null);

  const handleDelete = (event: PlanningEvent) => {
    if (!confirm(`Annuler et supprimer la session "${event.title}" ?`)) return;

    startTransition(async () => {
      const res = await deletePlanningSessionAction(event.id);
      if (res.success) {
        setEvents((prev) => prev.filter((e) => e.id !== event.id));
        setToast({ type: "success", text: res.message || "Session supprimée." });
      } else if (res.error) {
        setToast({ type: "error", text: res.error });
      }
    });
  };

  const handleStatusChange = (event: PlanningEvent, nextStatus: string) => {
    startTransition(async () => {
      const res = await updatePlanningStatusAction(event.id, nextStatus);
      if (res.success) {
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, status: nextStatus } : e))
        );
        setToast({ type: "success", text: res.message || "Statut mis à jour." });
      }
    });
  };

  // Filtrage des événements
  const filteredEvents = events.filter((evt) => {
    if (selectedFilter === "ALL") return true;
    return evt.eventType === selectedFilter;
  });

  const getTypeBadge = (type: string | null) => {
    switch (type) {
      case "DIRECT":
        return {
          label: "Direct Antenne",
          icon: Radio,
          color: "bg-rose-500/15 border-rose-500/40 text-rose-300",
          dot: "bg-rose-400 animate-pulse",
        };
      case "INTERVIEW":
        return {
          label: "Interview Studio",
          icon: Video,
          color: "bg-amber-500/15 border-amber-500/40 text-amber-300",
          dot: "bg-amber-400",
        };
      case "MONTAGE":
        return {
          label: "Session Montage",
          icon: Scissors,
          color: "bg-indigo-500/15 border-indigo-500/40 text-indigo-300",
          dot: "bg-indigo-400",
        };
      case "TOURNAGE":
      default:
        return {
          label: "Tournage Terrain",
          icon: Camera,
          color: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
          dot: "bg-emerald-400",
        };
    }
  };

  const getStatusBadge = (st: string | null) => {
    switch (st) {
      case "CONFIRME":
        return { label: "Confirmé", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
      case "EN_COURS":
        return { label: "En direct / cours", color: "bg-rose-500/10 text-rose-400 border-rose-500/30" };
      case "TERMINE":
        return { label: "Terminé", color: "bg-neutral-800 text-neutral-400 border-neutral-700" };
      case "PLANIFIE":
      default:
        return { label: "Planifié", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-xl border animate-in fade-in ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header & Actions Rapides */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary border border-brand-accent/30 text-brand-accent flex items-center justify-center shadow-md shadow-brand-secondary/40">
            <Calendar className="w-5 h-5 text-brand-accentLight" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Planning Média & Tournages</span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-brand-accent/20 text-brand-accentLight border border-brand-accent/30">
                {events.length} session{events.length > 1 ? "s" : ""}
              </span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Sessions en studio, reportages de terrain, directs et montages de la rédaction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenModal}
            id="planifier-session-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/20 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Planifier une session</span>
          </button>
        </div>
      </div>

      {/* 2. Barre d'indicateurs & Filtres rapides */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-brand-accent" />
            <span>Format :</span>
          </span>
          {[
            { id: "ALL", label: "Tous les formats" },
            { id: "INTERVIEW", label: "Interviews" },
            { id: "DIRECT", label: "Directs Antenne" },
            { id: "MONTAGE", label: "Montages" },
            { id: "TOURNAGE", label: "Tournages Terrain" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                selectedFilter === tab.id
                  ? "bg-brand-accent text-white border-brand-accent shadow-sm"
                  : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span>Direct</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Interview</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Montage</span>
          </div>
        </div>
      </div>

      {/* 3. Liste des événements ou État vide */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((evt) => {
            const typeInfo = getTypeBadge(evt.eventType);
            const statusInfo = getStatusBadge(evt.status);
            const TypeIcon = typeInfo.icon;
            const startDate = new Date(evt.startDate);
            const endDate = new Date(evt.endDate);

            return (
              <div
                key={evt.id}
                className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-5 hover:border-brand-accent/40 transition-all duration-200 shadow-xl flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  {/* Badge Type & Statut */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold border ${typeInfo.color}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${typeInfo.dot}`} />
                      <TypeIcon className="w-3 h-3" />
                      <span>{typeInfo.label}</span>
                    </span>

                    <select
                      value={evt.status || "PLANIFIE"}
                      onChange={(e) => handleStatusChange(evt, e.target.value)}
                      className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border bg-neutral-950 cursor-pointer focus:outline-none ${statusInfo.color}`}
                    >
                      <option value="PLANIFIE">Planifié</option>
                      <option value="CONFIRME">Confirmé</option>
                      <option value="EN_COURS">En direct</option>
                      <option value="TERMINE">Terminé</option>
                    </select>
                  </div>

                  {/* Titre de la session */}
                  <h3 className="text-base font-bold text-white group-hover:text-brand-accentLight transition-colors line-clamp-2">
                    {evt.title}
                  </h3>

                  {/* Date & Heure */}
                  <div className="space-y-1.5 text-xs text-neutral-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        {startDate.toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                      <span>
                        {startDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        {" - "}
                        {endDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {evt.location && (
                      <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Description / Notes */}
                  {evt.description && (
                    <p className="text-xs text-neutral-400 line-clamp-2 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80">
                      {evt.description}
                    </p>
                  )}
                </div>

                {/* Pied de carte : Journaliste assigné + Action suppression */}
                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-brand-primary text-brand-accentLight border border-brand-accent/30 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {(evt.user?.name || "Peggy SAINT-VILLE").slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs text-neutral-300 truncate font-medium">
                      {evt.user?.name || "Peggy SAINT-VILLE"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(evt)}
                    className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-rose-950/50 text-neutral-400 hover:text-rose-400 transition"
                    title="Supprimer la session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* État vide soigné avec bouton actif */
        <div className="p-12 sm:p-16 rounded-3xl bg-neutral-900/30 border border-dashed border-neutral-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-brand-primary/80 border border-brand-accent/30 text-brand-accent flex items-center justify-center mx-auto shadow-xl shadow-brand-secondary/40">
            <Calendar className="w-8 h-8 text-brand-accentLight" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">
              {selectedFilter !== "ALL"
                ? "Aucune session ne correspond à ce filtre"
                : "Aucun événement programmé pour le moment"}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Ajoutez vos prochains créneaux d&apos;interviews, émissions en direct, sessions de montage ou vos jours de tournage extérieur.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold transition shadow-lg shadow-brand-accent/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Planifier une session</span>
            </button>
          </div>
        </div>
      )}

      {/* MODALE DE SAISIE : PLANIFIER UNE SESSION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            {/* Header modale */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-brand-primary border border-brand-accent/40 text-brand-accentLight shadow-md">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Planifier une session média
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Enregistrement studio, émission en direct ou tournage terrain
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formState?.error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{formState.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-5">
              {/* Titre de l'émission / tournage */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Titre de l&apos;émission / tournage *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex. Enregistrement Épisode 3 - Interview Clé Bercy"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              {/* Date & Heure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Date & Heure de début *</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startDateTime"
                    required
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Lieu / Studio</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Studio Audio Central, Extérieur..."
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                  />
                </div>
              </div>

              {/* Type d'événement : Interview / Direct / Montage / Tournage */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Type de session *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "INTERVIEW", label: "Interview", icon: Video, color: "text-amber-400 border-amber-500/40" },
                    { id: "DIRECT", label: "Direct", icon: Radio, color: "text-rose-400 border-rose-500/40" },
                    { id: "MONTAGE", label: "Montage", icon: Scissors, color: "text-indigo-400 border-indigo-500/40" },
                    { id: "TOURNAGE", label: "Tournage", icon: Camera, color: "text-emerald-400 border-emerald-500/40" },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = eventType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setEventType(t.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition ${
                          isSelected
                            ? "bg-neutral-800 border-brand-accent text-white shadow-md"
                            : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? "text-brand-accentLight" : t.color.split(" ")[0]}`} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Journaliste assigné & Statut */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-brand-accentLight" />
                    <span>Journaliste assigné *</span>
                  </label>
                  <select
                    name="userId"
                    value={assignedUserId}
                    onChange={(e) => setAssignedUserId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition cursor-pointer"
                  >
                    {journalists.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.name} ({j.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                    Statut initial *
                  </label>
                  <select
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition cursor-pointer"
                  >
                    <option value="PLANIFIE">Planifié (en attente)</option>
                    <option value="CONFIRME">Confirmé</option>
                    <option value="EN_COURS">En direct / Tournage actif</option>
                    <option value="TERMINE">Terminé</option>
                  </select>
                </div>
              </div>

              {/* Notes et description */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Notes & Consignes éditoriales (optionnel)
                </label>
                <textarea
                  name="description"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Matériel requis, fiches questions à préparer, contacts témoins..."
                  className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              {/* Actions modale */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enregistrement dans Neon...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Enregistrer la session</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
