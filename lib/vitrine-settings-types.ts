export interface VitrineSettingsData {
  id?: string;
  heroJournalistName?: string | null;
  heroSubtitle?: string | null;
  heroTitle?: string | null;
  heroBio?: string | null;
  heroPhotoUrl?: string | null;
  heroPhotoPosition?: string | null;
  heroBadgeStatus?: string | null;
  heroCaption?: string | null;
  showTeaserBanner: boolean;
  teaserTitle?: string | null;
  teaserSubtitle?: string | null;
  teaserAudioUrl?: string | null;
  teaserExternalLink?: string | null;
  videoUrl?: string | null;
  audioEmbedUrl?: string | null;
  showAudioBackground: boolean;
  audioBackgroundUrl?: string | null;
  audioBackgroundTitle?: string | null;
  showPodcastsSection: boolean;
  showArticlesSection: boolean;
  showBioSection: boolean;
  showContactSection: boolean;
  bioTitle?: string | null;
  bioText?: string | null;
  // Section Soutenir le Média & Faire un Don
  donationEnabled: boolean;
  donationTitle?: string | null;
  donationSubtitle?: string | null;
  donationDescription?: string | null;
  donationUrl?: string | null;
  donationButtonText?: string | null;
  donationImageUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export const DEFAULT_VITRINE_SETTINGS: VitrineSettingsData = {
  heroJournalistName: "Peggy SAINT-VILLE",
  heroSubtitle: "Studio de Production & Rédaction d'Investigation Sonore",
  heroTitle: "Révéler le réel : journalisme d'investigation, podcasts et récits engagés.",
  heroBio: `Diplômée de l'Institut Français de Presse et passée par les rédactions de radio publique, j'ai forgé ma pratique journalistique au contact direct du terrain.

Mon travail s'articule autour de l'investigation sociale, des mutations économiques, des bouleversements technologiques et de la géopolitique des ressources. L'audio permet une intimité et une authenticité rares : il restitue l'hésitation, la vérité d'une voix humaine et l'atmosphère brute d'un lieu d'enquête.

Membre de collectifs internationaux de journalistes d'investigation, je mène chaque projet dans le strict respect de la déontologie et de la protection des sources.`,
  heroPhotoUrl: "/images/journalist-portrait.jpg",
  heroPhotoPosition: "center center",
  heroBadgeStatus: "En production active",
  heroCaption: "En direct de la rédaction centrale",
  showTeaserBanner: true,
  teaserTitle: "L'Or Vert des Caraïbes : Le Scandale des Terres Confisquées",
  teaserSubtitle:
    "Une enquête sonore exclusive en 4 épisodes sur les dépossessions foncières illégales et les conflits d'usage de l'eau.",
  teaserAudioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  teaserExternalLink: "https://instagram.com/vlalesjournaleux",
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  audioEmbedUrl: "https://open.spotify.com/embed/episode/7makk4oTQel546B0PZlDM5",
  showAudioBackground: false,
  audioBackgroundUrl: "/audio/ambient-studio.wav",
  audioBackgroundTitle: "Ambiance Studio d'Investigation (432 Hz)",
  showPodcastsSection: true,
  showArticlesSection: true,
  showBioSection: true,
  showContactSection: true,
  bioTitle: "L'indépendance comme boussole, l'humain comme centre.",
  bioText: `Diplômée de l'Institut Français de Presse et passée par les rédactions de radio publique, j'ai forgé ma pratique journalistique au contact direct du terrain.

Mon travail s'articule autour de l'investigation sociale, des mutations économiques, des bouleversements technologiques et de la géopolitique des ressources. L'audio permet une intimité et une authenticité rares : il restitue l'hésitation, la vérité d'une voix humaine et l'atmosphère brute d'un lieu d'enquête.

Membre de collectifs internationaux de journalistes d'investigation, je mène chaque projet dans le strict respect de la déontologie et de la protection des sources.`,
  // Section Soutenir le Média & Faire un Don
  donationEnabled: true,
  donationTitle: "Soutenir notre journalisme indépendant",
  donationSubtitle: "Aidez-nous à financer nos enquêtes et nos podcasts de terrain en toute liberté.",
  donationDescription: `Chaque enquête approfondie nécessite des semaines de recherche documentaire, de déplacements sur le terrain et de vérification rigoureuse des sources.

En contribuant financièrement à notre studio, vous garantissez notre totale indépendance vis-à-vis des puissances économiques et politiques. Vos dons financent directement la production d'épisodes en accès libre et la protection de nos informateurs.`,
  donationUrl: "https://donate.stripe.com/demo",
  donationButtonText: "Faire un don libre",
  donationImageUrl: "/images/journalist-portrait.jpg",
};
