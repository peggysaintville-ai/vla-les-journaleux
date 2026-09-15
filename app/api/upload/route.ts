import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const user = await getCurrentUser();
        if (!user) {
          throw new Error("Non autorisé. Veuillez vous connecter.");
        }

        return {
          allowedContentTypes: [
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/x-wav",
            "audio/ogg",
            "audio/x-m4a",
            "audio/m4a",
            "audio/aac",
            "audio/webm",
            "audio/flac",
            "image/jpeg",
            "image/png",
            "image/webp",
          ],
          tokenPayload: JSON.stringify({
            userId: user.userId,
            userEmail: user.email,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const { userId } = JSON.parse(tokenPayload || "{}");
          console.log(`Blob upload terminé (${blob.pathname}): ${blob.url} par ${userId}`);
        } catch {
          console.log(`Blob upload terminé : ${blob.url}`);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("Erreur Vercel Blob handleUpload :", error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors de la génération du jeton d'upload Blob." },
      { status: 400 }
    );
  }
}
