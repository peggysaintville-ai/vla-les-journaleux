import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const contentType = request.headers.get("content-type") || "";

    // 1. Upload via FormData classique (direct et autonome, sans dépendance à un token distant)
    if (contentType.includes("multipart/form-data") || contentType.includes("form-data")) {
      const formData = await request.formData();
      const file = (formData.get("file") || formData.get("audio") || formData.get("media")) as File | null;

      if (!file || typeof file.arrayBuffer !== "function") {
        return NextResponse.json(
          { error: "Aucun fichier valide fourni dans le FormData." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `audio-${Date.now()}-${cleanName}`;
      const filePath = path.join(uploadsDir, fileName);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${fileName}`;

      return NextResponse.json({
        url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }

    // 2. Si c'est un appel client Vercel Blob (JSON) et que le token est présent
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { handleUpload } = await import("@vercel/blob/client");
        const body = await request.json();
        const jsonResponse = await handleUpload({
          body,
          request,
          onBeforeGenerateToken: async () => {
            const user = await getCurrentUser();
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
                userId: user?.userId || "anonymous",
              }),
            };
          },
          onUploadCompleted: async ({ blob }) => {
            console.log(`Blob upload terminé : ${blob.url}`);
          },
        });
        return NextResponse.json(jsonResponse);
      } catch (blobErr: any) {
        console.warn("Erreur Vercel Blob handleUpload :", blobErr);
      }
    }

    return NextResponse.json(
      { error: "Format non supporté. Veuillez envoyer le fichier via FormData." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Erreur générale /api/upload :", error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors de l'enregistrement du fichier audio." },
      { status: 500 }
    );
  }
}
