import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth-actions";
import { db } from "@/lib/db";
import AppSidebar from "@/components/app-sidebar";
import { AudioPlayerProvider } from "@/lib/audio-player-context";
import GlobalAudioBar from "@/components/global-audio-bar";
import { LogOut, ShieldCheck } from "lucide-react";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const isSuperAdmin =
    user?.role === "SUPER_ADMIN" ||
    user?.email?.toLowerCase().trim() === "madacreaapp@gmail.com";

  // Récupération et contrôle de validité de la licence SaaS au niveau du layout serveur
  let saasStatus = "ACTIVE";
  let validUntilStr = "365 jours";

  try {
    const config = await db.saaSConfig.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (config) {
      saasStatus = config.status;
      const isExpired =
        config.status === "EXPIRED" ||
        (config.validUntil && new Date(config.validUntil) < new Date());
      const isSuspended = config.status === "SUSPENDED";

      // Redirection immédiate si la licence est expirée ou suspendue (sauf pour le SUPER_ADMIN)
      if ((isExpired || isSuspended) && !isSuperAdmin) {
        redirect("/abonnement-expire");
      }

      const daysLeft = Math.max(
        0,
        Math.ceil(
          (new Date(config.validUntil).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      validUntilStr = `${daysLeft} jours`;
    }
  } catch (e: any) {
    if (e?.digest?.startsWith("NEXT_REDIRECT")) {
      throw e;
    }
    console.warn("Base locale non jointe pour layout, utilisation du fallback :", e);
  }

  return (
    <AudioPlayerProvider>
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex font-sans antialiased">
        {/* 1. BARRE LATÉRALE RÉTRACTABLE (SIDEBAR) */}
        <AppSidebar userName={user?.name} userEmail={user?.email} userRole={user?.role} />

        {/* 2. ZONE PRINCIPALE DE CONTENU */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header Applicatif */}
          <header className="sticky top-0 z-40 h-16 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  Abonnement {saasStatus === "ACTIVE" ? "Actif" : "En cours"} :{" "}
                  <strong className="font-semibold text-emerald-300">
                    {validUntilStr}
                  </strong>
                </span>
              </div>

              <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
                <span>Licence Rédaction Pro</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-white">
                  {user?.name || "Rédaction"}
                </div>
                <div className="text-[11px] text-brand-accent font-mono font-semibold">
                  {isSuperAdmin
                    ? "SUPER ADMIN"
                    : user?.role === "COLLABORATEUR"
                    ? "COLLABORATEUR"
                    : "RÉDACTRICE EN CHEF"}
                </div>
              </div>

              <form action={logoutAction}>
                <button
                  type="submit"
                  id="header-logout-btn"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-rose-950/40 text-neutral-300 hover:text-rose-300 border border-neutral-800 hover:border-rose-900/50 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </form>
            </div>
          </header>

          {/* Contenu de la page */}
          <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>

      {/* Lecteur audio global interactif dans le dashboard */}
      <GlobalAudioBar />
    </AudioPlayerProvider>
  );
}
