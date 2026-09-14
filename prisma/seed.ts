import { PrismaClient, UserRole, ContactType, PipelineStatus, SaaSStatus, InterviewStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début de l'initialisation des données de test locales (seeding)...");

  // 1. Initialisation de la SaaSConfig active pour 365 jours
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 365);

  const saasConfig = await prisma.saaSConfig.upsert({
    where: { clientKey: "LOCAL_DEV_CLIENT_KEY" },
    update: {
      status: SaaSStatus.ACTIVE,
      validUntil,
      podcasts: true,
      interviews: true,
      facturation: true,
      planning: true,
      crm: true,
      contrats: true,
      analytics: true,
    },
    create: {
      clientKey: "LOCAL_DEV_CLIENT_KEY",
      status: SaaSStatus.ACTIVE,
      validUntil,
      podcasts: true,
      interviews: true,
      facturation: true,
      planning: true,
      crm: true,
      contrats: true,
      analytics: true,
    },
  });
  console.log("✅ Configuration SaaS créée / mise à jour :", saasConfig.clientKey);

  // 2. Création des utilisateurs
  const adminPasswordHash = await bcrypt.hash("spyKim@102412", 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: "madacreaapp@gmail.com" },
    update: {
      name: "Super Admin",
      passwordHash: adminPasswordHash,
      role: UserRole.SUPER_ADMIN,
    },
    create: {
      email: "madacreaapp@gmail.com",
      name: "Super Admin",
      passwordHash: adminPasswordHash,
      role: UserRole.SUPER_ADMIN,
    },
  });
  console.log("✅ Compte SUPER_ADMIN créé :", superAdmin.email);

  // Suppression de l'ancien compte de test si existant
  await prisma.user.deleteMany({
    where: { email: "louise@presse.local" },
  });

  const journalistPasswordHash = await bcrypt.hash("Peggy123!", 10);
  const journalistAdmin = await prisma.user.upsert({
    where: { email: "peggy.saintville@gmail.com" },
    update: {
      name: "Peggy SAINT-VILLE",
      passwordHash: journalistPasswordHash,
      role: UserRole.JOURNALISTE_ADMIN,
    },
    create: {
      email: "peggy.saintville@gmail.com",
      name: "Peggy SAINT-VILLE",
      passwordHash: journalistPasswordHash,
      role: UserRole.JOURNALISTE_ADMIN,
    },
  });
  console.log("✅ Compte JOURNALISTE_ADMIN officiel créé :", journalistAdmin.email);

  // 3. Création des 3 contacts types
  const clientB2B = await prisma.contact.upsert({
    where: { id: "seed-contact-client-b2b" },
    update: {},
    create: {
      id: "seed-contact-client-b2b",
      nom: "Alexandre Martin",
      email: "a.martin@nexusmedia.fr",
      telephone: "+33 1 42 68 00 11",
      entreprise: "Nexus Media Group",
      siren: "538 291 049",
      type: ContactType.CLIENT_B2B,
      notes: "Commanditaire de séries d'enquêtes audio et reportages thématiques.",
    },
  });
  console.log("✅ Contact CLIENT_B2B créé :", clientB2B.nom);

  const invite = await prisma.contact.upsert({
    where: { id: "seed-contact-invite" },
    update: {},
    create: {
      id: "seed-contact-invite",
      nom: "Dr. Sophie Bernard",
      email: "sophie.bernard@recherche-ia.fr",
      telephone: "+33 6 12 34 56 78",
      entreprise: "Institut National de Recherche",
      type: ContactType.INVITE,
      notes: "Chercheuse en éthique numérique, invitée pour l'émission sur l'intelligence artificielle.",
    },
  });
  console.log("✅ Contact INVITE créé :", invite.nom);

  const attachePresse = await prisma.contact.upsert({
    where: { id: "seed-contact-attache-presse" },
    update: {},
    create: {
      id: "seed-contact-attache-presse",
      nom: "Claire Fontaine",
      email: "c.fontaine@presse-impact.com",
      telephone: "+33 6 98 76 54 32",
      entreprise: "Agence Presse Impact",
      type: ContactType.ATTACHE_PRESSE,
      notes: "Contact privilégié pour les accréditations presse et les communiqués culture.",
    },
  });
  console.log("✅ Contact ATTACHE_PRESSE créé :", attachePresse.nom);

  // 4. Création d'un podcast et d'épisodes de démonstration
  let podcast = await prisma.podcast.findFirst({
    where: { title: "Les Voix du Réel" },
  });

  if (!podcast) {
    podcast = await prisma.podcast.create({
      data: {
        title: "Les Voix du Réel",
        description: "Le podcast d'investigation et d'analyse des grands enjeux contemporains.",
        coverImage: "/images/covers/voix-du-reel.jpg",
        rssFeedUrl: "https://feeds.acast.com/public/shows/les-voix-du-reel",
        spotifyUrl: "https://open.spotify.com/show/les-voix-du-reel",
        appleUrl: "https://podcasts.apple.com/podcast/les-voix-du-reel/id123456789",
        isPublic: true,
      },
    });
  }
  console.log("✅ Podcast créé / trouvé :", podcast.title);

  // Épisode 1 : PUBLIE
  const episode1 = await prisma.episode.upsert({
    where: { id: "seed-episode-1" },
    update: {
      audioStreamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      isVitrine: true,
    },
    create: {
      id: "seed-episode-1",
      podcastId: podcast.id,
      title: "Épisode 1 : Aux origines de la désinformation numérique",
      description: "Enquête immersive sur les mécanismes des usines à clics et les réseaux d'influence en ligne.",
      episodeNumber: 1,
      season: 1,
      pipelineStatus: PipelineStatus.PUBLIE,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      audioStreamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      duration: 2700, // 45 minutes
      authorId: journalistAdmin.id,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      showNotes: "Sources : Rapports RSF, auditions sénatoriales 2025, entretiens exclusifs.",
      transcript: "Bienvenue dans Les Voix du Réel. Aujourd'hui nous plongeons dans les méandres de la désinformation numérique...",
      isVitrine: true,
    },
  });
  console.log("✅ Épisode 1 créé (PUBLIE) :", episode1.title);

  // Épisode 2 : MONTAGE
  const episode2 = await prisma.episode.upsert({
    where: { id: "seed-episode-2" },
    update: {
      audioStreamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    create: {
      id: "seed-episode-2",
      podcastId: podcast.id,
      title: "Épisode 2 : IA & Journalisme, alliés ou rivaux ?",
      description: "Table ronde exclusive avec des rédacteurs en chef et des chercheurs sur les mutations du métier.",
      episodeNumber: 2,
      season: 1,
      pipelineStatus: PipelineStatus.MONTAGE,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      audioStreamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      duration: 3120, // 52 minutes
      authorId: journalistAdmin.id,
      showNotes: "Intervenants : Dr. Sophie Bernard (éthique IA), syndicats de la presse quotidienne régionale.",
    },
  });
  console.log("✅ Épisode 2 créé (MONTAGE) :", episode2.title);

  // Épisode 3 : IDEE
  await prisma.episode.upsert({
    where: { id: "seed-episode-3" },
    update: {},
    create: {
      id: "seed-episode-3",
      podcastId: podcast.id,
      title: "Épisode 3 : Les multinationales face aux pénuries d'eau douce",
      description: "Investigation sur l'accaparement des nappes phréatiques et les conflits d'usage en Europe.",
      episodeNumber: 3,
      season: 1,
      pipelineStatus: PipelineStatus.IDEE,
      duration: 2400,
      authorId: journalistAdmin.id,
    },
  });

  // Épisode 4 : ECRITURE
  await prisma.episode.upsert({
    where: { id: "seed-episode-4" },
    update: {},
    create: {
      id: "seed-episode-4",
      podcastId: podcast.id,
      title: "Épisode 4 : Crypto-monnaies et blanchiment d'argent",
      description: "Décryptage des flux financiers occultes et des plateformes d'échange non régulées.",
      episodeNumber: 4,
      season: 1,
      pipelineStatus: PipelineStatus.ECRITURE,
      duration: 1800,
      authorId: journalistAdmin.id,
    },
  });

  // 5. Collaborateur Julien
  const julienPasswordHash = await bcrypt.hash("Presse2026!", 10);
  await prisma.user.upsert({
    where: { email: "julien.redac@presse.local" },
    update: {},
    create: {
      email: "julien.redac@presse.local",
      name: "Julien Rédacteur",
      passwordHash: julienPasswordHash,
      role: UserRole.COLLABORATEUR,
      permissions: {
        podcasts: true,
        interviews: true,
        facturation: false,
        planning: true,
        crm: false,
        contrats: false,
        analytics: false,
      },
    },
  });

  // 6. Prestations du Catalogue
  await prisma.serviceCatalog.upsert({
    where: { id: "srv-podcasts" },
    update: {},
    create: {
      id: "srv-podcasts",
      name: "Production & Réalisation de Podcasts Documentaires",
      description: "Conception narrative complète de séries audio, du travail d'enquête préalable à la prise de son terrain, sound design immersif et mixage broadcast.",
      unitPrice: 1850,
      unit: "épisode",
      isPublic: true,
      isActive: true,
    },
  });
  await prisma.serviceCatalog.upsert({
    where: { id: "srv-moderation" },
    update: {},
    create: {
      id: "srv-moderation",
      name: "Animation & Modération d'Événements",
      description: "Animation de tables rondes, conventions, débats citoyens et interviews en direct. Rigueur journalistique, rythme soutenu et valorisation des intervenants.",
      unitPrice: 1200,
      unit: "jour",
      isPublic: true,
      isActive: true,
    },
  });
  await prisma.serviceCatalog.upsert({
    where: { id: "srv-reportage" },
    update: {},
    create: {
      id: "srv-reportage",
      name: "Grands Reportages & Enquêtes Presse Écrite",
      description: "Investigation au long cours, accès à des sources fermées, analyse documentaire approfondie et restitution d'articles de fond prêts à la publication.",
      unitPrice: 950,
      unit: "forfait",
      isPublic: true,
      isActive: true,
    },
  });

  // 7. CompanySettings avec les données réelles
  const companyData = {
    legalName: "Peggy SAINT-VILLE",
    tradeName: "V'là les journaleux",
    apeCode: "6399Z",
    address: "Cité les Hauts du Port, Bâtiment Eiffel, Appt 158",
    postalCode: "97200",
    city: "Fort-de-France",
    country: "France",
    email: "peggy.saintville@gmail.com",
    phone: "+596 696 03 84 78",
    vatNumber: "Non assujetti (Franchise en base)",
    legalNoticeInvoice: "TVA non applicable, art. 293 B du CGI - Micro-entreprise - Dispense d'immatriculation au RCS et au RM.",
    websiteUrl: "https://vlalesjournaleux.fr",
    bankName: "Banque Postale & Média",
  };

  const existingSettings = await prisma.companySettings.findFirst();
  if (existingSettings) {
    await prisma.companySettings.update({
      where: { id: existingSettings.id },
      data: companyData,
    });
    console.log("✅ CompanySettings mis à jour avec les coordonnées réelles de Peggy SAINT-VILLE");
  } else {
    await prisma.companySettings.create({
      data: companyData,
    });
    console.log("✅ CompanySettings créés avec les coordonnées réelles de Peggy SAINT-VILLE");
  }

  // 8. WebsiteContent
  const existingContent = await prisma.websiteContent.findFirst();
  if (!existingContent) {
    await prisma.websiteContent.create({
      data: {
        heroTitle: "Révéler le réel : journalisme d'investigation et récits sonores.",
        heroSubtitle: "Depuis plus de 10 ans, je conçois des podcasts documentaires, mène des investigations de long cours et anime les grands débats contemporains avec une exigence absolue d'indépendance et de narration.",
        bioText: `Diplômée de l'Institut Français de Presse et passée par les rédactions de radio publique, j'ai forgé ma pratique journalistique au contact direct du terrain.

Mon travail s'articule autour de l'investigation sociale, des mutations économiques, des bouleversements technologiques et de la géopolitique des ressources. L'audio permet une intimité et une authenticité rares : il restitue l'hésitation, la vérité d'une voix humaine et l'atmosphère brute d'un lieu d'enquête.

Membre de collectifs internationaux de journalistes d'investigation, je mène chaque projet dans le strict respect de la déontologie et de la protection des sources.`,
        contactEmail: "contact@vlalesjournaleux.fr",
        socialSpotify: "https://open.spotify.com/show/vlalesjournaleux",
        socialApple: "https://podcasts.apple.com/fr/podcast/vlalesjournaleux",
        socialYoutube: "https://youtube.com/@vlalesjournaleux",
        socialTwitter: "https://x.com/vlalesjournaleux",
        socialLinkedin: "https://linkedin.com/in/louise-presse-journaliste",
        socialInstagram: "https://instagram.com/vlalesjournaleux",
      },
    });
  }

  // 9. Interviews de démonstration avec Rundown et Retranscription
  await prisma.interview.upsert({
    where: { id: "seed-interview-1" },
    update: {},
    create: {
      id: "seed-interview-1",
      title: "Enquête Cabinets de Conseil & Fonds Publics",
      status: InterviewStatus.PLANIFIE,
      shootingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // dans 2 jours
      location: "Studio B - Maison de la Radio, Paris",
      notes: "Enquête approfondie sur les marchés publics attribués sans mise en concurrence. Confronter les déclarations de transparence.",
      deliverables: "Conducteur d'antenne 35 min + 3 extraits sonores pour réseaux sociaux",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      contactId: "seed-contact-invite", // Dr. Sophie Bernard
      assigneeId: journalistAdmin.id,
      questions: [
        { id: "q1", order: 1, text: "Dr. Bernard, pouvez-vous résumer l'ampleur des 4 000 pages de bons de commande analysés ?", answered: true },
        { id: "q2", order: 2, text: "Pourquoi parlez-vous de double facturation systémique entre ministères ?", answered: true },
        { id: "q3", order: 3, text: "Quelle a été la réaction formelle de Bercy lors de la notification du rapport ?", answered: false },
        { id: "q4", order: 4, text: "Quelles garanties de protection ont été mises en place pour vos sources internes ?", answered: false },
      ],
      rundown: [
        { id: "b-1", order: 1, title: "1. Accroche & Teaser Épisode", durationMin: 2, status: "VALIDE", notes: "Citer l'extrait sonore de 14 secondes sur la note confidentielle.", speaker: "Louise Presse" },
        { id: "b-2", order: 2, title: "2. Présentation Invité & Éléments de Contexte", durationMin: 5, status: "EN_COURS", notes: "Présenter le Dr. Sophie Bernard, experte en intégrité publique.", speaker: "Louise Presse & Dr. Bernard" },
        { id: "b-3", order: 3, title: "3. Révélation des Pièces & Chiffres Clés", durationMin: 10, status: "EN_ATTENTE", notes: "Poser la question sur les bons de commande et la double facturation.", speaker: "Dr. Sophie Bernard" },
        { id: "b-4", order: 4, title: "4. Question Contradictoire & Droit de Réponse", durationMin: 8, status: "EN_ATTENTE", notes: "Lire la réponse écrite du ministère.", speaker: "Louise Presse" },
        { id: "b-5", order: 5, title: "5. Débat Prospectif & Réforme de la Transparence", durationMin: 8, status: "EN_ATTENTE", notes: "Quelles solutions législatives préconisées ?", speaker: "Dr. Sophie Bernard" },
        { id: "b-6", order: 6, title: "6. Conclusion & Remerciements", durationMin: 2, status: "EN_ATTENTE", notes: "Annoncer l'épisode 2 disponible jeudi prochain.", speaker: "Louise Presse" },
      ],
      transcript: `[00:00:15 - Louise Vaneau] : Bonjour à toutes et à tous, bienvenue dans ce nouveau numéro d'enquête de V'LÀ LES JOURNALEUX. Aujourd'hui, nous recevons le Dr. Sophie Bernard pour disséquer les mécanismes financiers de l'État sous-traité.

[00:01:05 - Dr. Sophie Bernard] : Merci Louise. Ce que nous avons découvert avec mon équipe dépasse ce que nous imaginions. Les contrats ne prévoyaient aucun contrôle effectif des livrables. Les sommes étaient débloquées sur simple déclaration d'intention.

[00:03:42 - Dr. Sophie Bernard] : « La commande publique a été privatisée sans qu'aucun citoyen ne puisse auditer le moindre euro dépensé. »

[00:05:18 - Louise Vaneau] : Bercy affirme pourtant que chaque prestation a fait l'objet d'une validation hiérarchique stricte...

[00:05:40 - Dr. Sophie Bernard] : C'est faux sur le plan factuel. Nous disposons de 14 attestations écrites de directeurs de service affirmant n'avoir jamais vu l'ombre d'un rapport de ces consultants.`,
      quotes: [
        { id: "quote-1", text: "La commande publique a été privatisée sans qu'aucun citoyen ne puisse auditer le moindre euro dépensé.", speaker: "Dr. Sophie Bernard", timestamp: "00:03:42" },
        { id: "quote-2", text: "Nous disposons de 14 attestations écrites de directeurs de service affirmant n'avoir jamais vu l'ombre d'un rapport.", speaker: "Dr. Sophie Bernard", timestamp: "00:05:40" },
      ],
    },
  });

  await prisma.interview.upsert({
    where: { id: "seed-interview-2" },
    update: {},
    create: {
      id: "seed-interview-2",
      title: "Transition Écologique & Industrie : Enquête avec Mediapart",
      status: InterviewStatus.PREPARATION,
      shootingDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      location: "Plateau TV Mediapart, Paris 11e",
      notes: "Cadrage du reportage d'investigation croisé sur les subventions hydrogène vert.",
      deliverables: "Format long 52 min + podcast narratif",
      contactId: "seed-contact-client-b2b",
      assigneeId: journalistAdmin.id,
      questions: [
        { id: "q1", order: 1, text: "Comment ont été fléchées les aides de l'Ademe sur les projets régionaux ?", answered: false },
        { id: "q2", order: 2, text: "Quels sont les retards mesurés sur la mise en production effective ?", answered: false },
      ],
    },
  });

  // 10. Facturation et Devis de démonstration
  await prisma.invoiceQuote.upsert({
    where: { number: "DEV-2026-001" },
    update: {},
    create: {
      number: "DEV-2026-001",
      type: "DEVIS",
      status: "ENVOYE",
      billingType: "PRESTATION_B2B",
      operationType: "PRESTATION_SERVICES",
      eInvoiceStatus: "NON_TRANSMISE",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalAmount: 3700,
      contactId: clientB2B.id,
      notes: "Série documentaire audio immersive de 2 épisodes. Validation éditoriale sous 15 jours.",
      items: [
        {
          id: "item-1",
          description: "Production & Réalisation de Podcasts Documentaires - Épisodes 1 & 2",
          quantity: 2,
          unitPrice: 1850,
          taxRate: 20,
          totalHT: 3700,
          totalTTC: 4440,
        },
      ],
    },
  });

  await prisma.invoiceQuote.upsert({
    where: { number: "FACT-2026-001" },
    update: {},
    create: {
      number: "FACT-2026-001",
      type: "FACTURE",
      status: "PAYE",
      billingType: "DROITS_AUTEUR",
      operationType: "DROITS_AUTEUR",
      eInvoiceStatus: "ENCAISSEE",
      issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      totalAmount: 1900,
      contactId: clientB2B.id,
      notes: "Cession exclusive de droits de diffusion et pige de grand reportage. TVA 0% (Article 293 B du CGI).",
      items: [
        {
          id: "item-1",
          description: "Cession de droits d'auteur & Pige reportage investigation",
          quantity: 2,
          unitPrice: 950,
          taxRate: 0,
          totalHT: 1900,
          totalTTC: 1900,
        },
      ],
    },
  });

  console.log("🎉 Seeding terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
