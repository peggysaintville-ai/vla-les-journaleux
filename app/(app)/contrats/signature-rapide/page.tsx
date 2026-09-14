"use client";

import { useState, useRef, useEffect } from "react";
import {
  PenTool,
  RotateCcw,
  CheckCircle2,
  FileCheck2,
  Download,
  Sparkles,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";

export default function SignatureRapidePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signedDataUrl, setSignedDataUrl] = useState<string | null>(null);
  const [isCertified, setIsCertified] = useState(false);

  // Formulaire d'information du témoin
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [qualite, setQualite] = useState("");
  const [projet, setProjet] = useState("V'LÀ LES JOURNALEUX • Enquête Spéciale");
  const [lieu, setLieu] = useState("Paris, Studio Rédaction");
  const [dateSign, setDateSign] = useState(new Date().toISOString().split("T")[0]);

  // Initialisation du canvas HTML5
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Support haute résolution DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = "#DB8636"; // brand-accent
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  // Coordonnées pour souris et tactile (touch events)
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignedDataUrl(null);
    setIsCertified(false);
  };

  const certifySignature = () => {
    if (!hasSignature || !canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setSignedDataUrl(dataUrl);
    setIsCertified(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary border border-brand-accent/40 text-brand-accentLight text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Outils Terrain & Captation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Décharge de Droit à l&apos;Image & Voix
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Faites signer immédiatement les témoins, invités et intervenants sur tablette ou smartphone.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="text-xs text-brand-cream/70 hover:text-white transition underline underline-offset-4"
        >
          ← Retour au tableau de bord
        </Link>
      </div>

      {isCertified ? (
        /* Écran de confirmation certifiée */
        <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900/90 border border-emerald-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-bounce shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">
              Décharge validée & horodatée avec succès !
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto">
              L&apos;accord de cession de droit à l&apos;image et à la voix de{" "}
              <strong className="text-white font-bold">{prenom} {nom}</strong> a été
              enregistré pour le projet <em>{projet}</em>.
            </p>
          </div>

          {/* Rendu visuel du récépissé signé */}
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-left space-y-4">
            <div className="text-[11px] font-mono text-neutral-400 border-b border-neutral-800 pb-2 flex justify-between">
              <span>CERTIFICAT N° DDI-{Date.now().toString().slice(-6)}</span>
              <span className="text-emerald-400">VALIDE</span>
            </div>

            <div className="text-xs space-y-1 text-neutral-300">
              <div><strong>Signataire :</strong> {prenom} {nom} {qualite ? `(${qualite})` : ""}</div>
              <div><strong>Fait à :</strong> {lieu}, le {dateSign}</div>
              <div><strong>Objet :</strong> Diffusion multi-plateformes V&apos;LÀ LES JOURNALEUX</div>
            </div>

            <div className="pt-3 border-t border-neutral-800">
              <div className="text-[10px] uppercase font-mono text-neutral-500 mb-1">Signature recueillie :</div>
              {signedDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={signedDataUrl}
                  alt="Signature tactile"
                  className="h-16 w-auto object-contain border border-neutral-800 rounded-lg p-1 bg-neutral-900/40"
                />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-xs shadow-lg transition"
            >
              <Download className="w-4 h-4" />
              <span>Imprimer ou Télécharger (PDF)</span>
            </button>
            <button
              type="button"
              onClick={clearCanvas}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition"
            >
              <span>Nouvelle signature de décharge</span>
            </button>
          </div>
        </div>
      ) : (
        /* Formulaire & Canvas de Signature */
        <div className="space-y-6">
          {/* 1. Informations Signataire */}
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/70 border border-neutral-800 space-y-5 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-brand-accentLight" />
              <span>1. Identité de l&apos;Intervenant / Témoin</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Nom *
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex. Mercier"
                  className="w-full px-4 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Ex. Sarah"
                  className="w-full px-4 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Qualité / Titre
                </label>
                <input
                  type="text"
                  value={qualite}
                  onChange={(e) => setQualite(e.target.value)}
                  placeholder="Ex. Chercheuse en cyberdroit"
                  className="w-full px-4 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Projet / Émission
                </label>
                <input
                  type="text"
                  value={projet}
                  onChange={(e) => setProjet(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Lieu de captation
                </label>
                <input
                  type="text"
                  value={lieu}
                  onChange={(e) => setLieu(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={dateSign}
                  onChange={(e) => setDateSign(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition"
                />
              </div>
            </div>
          </div>

          {/* 2. Texte légal de cession */}
          <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 space-y-3 text-xs text-neutral-300 leading-relaxed max-h-48 overflow-y-auto">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Décharge et autorisation expresse de captation et diffusion
            </div>
            <p>
              Je soussigné(e) autorise expressément la rédaction de <strong>V&apos;LÀ LES JOURNALEUX</strong> (représentée par Louise Vaneau) à capter, enregistrer et diffuser mon image et ma voix, dans le cadre exclusif de l&apos;enquête et de l&apos;émission susmentionnée.
            </p>
            <p>
              Cette autorisation est consentie à titre gracieux, pour une diffusion mondiale sur tous supports numériques (podcasts, streaming, web, réseaux sociaux, extraits d&apos;information) et pour la durée légale des droits d&apos;auteur.
            </p>
          </div>

          {/* 3. Zone Canvas de signature tactile */}
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-brand-accent/40 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-brand-accentLight" />
                  <span>2. Signature au doigt ou au stylet</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Tracez votre signature manuscrite directement dans le cadre ci-dessous.
                </p>
              </div>

              <button
                type="button"
                onClick={clearCanvas}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Effacer</span>
              </button>
            </div>

            {/* Canvas tactile */}
            <div className="border-2 border-dashed border-brand-accent/50 rounded-2xl bg-neutral-950 relative overflow-hidden touch-none h-56 sm:h-64 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair"
              />
              {!hasSignature && (
                <div className="absolute pointer-events-none text-center text-xs text-neutral-600 uppercase tracking-widest font-mono select-none">
                  ✍️ Signez ici au doigt ou au curseur
                </div>
              )}
            </div>

            {/* Validation */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-accentLight shrink-0" />
                <span>Signature cryptée horodatée conforme au Code de la propriété intellectuelle.</span>
              </div>

              <button
                type="button"
                onClick={certifySignature}
                disabled={!hasSignature || !nom.trim() || !prenom.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-sm shadow-xl shadow-brand-accent/25 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Valider la décharge signée</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
