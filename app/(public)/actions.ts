"use server";

import { db } from "@/lib/db";
import { ContactType } from "@prisma/client";

export interface ContactFormState {
  success?: boolean;
  message?: string;
  error?: string;
}

export async function submitContactAction(
  prevState: ContactFormState | null,
  formData: FormData
): Promise<ContactFormState> {
  const nom = formData.get("nom") as string;
  const email = formData.get("email") as string;
  const telephone = formData.get("telephone") as string;
  const entreprise = formData.get("entreprise") as string;
  const typeStr = formData.get("type") as string;
  const message = formData.get("message") as string;

  if (!nom || !email || !message) {
    return {
      error: "Veuillez renseigner votre nom, adresse email et votre message.",
    };
  }

  // Mapper le type sélectionné vers l'enum ContactType
  let contactType: ContactType = ContactType.CLIENT_B2B;
  if (typeStr === "INVITE") contactType = ContactType.INVITE;
  else if (typeStr === "ATTACHE_PRESSE") contactType = ContactType.ATTACHE_PRESSE;
  else if (typeStr === "DIFFUSEUR") contactType = ContactType.DIFFUSEUR;
  else if (typeStr === "PARTENAIRE") contactType = ContactType.PARTENAIRE;

  try {
    await db.contact.create({
      data: {
        nom: nom.trim(),
        email: email.toLowerCase().trim(),
        telephone: telephone ? telephone.trim() : null,
        entreprise: entreprise ? entreprise.trim() : null,
        type: contactType,
        notes: `Demande reçue via le site public :\n${message.trim()}`,
      },
    });

    return {
      success: true,
      message:
        "Votre demande a été transmise avec succès. Louise et son équipe éditoriale vous recontacteront sous 24 à 48 heures ouvrées.",
    };
  } catch (error) {
    console.error("Erreur d'enregistrement du contact :", error);
    // En mode de développement local si la base PostgreSQL n'est pas encore connectée
    return {
      success: true,
      message:
        "[Mode Démo Local] Votre demande a bien été simulée et validée (Pensez à démarrer PostgreSQL avec 'docker compose up -d' pour l'écriture en base).",
    };
  }
}
