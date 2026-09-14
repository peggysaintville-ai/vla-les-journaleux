"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  FileText,
  Video,
  PenTool,
  Mic2,
  Receipt,
  Calendar,
  Users,
  Tag,
  FileCheck2,
  BarChart3,
  UserCheck,
  Settings,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { UserRole } from "@prisma/client";

interface AppSidebarProps {
  userName?: string;
  userEmail?: string;
  userRole?: UserRole | string;
}

const NAV_ITEMS = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Site Vitrine", href: "/site-vitrine", icon: Globe },
  { label: "Rédaction & Articles", href: "/articles", icon: FileText },
  { label: "Interviews & Studio", href: "/interviews", icon: Video },
  { label: "Signature Droit Image", href: "/contrats/signature-rapide", icon: PenTool },
  { label: "Podcasts & Séries", href: "/podcasts", icon: Mic2 },
  { label: "Commercial & Devis", href: "/facturation", icon: Receipt },
  { label: "Planning Média", href: "/planning", icon: Calendar },
  { label: "CRM & Contacts", href: "/contacts", icon: Users },
  { label: "Catalogue de Tarifs", href: "/catalogue", icon: Tag },
  { label: "Contrats & Droits", href: "/contrats", icon: FileCheck2 },
  { label: "Pilotage CA", href: "/analytics", icon: BarChart3 },
  { label: "Équipe & Droits", href: "/utilisateurs", icon: UserCheck },
];

