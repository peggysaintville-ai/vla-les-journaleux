"use client";

import { useActionState, useState } from "react";
import { loginAction } from "./actions";
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

import Image from "next/image";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-neutral-100">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-accent/15 via-brand-primary/40 to-brand-secondary/30 blur-[130px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col justify-center items-center gap-2 mb-3">
          <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-brand-accent/60 shadow-xl shadow-brand-primary">
            <Image
              src="/logo.png"
              alt="V'LÀ LES JOURNALEUX"
              fill
              sizes="56px"
              className="object-cover rounded-full"
              priority
            />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white mt-1">
            V&apos;LÀ LES JOURNALEUX
          </span>
        </div>
        <h2 className="text-center text-sm font-semibold tracking-tight text-brand-cream/80">
          Studio de Production & Rédaction
        </h2>
        <p className="mt-1 text-center text-xs text-neutral-400">
          Connectez-vous pour accéder à votre studio, vos tournages et vos épisodes.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-neutral-900/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl border border-neutral-800/80 rounded-2xl">
          {state?.error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-200 leading-relaxed">
                {state.error}
              </div>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-neutral-300 tracking-wide uppercase"
              >
                Adresse e-mail
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-neutral-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="votre.email@journaliste.fr"
                  className="block w-full pl-10 pr-3 py-2.5 bg-neutral-950/60 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-neutral-300 tracking-wide uppercase"
              >
                Mot de passe
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-neutral-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-neutral-950/60 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 transition"
                  aria-label="Afficher ou masquer le mot de passe"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-lg shadow-brand-accent/20 text-sm font-bold text-white bg-brand-accent hover:bg-brand-accentLight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-brand-accentLight disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-[0.99]"
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
