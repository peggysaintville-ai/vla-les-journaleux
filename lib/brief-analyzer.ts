export interface PlannedCalendarItem {
  id: string;
  title: string;
  startDate: string; // ISO format or YYYY-MM-DDTHH:mm
  endDate: string;
  eventType: "TOURNAGE" | "ENREGISTREMENT" | "DIFFUSION" | "INTERVIEW" | "RDV_CLIENT";
  location?: string;
  description?: string;
}

export interface StructuredBriefResult {
  project: {
    title: string;
    description: string;
    themes: string[];
    episodesCount: number;
    estimatedDurationMin: number;
  };
  planning: {
    launchDate?: string | null;
    firstEpisodeDate?: string | null;
    shootingDate?: string | null;
    events: PlannedCalendarItem[];
  };
  fieldGuide: {
    suggestedQuestions: string[];
    targetWitnessProfiles: string[];
    deontologicalAlerts: string[];
  };
  teaser: {
    suggestedTitle: string;
    suggestedHook: string;
    suggestedBadge: string;
    instagramUrl?: string | null;
  };
}

/**
 * Normalise et extrait une date depuis des motifs textuels en français
 */
function parseFrenchDate(text: string): Date | null {
  // 1. Motif numérique : JJ/MM/AAAA ou JJ-MM-AAAA
  const numMatch = text.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (numMatch) {
    const day = parseInt(numMatch[1], 10);
    const month = parseInt(numMatch[2], 10) - 1;
    const year = parseInt(numMatch[3], 10);
    return new Date(year, month, day, 10, 0, 0);
  }

  // 2. Motif texte : 15 octobre 2026, 4 novembre 2026, etc.
  const months: { [k: string]: number } = {
    janvier: 0,
    février: 1,
    fevrier: 1,
    mars: 2,
    avril: 3,
    mai: 4,
    juin: 5,
    juillet: 6,
    août: 7,
    aout: 7,
    septembre: 8,
    octobre: 9,
    novembre: 10,
    décembre: 11,
    decembre: 11,
  };

  const textMatch = text.match(
    /(\d{1,2})\s+(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)\s+(\d{4})/i
  );
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const month = months[textMatch[2].toLowerCase()];
    const year = parseInt(textMatch[3], 10);
    return new Date(year, month, day, 10, 0, 0);
  }

  return null;
}

/**
 * Moteur d'analyse intelligente de brief / pitch journalistique
 */
