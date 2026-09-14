export interface VitrineSettingsData {
  id?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export const DEFAULT_VITRINE_SETTINGS: VitrineSettingsData = {
  showTeaserBanner: true,
  teaserTitle: "L'Or Vert des Caraïbes : Le Scandale des Terres Confisquées",
  teaserSubtitle:
    "Une enquête sonore exclusive en 4 épisodes sur les dépossessions foncières illégales et les conflits d'usage de l'eau.",
  teaserAudioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  teaserExternalLink: "https://instagram.com/vlalesjournaleux",
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  audioEmbedUrl: "https://open.spotify.com/embed/episode/7makk4oTQel546B0PZlDM5",
  showAudioBackground: false,
  audioBackgroundUrl: "https://actions.google.com/sounds/v1/ambiences/humming_room_tone.ogg",
  audioBackgroundTitle: "Ambiance Studio d'Investigation (432 Hz)",
  showPodcastsSection: true,
  showArticlesSection: true,
  showBioSection: true,
  showContactSection: true,
  bioTitle: "L'indépendance comme boussole, l'humain comme centre.",
  bioText: `Diplômée de l'Institut Français de Presse et passée par les rédactions de radio publique, j'ai forgé ma pratique journalistique au contact direct du terrain.

Mon travail s'articule autour de l'investigation sociale, des mutations économiques, des bouleversements technologiques et de la géopolitique des ressources. L'audio permet une intimité et une authenticité rares : il restitue l'hésitation, la vérité d'une voix humaine et l'atmosphère brute d'un lieu d'enquête.

Membre de collectifs internationaux de journalistes d'investigation, je mène chaque projet dans le strict respect de la déontologie et de la protection des sources.`,
};
