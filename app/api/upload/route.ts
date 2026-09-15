import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = (formData.get("file") || formData.get("audio") || formData.get("media")) as File | null;

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "Aucun fichier valide fourni dans le FormData." },
        { status: 400 }
      );
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const blob = await put(`ambiance/${Date.now()}-${cleanName}`, file, {
      access: "public",
    });

    return NextResponse.json({
      url: blob.url,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error("Erreur générale /api/upload vers Vercel Blob :", error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors du téléversement du fichier vers Vercel Blob." },
      { status: 500 }
    );
  }
}
