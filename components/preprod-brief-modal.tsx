"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  FileText,
  Calendar,
  ShieldAlert,
  Radio,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import {
  analyzeBriefAction,
  createProductionFromBriefAction,
} from "@/app/(app)/podcasts/actions-preprod";
import { StructuredBriefResult, PlannedCalendarItem } from "@/lib/brief-analyzer";

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface PreprodBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_PITCH = `Projet de série audio : "L'Or Vert des Caraïbes : Le Scandale des Terres Confisquées"
Synopsis : Une enquête exclusive en 4 épisodes sur les dépossessions foncières illégales et les conflits d'usage de l'eau en Martinique et Guadeloupe.
Entre lobbyings agro-industriels, familles paysannes privées de leurs titres et alertes environnementales, ce récit sonore donne la parole aux témoins de première ligne.
Plusieurs adolescents et familles vivant sur les parcelles sinistrées témoignent à visage découvert ou sous anonymat.

Planning envisagé :
- Tournage et recueil des témoignages sur le terrain prévu du 10 au 14 octobre 2026.
- Première diffusion du premier volet sur les plateformes le 28 octobre 2026.
- Campagne de communication et teaser officiel lancé sur Instagram : https://instagram.com/vlalesjournaleux/reel/terres-confisquees`;

export default function PreprodBriefModal({
  isOpen,
  onClose,
}: PreprodBriefModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [rawText, setRawText] = useState("");
  const [isAnalyzing, startAnalyze] = useTransition();
  const [isCreating, startCreate] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Données éditables après analyse
  const [structured, setStructured] = useState<StructuredBriefResult | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [themes, setThemes] = useState<string[]>([]);
  const [episodesCount, setEpisodesCount] = useState(4);
  const [events, setEvents] = useState<PlannedCalendarItem[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [witnessProfiles, setWitnessProfiles] = useState<string[]>([]);
  const [deontologicalAlerts, setDeontologicalAlerts] = useState<string[]>([]);

  // Campagne Teaser Vitrine
  const [enableTeaser, setEnableTeaser] = useState(true);
  const [teaserTitle, setTeaserTitle] = useState("");
  const [teaserHook, setTeaserHook] = useState("");
  const [teaserBadge, setTeaserBadge] = useState("Bientôt disponible");
  const [teaserLinkUrl, setTeaserLinkUrl] = useState("https://instagram.com/vlalesjournaleux");

  if (!isOpen) return null;

  const handleLoadSample = () => {
    setRawText(SAMPLE_PITCH);
    setError(null);
  };

  const handleAnalyze = () => {
    if (!rawText || rawText.trim().length < 20) {
      setError("Veuillez coller un texte de pitch ou note d'intention d'au moins quelques lignes.");
      return;
    }
    setError(null);

    startAnalyze(async () => {
      const res = await analyzeBriefAction(rawText);
      if (res.success && res.data) {
        const d = res.data;
        setStructured(d);
        setTitle(d.project.title);
        setDescription(d.project.description);
        setThemes(d.project.themes);
        setEpisodesCount(d.project.episodesCount);
        setEvents(d.planning.events);
        setQuestions(d.fieldGuide.suggestedQuestions);
        setWitnessProfiles(d.fieldGuide.targetWitnessProfiles);
        setDeontologicalAlerts(d.fieldGuide.deontologicalAlerts);

        setTeaserTitle(d.teaser.suggestedTitle);
        setTeaserHook(d.teaser.suggestedHook);
        setTeaserBadge(d.teaser.suggestedBadge);
        setTeaserLinkUrl(d.teaser.instagramUrl || "https://instagram.com/vlalesjournaleux");

        setStep(2);
      } else {
        setError(res.error || "Impossible d'analyser ce brief.");
      }
    });
  };

  const handleCreate = () => {
    setError(null);
    startCreate(async () => {
      const payload = {
        title,
        description,
        themes,
        episodesCount,
        events,
        questions,
        witnessProfiles,
        deontologicalAlerts,
        enableTeaser,
        teaserTitle,
        teaserHook,
        teaserBadge,
        teaserLinkUrl,
        teaserReleaseDate: events.find((e) => e.eventType === "DIFFUSION")?.startDate || null,
      };

      const res = await createProductionFromBriefAction(payload);
      if (res.success && res.podcastId) {
        onClose();
        router.push(`/podcasts/${res.podcastId}`);
        router.refresh();
      } else {
        setError(res.error || "Erreur lors de la création de la production.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
        {/* En-tête de la modale */}
        <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary border border-brand-accent/40 text-brand-accentLight flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Assistant de Cadrage & Pré-production</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-accent/20 text-brand-accentLight border border-brand-accent/40 uppercase font-semibold">
                  IA Éditoriale
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Transformez un pitch brut en projet de série, planning de tournage et campagne de teasing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps de la modale */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            /* ÉTAPE 1 : Saisie ou collage du brief brut */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                  Collez le brief brut, email ou note d&apos;intention
                </label>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs text-brand-accent hover:text-brand-accentLight font-semibold flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Charger un exemple de pitch audio</span>
                </button>
              </div>

              <textarea
                rows={11}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Exemple :
Titre du projet : Enquête sur les marchés publics sans mise en concurrence
Synopsis : Récit d'investigation en 4 volets sur les dérives budgétaires...
Dates : Tournage terrain prévu le 12 octobre 2026, sortie du premier épisode le 28 octobre.
Instagram : https://instagram.com/vlalesjournaleux/..."
                className="w-full p-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent leading-relaxed font-mono"
              />

              <div className="p-4 rounded-2xl bg-brand-primary/40 border border-brand-accent/20 flex items-start gap-3 text-xs text-brand-cream/80">
                <ShieldAlert className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  L&apos;assistant détecte automatiquement le titre, le synopsis, le nombre d&apos;épisodes, les jalons de tournage, les alertes déontologiques (anonymat, accord parental) et le lien Instagram pour la vitrine.
                </div>
              </div>
            </div>
          ) : (
            /* ÉTAPE 2 : Résultats structurés et éditables */
            <div className="space-y-6">
              {/* 1. Projet & Série */}
              <div className="p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-xs font-mono uppercase text-brand-accentLight font-bold flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    <span>1. Projet & Série Documentaire</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">Épisodes prévus :</span>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={episodesCount}
                      onChange={(e) => setEpisodesCount(Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white text-center font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-neutral-400 block mb-1">Titre de la série</span>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-brand-accent"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block mb-1">Synopsis / Pitch narratif</span>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-accent leading-relaxed"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {themes.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-brand-secondary text-brand-cream border border-brand-accent/30"
                      >
                        🏷️ {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Planning & Événements Détectés */}
              <div className="p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-3">
                <div className="text-xs font-mono uppercase text-indigo-400 font-bold flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <Calendar className="w-4 h-4" />
                  <span>2. Planning & Jalons Détectés (Injection CalendarEvent)</span>
                </div>

                <div className="space-y-2">
                  {events.map((evt, idx) => (
                    <div
                      key={evt.id || idx}
                      className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              evt.eventType === "DIFFUSION"
                                ? "bg-emerald-400"
                                : evt.eventType === "TOURNAGE"
                                ? "bg-amber-400"
                                : "bg-indigo-400"
                            }`}
                          />
                          <span>{evt.title}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono">
                          📅 {new Date(evt.startDate).toLocaleDateString("fr-FR")} • {evt.location}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-neutral-800 text-neutral-300">
                        {evt.eventType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Guide d'Entretien Terrain & Déontologie */}
              <div className="p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-4">
                <div className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <ShieldAlert className="w-4 h-4" />
                  <span>3. Guide d&apos;Entretien & Déontologie Journalistique</span>
                </div>

                {/* Vigilance Déontologique */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Points de vigilance déontologique identifiés :</span>
                  </span>
                  <div className="space-y-1">
                    {deontologicalAlerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs leading-relaxed"
                      >
                        {alert}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Questions Suggérées */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-300">
                    Pistes de questions ouvertes suggérées :
                  </span>
                  <ul className="space-y-1 text-xs text-neutral-300 list-disc list-inside">
                    {questions.map((q, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 4. Campagne Teasing Vitrine (Optionnelle mais activée) */}
              <div className="p-5 rounded-2xl bg-brand-primary/40 border border-brand-accent/40 space-y-4">
                <div className="flex items-center justify-between border-b border-brand-accent/20 pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-brand-accentLight font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>4. Campagne Teasing &quot;À la une&quot; sur le Site Vitrine</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                    <input
                      type="checkbox"
                      checked={enableTeaser}
                      onChange={(e) => setEnableTeaser(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent bg-neutral-900 border-neutral-700"
                    />
                    <span>Activer sur la Vitrine</span>
                  </label>
                </div>

                {enableTeaser && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-brand-cream/70 block mb-1">
                          Badge d&apos;accroche
                        </span>
                        <input
                          type="text"
                          value={teaserBadge}
                          onChange={(e) => setTeaserBadge(e.target.value)}
                          className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-brand-cream/70 block mb-1">
                          Lien annonce Instagram
                        </span>
                        <div className="relative">
                          <InstagramIcon className="w-3.5 h-3.5 text-pink-400 absolute left-3 top-2.5 pointer-events-none" />
                          <input
                            type="url"
                            value={teaserLinkUrl}
                            onChange={(e) => setTeaserLinkUrl(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-brand-cream/70 block mb-1">
                        Phrase d&apos;accroche teaser
                      </span>
                      <textarea
                        rows={2}
                        value={teaserHook}
                        onChange={(e) => setTeaserHook(e.target.value)}
                        className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pied de la modale */}
        <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition"
            >
              Modifier le texte brut
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold transition"
            >
              Annuler
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/25 transition active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? "Analyse & Structuration..." : "Analyser & Cadrer la production"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              disabled={isCreating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCreating ? "Création & Synchronisation..." : "Créer la production & Synchroniser le planning"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
