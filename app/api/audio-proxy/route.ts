import { NextRequest } from "next/server";
import { get } from "@vercel/blob";
import { getVitrineSettings } from "@/lib/vitrine-settings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  let targetUrl = searchParams.get("url")?.trim();

  // Si aucune URL n'est passée en paramètre, on lit audioBackgroundUrl depuis VitrineSettings
  if (!targetUrl) {
    const settings = await getVitrineSettings();
    targetUrl = settings.audioBackgroundUrl || undefined;
  }

  console.log("[Audio-Proxy] Requête de streaming reçue pour :", targetUrl);

  // Aucun fichier spécifié
  if (!targetUrl) {
    console.warn("[Audio-Proxy] Aucune URL spécifiée, redirection vers le son local.");
    const fallbackUrl = new URL("/audio/ambient-studio.wav", request.url);
    return Response.redirect(fallbackUrl, 307);
  }

  // Fichier statique local ou relatif
  if (targetUrl.startsWith("/")) {
    const localUrl = new URL(targetUrl, request.url);
    return Response.redirect(localUrl, 307);
  }

  const clientRange = request.headers.get("range");
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  // Si c'est un fichier stocké sur Vercel Blob
  const isVercelBlob =
    targetUrl.includes("vercel-storage.com") ||
    targetUrl.includes(".blob.vercel-storage.com");

  if (isVercelBlob) {
    if (!token) {
      console.error(
        "[Audio-Proxy] ERREUR CRITIQUE : La variable d'environnement BLOB_READ_WRITE_TOKEN est absente ou non configurée !"
      );
    }

    // Retirer les query params (ex: ?download=1) pour get()
    const cleanUrl = targetUrl.split("?")[0];

    // 1. Tentative via la méthode officielle get() du SDK @vercel/blob
    try {
      console.log("[Audio-Proxy] Tentative de lecture via @vercel/blob get() :", cleanUrl);
      const blobResult = await get(cleanUrl, {
        access: "private",
        headers: clientRange ? { range: clientRange } : undefined,
      });

      if (blobResult && blobResult.stream) {
        console.log(`[Audio-Proxy] Succès get() @vercel/blob pour : ${cleanUrl} (status: ${blobResult.statusCode})`);
        const headers = new Headers();
        const contentType =
          blobResult.blob.contentType ||
          (cleanUrl.endsWith(".ogg")
            ? "audio/ogg"
            : cleanUrl.endsWith(".wav")
            ? "audio/wav"
            : "audio/mpeg");

        headers.set("Content-Type", contentType);
        headers.set("Accept-Ranges", "bytes");
        headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");

        if (blobResult.blob.size) {
          headers.set("Content-Length", blobResult.blob.size.toString());
        }

        const upstreamContentRange = blobResult.headers.get("content-range");
        if (upstreamContentRange) {
          headers.set("Content-Range", upstreamContentRange);
        }

        return new Response(blobResult.stream, {
          status: blobResult.statusCode || 200,
          headers,
        });
      }
    } catch (sdkError: any) {
      console.warn(
        `[Audio-Proxy] get() @vercel/blob a échoué (${sdkError?.message || sdkError}). Tentative de secours via fetch direct...`
      );
    }

    // 2. Tentative de secours via fetch direct avec header Authorization
    try {
      const fetchHeaders: Record<string, string> = {};
      if (clientRange) {
        fetchHeaders["range"] = clientRange;
      }
      if (token) {
        fetchHeaders["Authorization"] = `Bearer ${token}`;
      }

      console.log("[Audio-Proxy] Tentative fetch direct avec token pour :", cleanUrl);
      const response = await fetch(cleanUrl, {
        method: "GET",
        headers: fetchHeaders,
      });

      if (response.ok || response.status === 206) {
        console.log(`[Audio-Proxy] Succès fetch direct pour : ${cleanUrl} (status: ${response.status})`);
        const responseHeaders = new Headers();
        const contentType =
          response.headers.get("content-type") ||
          (cleanUrl.endsWith(".ogg")
            ? "audio/ogg"
            : cleanUrl.endsWith(".wav")
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
      } else {
        console.error(
          `[Audio-Proxy] Erreur fetch distant (${cleanUrl}) : HTTP ${response.status} ${response.statusText}`
        );
      }
    } catch (fetchErr: any) {
      console.error("[Audio-Proxy] Erreur exception fetch direct :", fetchErr?.message || fetchErr);
    }
  } else {
    // 3. Cas d'une URL externe hors Vercel Blob (ex: CDN externe, mp3 public)
    try {
      const fetchHeaders: Record<string, string> = {};
      if (clientRange) {
        fetchHeaders["range"] = clientRange;
      }

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: fetchHeaders,
      });

      if (response.ok || response.status === 206) {
        const responseHeaders = new Headers();
        const contentType = response.headers.get("content-type") || "audio/mpeg";
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
      } else {
        console.error(`[Audio-Proxy] Échec fetch URL externe (${targetUrl}) : HTTP ${response.status}`);
      }
    } catch (extErr: any) {
      console.error("[Audio-Proxy] Erreur fetch URL externe :", extErr?.message || extErr);
    }
  }

  // Si toutes les tentatives ont échoué, on bascule proprement sur le son local de secours
  console.warn(`[Audio-Proxy] Repli final vers le son local pour : ${targetUrl}`);
  const fallbackUrl = new URL("/audio/ambient-studio.wav", request.url);
  return Response.redirect(fallbackUrl, 307);
}