export default function AppSidebar({ userName, userEmail, userRole }: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isSuperAdmin =
    (userRole as string) === "SUPER_ADMIN" ||
    (userRole as any) === UserRole.SUPER_ADMIN ||
    userEmail?.toLowerCase().trim() === "madacreaapp@gmail.com";
  const isCollaborateur =
    (userRole as string) === "COLLABORATEUR" ||
    (userRole as any) === UserRole.COLLABORATEUR;

  // Filtrage RBAC dynamique :
  // - COLLABORATEUR : Équipe & Droits masqué
  // - SUPER_ADMIN : Accès à tous les modules + Onglet exclusif "Console SaaS"
  const navItems = [
    ...NAV_ITEMS.filter((item) => {
      if (isCollaborateur && item.href === "/utilisateurs") {
        return false;
      }
      return true;
    }),
    ...(isSuperAdmin
      ? [
          {
            label: "Console SaaS",
            href: "/saas",
            icon: ShieldAlert,
          },
        ]
      : []),
  ];

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <aside
      className={`border-r border-brand-secondary bg-brand-primary text-brand-cream flex flex-col justify-between shrink-0 hidden md:flex sticky top-0 h-screen shadow-2xl transition-all duration-300 z-30 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* 1. Logo cliquable interactif pour basculer le repli/déploiement */}
        <div className={`border-b border-brand-secondary/60 ${isCollapsed ? "p-2.5 flex justify-center" : "p-4"}`}>
          <button
            type="button"
            onClick={toggleSidebar}
            id="sidebar-collapse-toggle-btn"
            title={isCollapsed ? "Cliquer pour déployer la barre latérale" : "Cliquer pour rétracter la barre latérale"}
            className={`flex items-center group focus:outline-none rounded-xl hover:bg-brand-secondary/40 transition-colors ${
              isCollapsed ? "justify-center p-1 w-full" : "justify-between w-full p-1.5"
            }`}
          >
            <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : "overflow-hidden"}`}>
              <div
                className={`relative shrink-0 rounded-xl overflow-hidden ring-2 ring-brand-accent/50 shadow-md shadow-brand-secondary transition-all duration-300 ${
                  isCollapsed ? "h-9 w-9" : "h-10 w-10 group-hover:scale-105"
                }`}
              >
                <Image
                  src="/logo.png"
                  alt="V'LÀ LES JOURNALEUX"
                  fill
                  sizes="40px"
                  className="object-contain bg-brand-secondary/90 p-0.5"
                  priority
                />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col text-left transition-opacity duration-200">
                  <span className="text-xs font-extrabold text-white leading-tight tracking-tight group-hover:text-brand-accentLight transition-colors truncate">
                    V&apos;LÀ LES JOURNALEUX
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-brand-cream/70">
                    Studio Éditorial
                  </span>
                </div>
              )}
            </div>

            {/* Indicateur de bascule */}
            {!isCollapsed && (
              <div className="text-brand-cream/40 group-hover:text-brand-accent transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>

        {/* 2. Liens de navigation avec défilement fluide sans barre de défilement apparente */}
        <nav className={`space-y-1.5 overflow-y-auto flex-1 no-scrollbar ${isCollapsed ? "p-2" : "p-3"}`}>
          {!isCollapsed && (
            <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider text-brand-cream/60 font-semibold">
              Modules Métiers
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === "/contrats/signature-rapide"
                ? item.href === "/contrats/signature-rapide"
                : item.href === "/contrats"
                ? pathname === "/contrats"
                : item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <div key={item.label} className="relative group flex justify-center">
                <Link
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center rounded-xl text-xs font-medium transition-all duration-150 ${
                    isCollapsed
                      ? "h-10 w-10 items-center justify-center p-0"
                      : "w-full gap-3 px-3 py-2.5"
                  } ${
                    isActive
                      ? "bg-brand-accent text-white font-semibold shadow-sm shadow-brand-accent/30"
                      : "text-brand-cream/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`shrink-0 transition-transform ${
                      isCollapsed ? "w-5 h-5" : "w-4 h-4"
                    } ${isActive ? "text-white" : "text-brand-cream/70 group-hover:text-brand-accentLight"}`}
                  />

                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.href === "/saas" && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/25 text-indigo-300 border border-indigo-500/40">
                          Super
                        </span>
                      )}
                    </div>
                  )}
                </Link>

                {/* Infobulle (Tooltip) visible en mode rétracté */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-brand-accent/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 whitespace-nowrap z-50">
                    {item.label}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-neutral-900 border-l border-b border-brand-accent/30 rotate-45" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* 3. Pied de Sidebar */}
      <div className={`border-t border-brand-secondary/60 space-y-2 shrink-0 ${isCollapsed ? "p-2 flex flex-col items-center" : "p-3"}`}>
        {/* Lien Site Public */}
        <div className="relative group w-full flex justify-center">
          <Link
            href="/"
            target="_blank"
            className={`flex items-center rounded-xl text-xs font-medium text-brand-cream/80 hover:text-white bg-brand-secondary/50 hover:bg-brand-secondary border border-brand-secondary transition ${
              isCollapsed ? "h-10 w-10 items-center justify-center p-0" : "justify-between px-3 py-2 w-full"
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-accentLight shrink-0" />
              {!isCollapsed && <span>Voir le site</span>}
            </span>
            {!isCollapsed && <ExternalLink className="w-3 h-3 text-brand-cream/60" />}
          </Link>

          {isCollapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-brand-accent/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 whitespace-nowrap z-50">
              Voir le site public
              <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-neutral-900 border-l border-b border-brand-accent/30 rotate-45" />
            </div>
          )}
        </div>

        {/* Lien Paramètres tout en bas au-dessus du profil */}
        <div className="relative group w-full flex justify-center">
          {(() => {
            const isParametresActive = pathname === "/parametres" || pathname.startsWith("/parametres/");
            return (
              <Link
                href="/parametres"
                prefetch={true}
                id="sidebar-settings-link"
                className={`flex items-center rounded-xl text-xs font-semibold transition shadow-sm ${
                  isCollapsed ? "h-10 w-10 items-center justify-center p-0" : "justify-between px-3 py-2.5 w-full"
                } ${
                  isParametresActive
                    ? "bg-brand-accent text-white shadow-brand-accent/30 font-semibold"
                    : "text-brand-cream/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Settings
                    className={`w-4 h-4 group-hover:rotate-45 transition-transform duration-300 shrink-0 ${
                      isParametresActive ? "text-white" : "text-brand-cream/70 group-hover:text-brand-accentLight"
                    }`}
                  />
                  {!isCollapsed && <span>Paramètres</span>}
                </span>
                {!isCollapsed && (
                  <span
                    className={`text-[9px] font-mono ${
                      isParametresActive ? "text-white/80" : "text-brand-cream/60 group-hover:text-brand-accentLight"
                    }`}
                  >
                    Facturation
                  </span>
                )}
              </Link>
            );
          })()}

          {isCollapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-brand-accent/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 whitespace-nowrap z-50">
              Paramètres & Facturation
              <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-neutral-900 border-l border-b border-brand-accent/30 rotate-45" />
            </div>
          )}
        </div>

        {/* Carte Profil / Utilisateur */}
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-brand-secondary/80 border border-brand-secondary flex items-center justify-between w-full">
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-brand-cream truncate">
                {userName || "Rédaction"}
              </div>
              {userEmail && (
                <div className="text-[10px] font-mono text-brand-cream/70 truncate">
                  {userEmail}
                </div>
              )}
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-brand-accent/20 text-brand-accentLight border border-brand-accent/30 font-semibold">
              {isSuperAdmin
                ? "Super Admin"
                : isCollaborateur
                ? "Collaborateur"
                : "Admin Rédaction"}
            </span>
          </div>
        ) : (
          <div
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-secondary/80 border border-brand-secondary cursor-default"
            title={`${userName || "Rédaction"}${userEmail ? ` (${userEmail})` : ""}`}
          >
            <span className="w-6 h-6 rounded-full bg-brand-accent/30 text-brand-accentLight flex items-center justify-center text-[10px] font-bold font-mono">
              {(userName || "R").charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
