"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import { CompanySettingsData } from "@/lib/company-settings";
import { CollaboratorItem } from "@/lib/users";
import { AuthUserPayload } from "@/lib/auth";
import {
  updateCompanySettingsAction,
  updateUserProfileAction,
} from "@/app/(app)/parametres/actions";
import TeamManager from "@/components/team-manager";
import {
  Building2,
  Users,
  User,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Landmark,
  FileCheck,
  Mail,
  Phone,
  Globe,
  MapPin,
  Lock,
  Camera,
  Sparkles,
  Info,
} from "lucide-react";

import { UserRole } from "@prisma/client";

interface SettingsTabsProps {
  initialCompanySettings: CompanySettingsData;
  collaborators: CollaboratorItem[];
  currentUser: AuthUserPayload | null;
  userAvatar?: string | null;
}

export default function SettingsTabs({
  initialCompanySettings,
  collaborators,
  currentUser,
  userAvatar,
}: SettingsTabsProps) {
  const isCollab = currentUser?.role === UserRole.COLLABORATEUR;
  const [activeTab, setActiveTab] = useState<"company" | "team" | "profile">(
    isCollab ? "profile" : "company"
  );

  // Server action state pour l'onglet Identité & Facturation
  const [companyState, companyAction, isCompanySaving] = useActionState(
    async (prev: unknown, fd: FormData) => {
      const res = await updateCompanySettingsAction(prev, fd);
      return res;
    },
    null
  );

  // Server action state pour l'onglet Profil
  const [profileState, profileAction, isProfileSaving] = useActionState(
    async (prev: unknown, fd: FormData) => {
      const res = await updateUserProfileAction(prev, fd);
      return res;
    },
    null
  );

  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    userAvatar || "/images/journalist-portrait.jpg"
  );

  return (
    <div className="space-y-8">
      {/* 1. NAVIGATION HORIZONTALE PAR ONGLETS */}
      <div className="border-b border-neutral-800 pb-2">
        <nav className="flex space-x-2 sm:space-x-4" aria-label="Tabs">
          {!isCollab && (
            <button
              type="button"
              id="tab-btn-company"
              onClick={() => setActiveTab("company")}
              className={`flex items-center gap-2.5 px-4 py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === "company"
                  ? "bg-brand-primary text-brand-cream border border-brand-accent shadow-md shadow-brand-secondary/50"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent"
              }`}
            >
              <Building2
                className={`w-4 h-4 ${
                  activeTab === "company" ? "text-brand-accent" : "text-neutral-400"
                }`}
              />
              <span>Identité & Facturation</span>
            </button>
          )}

          {!isCollab && (
            <button
              type="button"
              id="tab-btn-team"
              onClick={() => setActiveTab("team")}
              className={`flex items-center gap-2.5 px-4 py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === "team"
                  ? "bg-brand-primary text-brand-cream border border-brand-accent shadow-md shadow-brand-secondary/50"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent"
              }`}
            >
              <Users
                className={`w-4 h-4 ${
                  activeTab === "team" ? "text-brand-accent" : "text-neutral-400"
                }`}
              />
              <span>Équipe & Accès</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === "team"
                    ? "bg-brand-accent text-white"
                    : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {collaborators.length}
              </span>
            </button>
          )}

          <button
            type="button"
            id="tab-btn-profile"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
              activeTab === "profile"
                ? "bg-brand-primary text-brand-cream border border-brand-accent shadow-md shadow-brand-secondary/50"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent"
            }`}
          >
            <User
              className={`w-4 h-4 ${
                activeTab === "profile" ? "text-brand-accent" : "text-neutral-400"
              }`}
            />
            <span>Mon Profil</span>
          </button>
        </nav>
      </div>

      {/* 2. CONTENU DU TAB 1 : IDENTITÉ & FACTURATION */}
      {!isCollab && activeTab === "company" && (
        <form action={companyAction} className="space-y-6">
          {/* Feedback Toast / Alert */}
          {companyState?.success && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{companyState.message}</span>
            </div>
          )}
          {companyState?.error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{companyState.error}</span>
            </div>
          )}

          {/* Section 1 : Raison sociale & Registres */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800/80">
              <div className="p-2.5 rounded-xl bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Informations Légales & Enregistrement
                </h3>
                <p className="text-xs text-neutral-400">
                  Raison sociale, identifiants légaux figurant sur les devis et factures éditoriales.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Raison Sociale *
                </label>
                <input
                  type="text"
                  name="legalName"
                  required
                  defaultValue={initialCompanySettings.legalName}
                  placeholder="V'LÀ LES JOURNALEUX SAS"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Nom Commercial / Marque
                </label>
                <input
                  type="text"
                  name="tradeName"
                  defaultValue={initialCompanySettings.tradeName}
                  placeholder="V'LÀ LES JOURNALEUX"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Numéro SIRET
                </label>
                <input
                  type="text"
                  name="siret"
                  defaultValue={initialCompanySettings.siret}
                  placeholder="Ex. 892 419 823 00018"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Numéro TVA Intracommunautaire
                </label>
                <input
                  type="text"
                  name="vatNumber"
                  defaultValue={initialCompanySettings.vatNumber}
                  placeholder="Ex. FR 42 892419823 (ou Néant)"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Code NAF / APE
                </label>
                <input
                  type="text"
                  name="apeCode"
                  defaultValue={initialCompanySettings.apeCode}
                  placeholder="9003B (Création artistique & journalisme d'investigation)"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2 : Coordonnées de Contact & Siège */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800/80">
              <div className="p-2.5 rounded-xl bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Adresse Postale & Coordonnées Éditoriales
                </h3>
                <p className="text-xs text-neutral-400">
                  Coordonnées figurant sur l&apos;en-tête officiel des correspondances et devis.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Adresse (Rue, Numéro, Bâtiment)
                </label>
                <input
                  type="text"
                  name="address"
                  defaultValue={initialCompanySettings.address}
                  placeholder="14 bis rue des Débats et Enquêtes"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Code Postal
                </label>
                <input
                  type="text"
                  name="postalCode"
                  defaultValue={initialCompanySettings.postalCode}
                  placeholder="75011"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  name="city"
                  defaultValue={initialCompanySettings.city}
                  placeholder="Paris"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  name="country"
                  defaultValue={initialCompanySettings.country || "France"}
                  placeholder="France"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Email de Facturation / Contact
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    defaultValue={initialCompanySettings.email}
                    placeholder="redaction@vlalesjournaleux.fr"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                  />
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={initialCompanySettings.phone}
                    placeholder="+33 1 42 68 00 00"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                  />
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Site Web Officiel
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="websiteUrl"
                    defaultValue={initialCompanySettings.websiteUrl}
                    placeholder="https://vlalesjournaleux.fr"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                  />
                  <Globe className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 : Coordonnées Bancaires (IBAN / BIC) */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800/80">
              <div className="p-2.5 rounded-xl bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Coordonnées Bancaires pour les Règlements
                </h3>
                <p className="text-xs text-neutral-400">
                  IBAN et BIC injectés au bas des devis et factures pour faciliter les virements clients.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  IBAN *
                </label>
                <input
                  type="text"
                  name="iban"
                  defaultValue={initialCompanySettings.iban}
                  placeholder="FR76 3000 4012 3456 7890 1234 567"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  BIC / SWIFT
                </label>
                <input
                  type="text"
                  name="bic"
                  defaultValue={initialCompanySettings.bic}
                  placeholder="BNPAFRPPXXX"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Nom de l&apos;Établissement Bancaire
                </label>
                <input
                  type="text"
                  name="bankName"
                  defaultValue={initialCompanySettings.bankName}
                  placeholder="Banque Postale & Médias Paris"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>
            </div>
          </div>

          {/* Section 4 : Mentions Légales Obligatoires (Devis & Factures) */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800/80">
              <div className="p-2.5 rounded-xl bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Mentions Légales Obligatoires (Factures & Devis)
                </h3>
                <p className="text-xs text-neutral-400">
                  Texte inséré automatiquement en pied de page des documents PDF générés (CGI art. 293 B, carte de presse, pénalités).
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Mentions Légales & Conditions de Paiement
                </label>
                <span className="text-[11px] text-neutral-400 font-mono">
                  Injecté sur les documents de facturation
                </span>
              </div>
              <textarea
                name="legalNoticeInvoice"
                rows={5}
                defaultValue={initialCompanySettings.legalNoticeInvoice}
                placeholder="Ex. TVA non applicable, art. 293 B du CGI..."
                className="w-full p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-300 leading-relaxed placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
              />
              <p className="text-[11px] text-neutral-500 mt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-accent" />
                <span>
                  Exemples : Franchise en base de TVA (art. 293 B du Code Général des Impôts), mentions de droits d&apos;auteur journalistiques, indemnité forfaitaire légale de 40€ pour frais de recouvrement.
                </span>
              </p>
            </div>
          </div>

          {/* Bouton d'enregistrement */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isCompanySaving}
              id="save-company-settings-btn"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-accent/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isCompanySaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les paramètres de facturation</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 3. CONTENU DU TAB 2 : ÉQUIPE & ACCÈS */}
      {!isCollab && activeTab === "team" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-brand-primary/40 border border-brand-accent/30 flex items-start gap-3">
            <Shield className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
            <div className="text-xs text-brand-cream/90 leading-relaxed">
              <strong>Administration sécurisée de la rédaction :</strong> Vous pouvez inviter des collaborateurs, définir leurs rôles (Collaborateur ou Journaliste Admin) et moduler leurs accès par fonctionnalité.
              <span className="block mt-1 text-brand-cream/70">
                La console SaaS centrale et le compte éditeur technique sont strictement furtifs et inaccessibles depuis cette interface.
              </span>
            </div>
          </div>

          {/* Intégration du composant TeamManager existant */}
          <TeamManager
            collaborators={collaborators}
            currentUserRole={currentUser?.role}
            currentUserId={currentUser?.userId}
          />
        </div>
      )}

      {/* 4. CONTENU DU TAB 3 : MON PROFIL */}
      {activeTab === "profile" && (
        <form action={profileAction} className="space-y-6 max-w-2xl">
          {profileState?.success && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{profileState.message}</span>
            </div>
          )}
          {profileState?.error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{profileState.error}</span>
            </div>
          )}

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800/80">
              <div className="p-2.5 rounded-xl bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Identité de la Journaliste Connectée
                </h3>
                <p className="text-xs text-neutral-400">
                  Mettez à jour votre nom d&apos;usage, adresse email de connexion et mot de passe.
                </p>
              </div>
            </div>

            {/* Avatar & Photo de profil */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Photo de profil / Portrait éditorial
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-brand-accent/50 shadow-md">
                  <Image
                    src={selectedAvatar}
                    alt="Avatar Journaliste"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <input
                    type="hidden"
                    name="avatar"
                    value={selectedAvatar}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAvatar("/images/journalist-portrait.jpg")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        selectedAvatar === "/images/journalist-portrait.jpg"
                          ? "bg-brand-accent text-white border-brand-accent"
                          : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
                      }`}
                    >
                      Portrait Officiel
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAvatar("/logo.png")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        selectedAvatar === "/logo.png"
                          ? "bg-brand-accent text-white border-brand-accent"
                          : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
                      }`}
                    >
                      Écusson Marque
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-neutral-400" />
                    <span>Sélectionnez votre avatar éditorial affiché sur vos articles et votre profil.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Champs Nom et Email */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Nom Complet *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={currentUser?.name || "Louise Presse"}
                  placeholder="Louise Presse"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Adresse Email de Connexion *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={currentUser?.email || ""}
                    placeholder="votre.email@journaliste.fr"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                  />
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Rôle actuel (statique avec badge) */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Rôle de Compte
                </label>
                <div className="px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-300 font-mono">
                    {currentUser?.role || "JOURNALISTE_ADMIN"}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Rédactrice en Chef</span>
                  </span>
                </div>
              </div>

              {/* Nouveau mot de passe (optionnel) */}
              <div className="pt-3 border-t border-neutral-800/80">
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Nouveau Mot de Passe (laisser vide pour ne pas modifier)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Minimum 6 caractères"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition font-mono"
                  />
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1.5">
                  Ne renseignez ce champ que si vous désirez renouveler votre mot de passe d&apos;accès.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isProfileSaving}
              id="save-profile-btn"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-accent/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isProfileSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les modifications du profil</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
