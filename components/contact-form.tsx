"use client";

import { useActionState } from "react";
import { submitContactAction } from "@/app/(public)/actions";
import { Send, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactAction,
    null
  );

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative">
      {state?.success ? (
        <div className="py-12 px-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Demande bien reçue !
          </h3>
          <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
            {state.message}
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-4"
            >
              Envoyer un autre message
            </button>
          </div>
        </div>
      ) : (
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-200">{state.error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="nom"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2"
              >
                Nom et Prénom *
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                required
                placeholder="Ex. Sarah Mercier"
                className="w-full px-4 py-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2"
              >
                Adresse e-mail professionnelle *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="s.mercier@media-ou-entreprise.fr"
                className="w-full px-4 py-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="telephone"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2"
              >
                Téléphone (optionnel)
              </label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                placeholder="+33 6 00 00 00 00"
                className="w-full px-4 py-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label
                htmlFor="entreprise"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2"
              >
                Organisation / Entreprise / Média
              </label>
              <input
                id="entreprise"
                name="entreprise"
                type="text"
                placeholder="Ex. Groupe Radio, Festival, Entreprise B2B"
                className="w-full px-4 py-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2"
            >
              Nature de la demande
            </label>
            <select
              id="type"
              name="type"
              defaultValue="CLIENT_B2B"
              className="w-full px-4 py-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
            >
              <option value="CLIENT_B2B">
                Commande de prestation (Podcast, Modération, Enquête)
              </option>
              <option value="ATTACHE_PRESSE">
                Relation Presse & Communication (Attaché de presse)
              </option>
              <option value="INVITE">
                Proposition de sujet d&apos;enquête ou expertise d&apos;invité
              </option>
              <option value="DIFFUSEUR">
                Diffuseur / Partenariat média de diffusion
              </option>
              <option value="PARTENAIRE">Autre collaboration</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2"
            >
              Détails du projet / Cahier des charges *
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              placeholder="Précisez le contexte de votre événement, le format de podcast souhaité, la thématique, le calendrier envisagé ou le budget estimé..."
              className="w-full px-4 py-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition resize-y"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-sm shadow-xl shadow-brand-accent/20 hover:shadow-brand-accent/30 transition-all duration-200 transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Envoyer la demande de devis</span>
                  <Send className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
            <span className="block sm:inline-block sm:ml-4 text-xs text-neutral-400 mt-2 sm:mt-0">
              Réponse garantie sous 24 à 48h. Confidentialité assurée.
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
