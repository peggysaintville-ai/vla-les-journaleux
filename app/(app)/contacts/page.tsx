import { Metadata } from "next";
import { Users, Plus, Mail, Phone, Building, Search, Filter } from "lucide-react";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "CRM & Répertoire Contacts | V'LÀ LES JOURNALEUX",
  description: "Gestion des sources, rédactions partenaires, diffuseurs et prospects.",
};

export default async function ContactsPage() {
  let contactsList: any[] = [];
  try {
    contactsList = await db.contact.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  } catch (e) {
    // Si la base est déconnectée
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Actions Rapides */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary border border-brand-accent/30 text-brand-accent flex items-center justify-center shadow-md shadow-brand-secondary/40">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              CRM & Répertoire de Contacts
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Demandes issues du site vitrine, rédactions en chef et sources sécurisées
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau contact</span>
          </button>
        </div>
      </div>

      {/* 2. Filtres & Recherche */}
      <div className="flex items-center justify-between gap-4 p-3 bg-neutral-900/40 border border-neutral-800 rounded-2xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher par nom, média ou email..."
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400 hover:text-white transition"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filtres avancés</span>
        </button>
      </div>

      {/* 3. Tableau ou État vide */}
      {contactsList.length > 0 ? (
        <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="px-6 py-4">Nom / Média</th>
                <th className="px-6 py-4">Coordonnées</th>
                <th className="px-6 py-4">Sujet / Message</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {contactsList.map((contact) => (
                <tr key={contact.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{contact.nom || contact.name}</div>
                    {(contact.entreprise || contact.company) && (
                      <div className="text-[11px] text-neutral-400">{contact.entreprise || contact.company}</div>
                    )}
                    {contact.siren && (
                      <div className="text-[10px] font-mono text-emerald-400/90 mt-0.5">
                        SIREN : {contact.siren}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <Mail className="w-3 h-3 text-neutral-500" />
                      <span>{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
                        <Phone className="w-3 h-3 text-neutral-500" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-neutral-400">
                    {contact.message || contact.subject || "Prise de contact via la vitrine"}
                  </td>
                  <td className="px-6 py-4 text-right text-[11px] font-mono text-neutral-500">
                    {new Date(contact.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 sm:p-16 rounded-3xl bg-neutral-900/30 border border-dashed border-neutral-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-brand-primary/80 border border-brand-accent/30 text-brand-accent flex items-center justify-center mx-auto shadow-xl shadow-brand-secondary/40">
            <Users className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">Aucun contact enregistré pour le moment</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Les demandes de devis et messages reçus depuis votre site vitrine public seront automatiquement enregistrés dans cette section.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-secondary hover:bg-brand-primary text-brand-cream border border-brand-accent/30 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5 text-brand-accent" />
              <span>Ajouter un premier contact</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