export function analyzeRawBrief(rawText: string): StructuredBriefResult {
  const text = rawText.trim();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // 1. TITRE DU PROJET
  let detectedTitle = "Nouvelle Série d'Investigation";
  const titleLine = lines.find((l) =>
    /^(titre|projet|sujet|série|nom du projet)\s*[:\-]\s*(.+)/i.test(l)
  );
  if (titleLine) {
    const match = titleLine.match(/^(titre|projet|sujet|série|nom du projet)\s*[:\-]\s*(.+)/i);
    if (match && match[2]) {
      detectedTitle = match[2].trim().replace(/^["']|["']$/g, "");
    }
  } else if (lines.length > 0) {
    // Si la 1ère ligne est courte et percutante (< 80 car.)
    if (lines[0].length < 80 && !lines[0].includes("http")) {
      detectedTitle = lines[0].replace(/^#+\s*/, "").replace(/^["']|["']$/g, "").trim();
    }
  }

  // 2. RÉSUMÉ COURT / PITCH
  let description = "";
  const synopsisLine = lines.find((l) =>
    /^(synopsis|pitch|résumé|angle|intention|contexte)\s*[:\-]\s*(.+)/i.test(l)
  );
  if (synopsisLine) {
    const match = synopsisLine.match(/^(synopsis|pitch|résumé|angle|intention|contexte)\s*[:\-]\s*(.+)/i);
    if (match && match[2]) {
      description = match[2].trim();
    }
  } else {
    // Prendre les premières phrases informatives
    const contentLines = lines.filter(
      (l) =>
        !l.toLowerCase().startsWith("titre") &&
        !l.toLowerCase().startsWith("date") &&
        !l.toLowerCase().startsWith("contact")
    );
    description = contentLines.slice(0, 3).join(" ").slice(0, 300);
  }

  // 3. THÉMATIQUES CLÉS DÉTECTÉES
  const possibleThemes = [
    { label: "Enquête & Corruption", keywords: ["corruption", "marché public", "fraude", "finances", "fonds", "bercy", "scandale", "subvention"] },
    { label: "Environnement & Climat", keywords: ["écologie", "eau", "climat", "pollution", "agriculture", "biodiversité", "pesticide", "nature"] },
    { label: "Société & Droits Humains", keywords: ["social", "travail", "jeunesse", "quartier", "femmes", "santé", "école", "prison", "mineurs", "droits"] },
    { label: "Technologies & Numérique", keywords: ["ia", "numérique", "intelligence artificielle", "algorithme", "cyberguerre", "trolls", "réseaux"] },
    { label: "Justice & Police", keywords: ["police", "tribunal", "avocat", "procès", "loi", "sécurité", "témoin", "garde à vue"] },
    { label: "Culture & Médias", keywords: ["médias", "presse", "journalisme", "culture", "désinformation", "fake news"] },
  ];

  const lowerText = text.toLowerCase();
  const detectedThemes: string[] = [];

  possibleThemes.forEach((t) => {
    if (t.keywords.some((k) => lowerText.includes(k))) {
      detectedThemes.push(t.label);
    }
  });
  if (detectedThemes.length === 0) {
    detectedThemes.push("Investigation & Récits de terrain");
  }

  // 4. NOMBRE D'ÉPISODES
  let episodesCount = 4;
  const epMatch = lowerText.match(/(\d+)\s*(épisodes?|volets?|parties?|numéros?)/);
  if (epMatch) {
    const num = parseInt(epMatch[1], 10);
    if (num > 0 && num <= 20) {
      episodesCount = num;
    }
  }

  // 5. DÉTECTION DES DATES CLÉS & PLANNING
  let launchDate: Date | null = null;
  let firstEpisodeDate: Date | null = null;
  let shootingDate: Date | null = null;

  // Lancement
  const launchMatch = text.match(/(lancement|diffusion|sortie|première)\s*(le|prévue le|pour le)?\s*([0-9a-zA-Z\/\-\.\séûôîêèà]+)/i);
  if (launchMatch) {
    const parsed = parseFrenchDate(launchMatch[0]);
    if (parsed) launchDate = parsed;
  }

  // Tournage / Enregistrement
  const shootMatch = text.match(/(tournage|enregistrement|captation|terrain)\s*(le|prévu le|du)?\s*([0-9a-zA-Z\/\-\.\séûôîêèà]+)/i);
  if (shootMatch) {
    const parsed = parseFrenchDate(shootMatch[0]);
    if (parsed) shootingDate = parsed;
  }

  // Fallbacks logiques pour le planning si non trouvées
  const now = new Date();
  if (!shootingDate) {
    shootingDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // dans 5 jours
  }
  if (!launchDate) {
    launchDate = new Date(shootingDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 jours après tournage
  }
  firstEpisodeDate = new Date(launchDate.getTime());

  // Génération de la liste d'événements du calendrier
  const calendarEvents: PlannedCalendarItem[] = [
    {
      id: "evt-tournage-1",
      title: `Tournage Terrain & Recueil : ${detectedTitle}`,
      startDate: new Date(shootingDate.setHours(9, 0, 0, 0)).toISOString(),
      endDate: new Date(shootingDate.setHours(17, 0, 0, 0)).toISOString(),
      eventType: "TOURNAGE",
      location: "Reportage en immersion terrain / Lieu d'enquête",
      description: `Captation sonore immersive et entretiens contradictoires pour la série ${detectedTitle}.`,
    },
    {
      id: "evt-studio-1",
      title: `Studio Montage & Voix Off : ${detectedTitle}`,
      startDate: new Date(
        new Date(shootingDate).getTime() + 4 * 24 * 60 * 60 * 1000
      ).toISOString(),
      endDate: new Date(
        new Date(shootingDate).getTime() + 4 * 24 * 60 * 60 * 1000 + 4 * 3600 * 1000
      ).toISOString(),
      eventType: "ENREGISTREMENT",
      location: "Studio Rédaction - V'là les journaleux",
      description: `Enregistrement des lancements narratifs, calage des transitions et mixage sonore.`,
    },
    {
      id: "evt-diffusion-1",
      title: `Lancement & Diffusion Épisode 1 : ${detectedTitle}`,
      startDate: new Date(launchDate.setHours(8, 0, 0, 0)).toISOString(),
      endDate: new Date(launchDate.setHours(10, 0, 0, 0)).toISOString(),
      eventType: "DIFFUSION",
      location: "Flux RSS, Spotify, Apple Podcasts & Vitrine",
      description: `Publication officielle du premier épisode et déclenchement de la campagne média.`,
    },
  ];

  // 6. GUIDE D'ENTRETIEN TERRAIN & DÉONTOLOGIE
  const suggestedQuestions: string[] = [];
  const targetWitnessProfiles: string[] = [];
  const deontologicalAlerts: string[] = [];

  // Questions types adaptées aux thèmes
  suggestedQuestions.push(
    "Pouvez-vous nous raconter le moment précis où vous avez réalisé l'anomalie ou le problème pour la première fois ?"
  );
  suggestedQuestions.push(
    "Quels ont été les impacts concrets et directs sur votre quotidien ou sur votre structure ?"
  );
  suggestedQuestions.push(
    "Face aux éléments documentés (notes de service, bons de commande, courriers), quelle a été l'explication officielle ?"
  );
  suggestedQuestions.push(
    "Certains acteurs réfutent ces constats : que répondez-vous à ceux qui invoquent des contraintes légales ou techniques ?"
  );
  suggestedQuestions.push(
    "Si vous aviez le pouvoir de changer les choses demain matin, quelle mesure d'urgence exigeriez-vous ?"
  );

  // Profils de témoins ciblés
  targetWitnessProfiles.push("Témoins directs et usagers affectés (témoignage vécu, mise en situation humaine)");
  targetWitnessProfiles.push("Experts indépendants, universitaires ou juristes spécialisés");
  targetWitnessProfiles.push("Représentants des institutions ou entreprises incriminées (droit de réponse contradictoire)");
  targetWitnessProfiles.push("Lanceurs d'alerte internes ou délégués syndicaux (sources protégées)");

  // Vigilance déontologique
  deontologicalAlerts.push("Recueil scrupuleux sans commentaire personnel orienté pendant la prise de son terrain.");
  deontologicalAlerts.push("Vérification et confrontation formelle de chaque allégation avant publication (droit de réponse écrit sous 48h).");
  
  if (lowerText.includes("mineur") || lowerText.includes("enfant") || lowerText.includes("adolescent") || lowerText.includes("école")) {
    deontologicalAlerts.push("⚠️ Mineurs impliqués : Recueil obligatoire de l'autorisation parentale écrite des deux parents et anonymisation intégrale de la voix.");
  } else {
    deontologicalAlerts.push("Garantie absolue du secret des sources (Charte de Munich / Loi 1881) et proposition d'anonymisation si risque de représailles professionnelles.");
  }

  if (lowerText.includes("justice") || lowerText.includes("plainte") || lowerText.includes("procès") || lowerText.includes("police")) {
    deontologicalAlerts.push("⚠️ Procédure en cours : Rappel impératif de la présomption d'innocence et respect du secret de l'instruction.");
  }

  // 7. TEASING VITRINE & LIEN INSTAGRAM
  // Détection URL instagram
  let instagramUrl: string | null = null;
  const instaMatch = text.match(/(https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_\-\.\/]+)/i);
  if (instaMatch) {
    instagramUrl = instaMatch[0];
  } else {
    const handleMatch = text.match(/@([a-zA-Z0-9_\.]+)/);
    if (handleMatch) {
      instagramUrl = `https://instagram.com/${handleMatch[1]}`;
    } else {
      instagramUrl = "https://instagram.com/vlalesjournaleux";
    }
  }

  const launchDateStr = launchDate
    ? launchDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
    : "prochainement";

  const suggestedHook =
    description.length > 20
      ? description.slice(0, 160).replace(/\.$/, "") + ". Enquête sonore inédite."
      : `Une grande enquête en ${episodesCount} épisodes au cœur du sujet. Révélations et témoignages exclusifs.`;

  return {
    project: {
      title: detectedTitle,
      description: description || "Série documentaire audio indépendante.",
      themes: detectedThemes,
      episodesCount,
      estimatedDurationMin: 35,
    },
    planning: {
      launchDate: launchDate ? launchDate.toISOString().split("T")[0] : null,
      firstEpisodeDate: firstEpisodeDate ? firstEpisodeDate.toISOString().split("T")[0] : null,
      shootingDate: shootingDate ? shootingDate.toISOString().split("T")[0] : null,
      events: calendarEvents,
    },
    fieldGuide: {
      suggestedQuestions,
      targetWitnessProfiles,
      deontologicalAlerts,
    },
    teaser: {
      suggestedTitle: detectedTitle,
      suggestedHook,
      suggestedBadge: `Lancement le ${launchDateStr}`,
      instagramUrl,
    },
  };
}
