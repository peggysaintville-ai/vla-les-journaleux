import { logoutAction } from "@/app/actions/auth-actions";
import { AlertOctagon, RefreshCw, LogOut, Mail, ShieldAlert } from "lucide-react";

export default function SubscriptionExpiredPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-neutral-100 relative overflow-hidden font-sans">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 p-8 sm:p-10 rounded-2xl shadow-2xl">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 shadow-lg shadow-rose-500/10">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Accès Temporairement Suspendu</span>
        </span>

        <h1 className="text-2xl font-bold text-white tracking-tight">
          Abonnement SaaS Expiré
        </h1>

        <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
          La licence d&apos;accès de votre rédaction pour l&apos;application JournalisteSaaS est arrivée à échéance ou a été suspendue par l&apos;administrateur.
        </p>

        <div className="mt-6 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-left text-xs text-neutral-400 space-y-2">
          <div className="font-semibold text-neutral-300">Que faire à présent ?</div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Contacter le responsable de publication ou l&apos;administrateur technique.</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Connectez-vous avec un compte SUPER_ADMIN pour renouveler la validité.</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <form action={logoutAction} className="w-full">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Changer de compte</span>
            </button>
          </form>

          <a
            href="mailto:support@journaliste-saas.local"
            className="w-full py-2.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Contacter le support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
