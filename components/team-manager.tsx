"use client";

import { useState, useTransition, useActionState } from "react";
import {
  createCollaboratorAction,
  updatePermissionsAction,
  deleteCollaboratorAction,
  changeUserPasswordAction,
} from "@/app/(app)/utilisateurs/actions";
import { CollaboratorItem, UserPermissions } from "@/lib/users";
import { UserRole } from "@prisma/client";
import {
  UserPlus,
  Shield,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Sliders,
  Mail,
  Mic2,
  Video,
  Receipt,
  Calendar,
  Users,
  FileCheck2,
  BarChart3,
  Key,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

interface TeamManagerProps {
  collaborators: CollaboratorItem[];
  currentUserRole?: UserRole;
  currentUserId?: string;
}

const MODULE_LIST: { key: keyof UserPermissions; label: string; icon: React.ElementType }[] = [
  { key: "podcasts", label: "Podcasts", icon: Mic2 },
  { key: "interviews", label: "Interviews", icon: Video },
  { key: "facturation", label: "Commercial / Devis", icon: Receipt },
  { key: "planning", label: "Planning", icon: Calendar },
  { key: "crm", label: "CRM Contacts", icon: Users },
  { key: "contrats", label: "Contrats", icon: FileCheck2 },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function TeamManager({
  collaborators,
  currentUserRole,
  currentUserId,
}: TeamManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CollaboratorItem | null>(null);
  const [passwordUser, setPasswordUser] = useState<CollaboratorItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modification du mot de passe utilisateur
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser) return;
    if (newPassword.trim().length < 6) {
      setPasswordError("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    setIsSavingPassword(true);
    setPasswordError(null);
    try {
      const res = await changeUserPasswordAction(passwordUser.id, newPassword);
      if (res.success) {
        setToast({ type: "success", text: res.message || "Mot de passe mis à jour avec succès." });
        setPasswordUser(null);
        setNewPassword("");
      } else {
        setPasswordError(res.error || "Une erreur est survenue.");
      }
    } catch {
      setPasswordError("Erreur lors de la communication avec le serveur.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Formulaire d'invitation avec useActionState
  const [formState, formAction, isSubmitting] = useActionState(async (prev: unknown, fd: FormData) => {
    const res = await createCollaboratorAction(null, fd);
    if (res.success) {
      setIsModalOpen(false);
      setToast({ type: "success", text: res.message || "Compte créé." });
    }
    return res;
  }, null);

  // Modification directe des permissions
  const handleToggleModule = (user: CollaboratorItem, modKey: keyof UserPermissions) => {
    const updatedPerms = {
      ...user.permissions,
      [modKey]: !user.permissions[modKey],
    };

    startTransition(async () => {
      const res = await updatePermissionsAction(user.id, updatedPerms);
      if (res.success) {
        setToast({ type: "success", text: "Permissions enregistrées." });
      }
    });
  };

  const handleDelete = (user: CollaboratorItem) => {
    if (!confirm(`Confirmez-vous le retrait de ${user.name} (${user.email}) de l'équipe ?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteCollaboratorAction(user.id);
      if (res.success) {
        setToast({ type: "success", text: res.message || "Utilisateur retiré." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.text}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Barre d'action supérieure */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Équipe de Rédaction & Droits d&apos;Accès
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Gérez les collaborateurs journalistes et contrôlez finement les modules autorisés pour chacun.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-xs shadow-lg shadow-brand-accent/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Ajouter un collaborateur</span>
        </button>
      </div>

      {/* Tableau des Collaborateurs */}
      <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="px-6 py-4">Collaborateur</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Modules Autorisés</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {collaborators.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-800/30 transition-colors">
                  {/* Nom & Email */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 border border-neutral-700 flex items-center justify-center font-bold text-white text-xs">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm">{user.name}</span>
                          {currentUserId && user.id === currentUserId && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
                              Vous
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                          <Mail className="w-3 h-3 text-neutral-400" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Rôle */}
                  <td className="px-6 py-4">
                    {user.role === UserRole.SUPER_ADMIN ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono font-bold">
                        <Shield className="w-3 h-3 text-purple-400" />
                        <span>Super Admin</span>
                      </span>
                    ) : user.role === UserRole.JOURNALISTE_ADMIN ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[10px] font-mono font-bold">
                        <Shield className="w-3 h-3" />
                        <span>Journaliste Admin</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono font-semibold">
                        <UserCheck className="w-3 h-3" />
                        <span>Collaborateur</span>
                      </span>
                    )}
                  </td>

                  {/* Modules Autorisés (Badges cliquables pour basculer les droits) */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-md">
                      {MODULE_LIST.map((mod) => {
                        const hasAccess = !!user.permissions?.[mod.key];
                        const Icon = mod.icon;
                        return (
                          <button
                            key={mod.key}
                            type="button"
                            onClick={() => handleToggleModule(user, mod.key)}
                            title={`Cliquer pour ${hasAccess ? "bloquer" : "autoriser"} l'accès à ${mod.label}`}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all ${
                              hasAccess
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-neutral-950 text-neutral-600 border-neutral-800 opacity-60 hover:opacity-100 line-through"
                            }`}
                          >
                            <Icon className="w-2.5 h-2.5" />
                            <span>{mod.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Bouton Changer Mot de passe (RBAC : un Admin ne peut pas modifier un Super Admin) */}
                      {!(user.role === UserRole.SUPER_ADMIN && currentUserRole !== UserRole.SUPER_ADMIN) && (
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordUser(user);
                            setNewPassword("");
                            setPasswordError(null);
                            setShowPassword(false);
                          }}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-amber-500/20 text-neutral-400 hover:text-amber-400 transition"
                          title="Modifier le mot de passe"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Bouton Permissions (masqué sur Super Admin) */}
                      {user.role !== UserRole.SUPER_ADMIN && (
                        <button
                          type="button"
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                          title="Détail des permissions"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {user.role !== UserRole.SUPER_ADMIN && user.email !== "louise@presse.local" && (
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 transition"
                          title="Supprimer le compte"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. MODAL D'AJOUT DE COLLABORATEUR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Nouveau Collaborateur</h3>
                  <p className="text-xs text-neutral-400">Ajout à l&apos;espace de travail de rédaction</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formState?.error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{formState.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Nom et Prénom *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Ex. Alexandre Dumas"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Adresse Email *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="alexandre@redaction.local"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Mot de passe temporaire *
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type="password"
                    required
                    defaultValue="Presse2026!"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition font-mono"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-500">
                    <Key className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* SÉLECTEUR DE RÔLE RESTREINT : UNIQUEMENT JOURNALISTE_ADMIN OU COLLABORATEUR */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Rôle au sein de la rédaction *
                </label>
                <select
                  name="role"
                  defaultValue="COLLABORATEUR"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
                >
                  <option value="COLLABORATEUR">Collaborateur Rédaction (Journaliste, Monteur, Enquêteur)</option>
                  <option value="JOURNALISTE_ADMIN">Journaliste Administratrice (Gestion d&apos;équipe & Paramètres)</option>
                </select>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Le rôle Super Admin SaaS est strictement réservé et isolé de cette interface.
                </p>
              </div>

              {/* GESTION FINE DES PERMISSIONS PAR MODULE */}
              <div className="pt-2 border-t border-neutral-800">
                <label className="block text-xs font-bold text-neutral-200 uppercase tracking-wider mb-2.5">
                  Modules métier autorisés :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MODULE_LIST.map((mod) => {
                    const Icon = mod.icon;
                    const defaultChecked = mod.key === "podcasts" || mod.key === "interviews" || mod.key === "planning";
                    return (
                      <label
                        key={mod.key}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition select-none"
                      >
                        <input
                          type="checkbox"
                          name={`perm_${mod.key}`}
                          defaultChecked={defaultChecked}
                          className="rounded border-neutral-700 text-amber-400 focus:ring-amber-400/30 h-4 w-4 bg-neutral-900"
                        />
                        <Icon className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-xs text-neutral-300">{mod.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Créer le compte</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL DE MODIFICATION DES PERMISSIONS D'UN UTILISATEUR EXISTANT */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-white">Droits d&apos;accès : {editingUser.name}</h3>
                <p className="text-xs text-neutral-400 font-mono">{editingUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-neutral-400">
                Cliquez pour activer ou couper l&apos;accès aux modules :
              </span>
              <div className="space-y-2 pt-2">
                {MODULE_LIST.map((mod) => {
                  const hasAccess = !!editingUser.permissions?.[mod.key];
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.key}
                      onClick={() => handleToggleModule(editingUser, mod.key)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        hasAccess
                          ? "bg-neutral-950 border-emerald-500/30 text-emerald-300"
                          : "bg-neutral-950/50 border-neutral-800 text-neutral-500 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-semibold">{mod.label}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        hasAccess ? "bg-emerald-500/20 text-emerald-300" : "bg-neutral-900 text-neutral-500"
                      }`}>
                        {hasAccess ? "AUTORISÉ" : "BLOQUÉ"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-xs shadow-md transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL DE MODIFICATION DU MOT DE PASSE */}
      {passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Modifier le mot de passe</h3>
                  <p className="text-xs text-neutral-400">
                    Pour <strong className="text-neutral-200">{passwordUser.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordUser(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex items-center justify-between text-xs">
              <div className="text-neutral-400 font-mono truncate">{passwordUser.email}</div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                {passwordUser.role === UserRole.SUPER_ADMIN
                  ? "Super Admin"
                  : passwordUser.role === UserRole.JOURNALISTE_ADMIN
                  ? "Admin"
                  : "Collaborateur"}
              </span>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Nouveau mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    autoComplete="new-password"
                    className="w-full pl-9 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition font-mono"
                  />
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-white transition"
                    title={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1.5">
                  Le mot de passe sera haché de manière sécurisée (bcrypt) avant d&apos;être stocké en base.
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPasswordUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSavingPassword ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Enregistrer</span>
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
