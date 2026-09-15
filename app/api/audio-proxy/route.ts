import { NextRequest } from "next/server";
import { getVitrineSettings } from "@/lib/vitrine-settings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    let targetUrl = searchParams.get("url")?.trim();

    // Si aucune URL n'est passée en paramètre, on lit audioBackgroundUrl depuis VitrineSettings
    if (!targetUrl) {
      const settings = await getVitrineSettings();
      targetUrl = settings.audioBackgroundUrl || undefined;
    }

    // Aucun fichier spécifié
    if (!targetUrl) {
      const fallbackUrl = new URL("/audio/ambient-studio.wav", request.url);
      return Response.redirect(fallbackUrl, 307);
    }

    // Fichier statique local ou relatif
    if (targetUrl.startsWith("/")) {
      const localUrl = new URL(targetUrl, request.url);
      return Response.redirect(localUrl, 307);
    }

    // Préparation des en-têtes pour la requête vers le stockage
    const fetchHeaders: Record<string, string> = {};

    // Transmission des plages d'octets (Range) pour le streaming audio HTML5
    const clientRange = request.headers.get("range");
    if (clientRange) {
      fetchHeaders["range"] = clientRange;
    }

    // Injection du token d'autorisation serveur pour Vercel Blob privé
    const isVercelBlob =
      targetUrl.includes("vercel-storage.com") ||
      targetUrl.includes("blob.vercel-storage.com");

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (isVercelBlob && token) {
      fetchHeaders["Authorization"] = `Bearer ${token}`;
    }

    // Requête serveur vers le stockage
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: fetchHeaders,
    });

    // En cas d'erreur de lecture (403/404), bascule transparente vers le fallback local
    if (!response.ok && response.status !== 206) {
      console.warn(
        `[Audio-Proxy] Réponse ${response.status} pour ${targetUrl}. Redirection vers fallback.`
      );
      const fallbackUrl = new URL("/audio/ambient-studio.wav", request.url);
      return Response.redirect(fallbackUrl, 307);
    }

    // Construction des en-têtes de streaming
    const responseHeaders = new Headers();
    const contentType =
      response.headers.get("content-type") ||
      (targetUrl.endsWith(".ogg")
        ? "audio/ogg"
        : targetUrl.endsWith(".wav")
        ? "audio/wav"
        : "audio/mpeg");

    responseHeaders.set("Content-Type", contentType);
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Cache-Control", "public, max-age=3600, s-maxage=86400");

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    const contentRange = response.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error("[Audio-Proxy] Erreur proxy audio :", err?.message || err);
    const fallbackUrl = new URL("/audio/ambient-studio.wav", request.url);
    return Response.redirect(fallbackUrl, 307);
  }
}
