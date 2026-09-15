"use client";

import { useState, useTransition } from "react";
import { PublicServiceItem } from "@/lib/services";
import {
  createPricingOfferAction,
  updatePricingOfferAction,
  deletePricingOfferAction,
  PricingOfferInput,
} from "@/app/(app)/catalogue/actions";
import {
  Tag,
  Plus,
  CheckCircle2,
  Pencil,
  Trash2,
  Sparkles,
  X,
  Star,
  Check,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";

interface CatalogueManagerProps {
  initialServices: PublicServiceItem[];
}

export default function CatalogueManager({ initialServices }: CatalogueManagerProps) {
  const [services, setServices] = useState<PublicServiceItem[]>(initialServices);
  const [isPending, startTransition] = useTransition();

  // Modal d'édition / création
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<PublicServiceItem | null>(null);

  // État du formulaire
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [unitPrice, setUnitPrice] = useState<number | string>(1000);
  const [unit, setUnit] = useState("par épisode");
  const [isPopular, setIsPopular] = useState(false);
  const [deliverables, setDeliverables] = useState<string[]>([
    "Cadrage éditorial & méthodologie d'enquête",
    "Production professionnelle aux normes presse",
    "Cession des droits de diffusion incluses",
    "Accompagnement et restitution clés en main",
  ]);
  const [newDeliverableInput, setNewDeliverableInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Modal de confirmation de suppression
  const [deletingService, setDeletingService] = useState<PublicServiceItem | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Ouverture du modal de création
  const openNewOfferModal = () => {
    setEditingService(null);
    setName("");
    setSubtitle("");
    setUnitPrice(1200);
    setUnit("par épisode");
    setIsPopular(false);
    setDeliverables([
      "Cadrage éditorial & méthodologie d'enquête",
      "Production professionnelle aux normes presse",
      "Cession des droits de diffusion incluses",
      "Accompagnement et restitution clés en main",
    ]);
    setNewDeliverableInput("");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Ouverture du modal de modification
  const openEditOfferModal = (service: PublicServiceItem) => {
    setEditingService(service);
    setName(service.name);
    setSubtitle(service.subtitle || service.description || "");
    setUnitPrice(service.unitPrice);
    setUnit(service.unit);
    setIsPopular(!!service.isPopular);
    setDeliverables(
      service.deliverables && service.deliverables.length > 0
        ? [...service.deliverables]
        : [
            "Cadrage éditorial & méthodologie d'enquête",
            "Production professionnelle aux normes presse",
            "Cession des droits de diffusion incluses",
            "Accompagnement et restitution clés en main",
          ]
    );
    setNewDeliverableInput("");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Gestion des livrables
  const handleAddDeliverable = () => {
    const trimmed = newDeliverableInput.trim();
    if (!trimmed) return;
    setDeliverables((prev) => [...prev, trimmed]);
    setNewDeliverableInput("");
  };

  const handleRemoveDeliverable = (indexToRemove: number) => {
    setDeliverables((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDeliverableChange = (index: number, val: string) => {
    setDeliverables((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  // Soumission du formulaire (Création ou Mise à jour)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Le titre de la prestation est obligatoire.");
      return;
    }

    const priceNum = Number(unitPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError("Le prix doit être un nombre positif ou nul.");
      return;
    }

    const cleanDeliverables = deliverables.map((d) => d.trim()).filter(Boolean);

    const payload: PricingOfferInput = {
      id: editingService ? editingService.id : undefined,
      name: name.trim(),
      subtitle: subtitle.trim(),
      unitPrice: priceNum,
      unit: unit.trim() || "forfait",
      isPopular,
      deliverables: cleanDeliverables,
      isPublic: true,
      isActive: true,
    };

    startTransition(async () => {
      if (editingService) {
        // Modification
        const res = await updatePricingOfferAction(payload);
        if (res.success && res.offer) {
          setServices((prev) =>
            prev.map((s) => (s.id === editingService.id ? (res.offer as PublicServiceItem) : s))
          );
          setIsModalOpen(false);
          showToast("success", `L'offre "${payload.name}" a été mise à jour avec succès.`);
        } else {
          setFormError(res.error || "Erreur lors de la mise à jour de l'offre.");
        }
      } else {
        // Création
        const res = await createPricingOfferAction(payload);
        if (res.success && res.offer) {
          setServices((prev) => [...prev, res.offer as PublicServiceItem]);
          setIsModalOpen(false);
          showToast("success", `L'offre "${payload.name}" a été créée avec succès.`);
        } else {
          setFormError(res.error || "Erreur lors de la création de l'offre.");
        }
      }
    });
  };

  // Suppression
  const confirmDelete = () => {
    if (!deletingService) return;
    const targetId = deletingService.id;
    const targetName = deletingService.name;

    startTransition(async () => {
      const res = await deletePricingOfferAction(targetId);
      if (res.success) {
        setServices((prev) => prev.filter((s) => s.id !== targetId));
        setDeletingService(null);
        showToast("success", `L'offre "${targetName}" a été supprimée.`);
      } else {
        showToast("error", res.error || "Erreur lors de la suppression de l'offre.");
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Notification Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border transition-all animate-in fade-in slide-in-from-bottom-5 text-sm font-medium ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/40 text-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. Header & Actions Rapides */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary border border-brand-accent/40 text-brand-accentLight flex items-center justify-center shadow-lg shadow-brand-secondary/40">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Catalogue de Tarifs & Prestations
              </h1>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-brand-accent/20 text-brand-accentLight border border-brand-accent/30 font-bold">
                {services.length} offre{services.length > 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Barème officiel appliqué aux devis et affiché en temps réel sur la vitrine publique.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Bouton vert "+ Nouvelle offre" */}
          <button
            type="button"
            onClick={openNewOfferModal}
            id="btn-nouvelle-offre"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Nouvelle offre</span>
          </button>
        </div>
      </div>

      {/* 2. Grille des offres commerciales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((item) => (
          <div
            key={item.id}
            className={`rounded-3xl bg-neutral-900/70 border ${
              item.isPopular
                ? "border-amber-500/50 shadow-amber-500/10"
                : "border-neutral-800 hover:border-brand-accent/40"
            } p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 shadow-xl group space-y-6 relative`}
          >
            {/* Ruban Badge "Populaire" si activé */}
            {item.isPopular && (
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Star className="w-3 h-3 fill-neutral-950" />
                <span>Populaire</span>
              </div>
            )}

            <div className="space-y-4">
              {/* En-tête de carte */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-brand-primary/80 text-brand-accentLight border border-brand-accent/30 font-bold">
                  {item.unit}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">En ligne</span>
                </div>
              </div>

              {/* Titre & Sous-titre */}
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white group-hover:text-brand-accentLight transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans line-clamp-3">
                  {item.subtitle || item.description}
                </p>
              </div>

              {/* Liste des livrables / inclusions */}
              {item.deliverables && item.deliverables.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-neutral-800/80">
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-brand-accentLight" />
                    <span>Livrables & Inclusions :</span>
                  </div>
                  <ul className="space-y-1.5">
                    {item.deliverables.map((deliv, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-neutral-300 flex items-start gap-2 leading-tight"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{deliv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Pied de carte : Prix et Boutons d'Action */}
            <div className="pt-5 border-t border-neutral-800/80 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-white font-mono">
                    {Number(item.unitPrice) > 0
                      ? `${Number(item.unitPrice).toLocaleString("fr-FR")} €`
                      : "Sur devis"}
                  </span>
                  {Number(item.unitPrice) > 0 && (
                    <span className="text-xs text-neutral-400 font-mono ml-1.5">
                      HT / {item.unit}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  TVA 20%
                </span>
              </div>

              {/* Boutons Modifier & Supprimer */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openEditOfferModal(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-brand-accent text-neutral-200 hover:text-white border border-neutral-700 hover:border-brand-accent text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
                  title="Modifier cette offre"
                >
                  <Pencil className="w-3.5 h-3.5 text-brand-accentLight group-hover:text-white" />
                  <span>Modifier</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingService(item)}
                  className="p-1.5 rounded-xl bg-neutral-800 hover:bg-rose-950/50 text-neutral-400 hover:text-rose-400 border border-neutral-700 hover:border-rose-500/40 transition cursor-pointer"
                  title="Supprimer cette offre"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Modal de Création / Modification d'offre */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-brand-primary border border-brand-accent/40 text-brand-accentLight shadow-md">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingService ? "Modifier l'offre commerciale" : "Créer une nouvelle prestation"}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Définissez le tarif, l&apos;unité, le statut et les inclusions de cette offre.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Titre de la prestation */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Titre de la prestation *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex. Production & Réalisation de Podcasts Documentaires"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition font-semibold"
                />
              </div>

              {/* Sous-titre / Accroche */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Sous-titre / Accroche descriptive *
                </label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={3}
                  required
                  placeholder="Résumé percutant présentant la méthodologie, l'angle journalistique et le public ciblé..."
                  className="w-full p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition resize-y leading-relaxed"
                />
              </div>

              {/* Prix (€ HT) & Unité / Période */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Prix (€ HT) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    required
                    placeholder="1200 (indiquez 0 pour 'Sur devis')"
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-100 font-mono placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition font-bold"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    Indiquez 0 pour afficher automatiquement &quot;Sur devis&quot;.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Unité / Période *
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                    list="units-list"
                    placeholder="par épisode, par jour, forfait..."
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition"
                  />
                  <datalist id="units-list">
                    <option value="par épisode" />
                    <option value="par jour" />
                    <option value="forfait" />
                    <option value="par heure" />
                    <option value="par article" />
                    <option value="sur-mesure" />
                  </datalist>
                </div>
              </div>

              {/* Badge "Populaire" (toggle ou checkbox) */}
              <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${isPopular ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-neutral-800 text-neutral-500 border-neutral-700"}`}>
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Badge &quot;Populaire&quot;</div>
                    <div className="text-[11px] text-neutral-400">
                      Met en avant cette prestation avec un ruban doré sur le site vitrine.
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 transition-colors" />
                </label>
              </div>

              {/* Liste dynamique des livrables / inclusions */}
              <div className="space-y-3 p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-brand-accentLight" />
                    <span>Livrables & Inclusions incluses</span>
                  </label>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {deliverables.length} élément{deliverables.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleDeliverableChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition"
                        title="Retirer cette inclusion"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Ajout d'une nouvelle puce */}
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                  <input
                    type="text"
                    value={newDeliverableInput}
                    onChange={(e) => setNewDeliverableInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDeliverable();
                      }
                    }}
                    placeholder="Ajouter une inclusion (ex: Mastering broadcast 24-bit)..."
                    className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-primary/80 hover:bg-brand-secondary text-brand-cream border border-brand-accent/40 text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-xs shadow-lg shadow-brand-accent/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>Enregistrer l&apos;offre</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal de Confirmation de Suppression */}
      {deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Supprimer cette offre ?</h3>
                <p className="text-xs text-neutral-400">Cette action est irréversible.</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-4 rounded-xl border border-neutral-800">
              Êtes-vous certain de vouloir supprimer définitivement l&apos;offre{" "}
              <strong className="text-white">&quot;{deletingService.name}&quot;</strong> du catalogue de tarifs ? Elle ne sera plus affichée sur la vitrine publique.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingService(null)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <span>Confirmer la suppression</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
