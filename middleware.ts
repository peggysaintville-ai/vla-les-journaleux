import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isSaasRoute = pathname === "/saas" || pathname.startsWith("/saas/");

  // 1. Récupération du cookie d'authentification
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // 2. Furtivité absolue de la route /saas (Ghost Route)
  // Si l'utilisateur n'a pas de token et tente d'accéder à /saas, renvoyer 404 strict (ne jamais rediriger vers /login)
  if (isSaasRoute && !token) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }

  // Pour les autres routes protégées de l'application sans token : redirection immédiate vers /login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Vérification du token JWT localement en mémoire (sans aucune requête réseau/base)
  const user = await verifyJWT(token);

  // Si le token est invalide ou expiré
  if (!user) {
    if (isSaasRoute) {
      const res = NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
      res.cookies.delete(AUTH_COOKIE_NAME);
      return res;
    }
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  // 4. Protection stricte de /saas : réservé exclusivement à madacreaapp@gmail.com
  if (isSaasRoute) {
    const normalizedEmail = user.email?.toLowerCase().trim();
    if (normalizedEmail !== "madacreaapp@gmail.com") {
      // Pour tout autre utilisateur, la route est inexistante (404 pure)
      return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
    }
    return NextResponse.next();
  }

  // 5. Routage instantané : aucune requête réseau ni Prisma dans le middleware.
  // La vérification fine de licence SaaS s'exécute côté Server Layout dans app/(app)/layout.tsx.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/site-vitrine",
    "/site-vitrine/:path*",
    "/articles",
    "/articles/:path*",
    "/interviews",
    "/interviews/:path*",
    "/podcasts",
    "/podcasts/:path*",
    "/planning",
    "/planning/:path*",
    "/facturation",
    "/facturation/:path*",
    "/contacts",
    "/contacts/:path*",
    "/catalogue",
    "/catalogue/:path*",
    "/contrats",
    "/contrats/:path*",
    "/analytics",
    "/analytics/:path*",
    "/utilisateurs",
    "/utilisateurs/:path*",
    "/parametres",
    "/parametres/:path*",
    "/saas",
    "/saas/:path*",
  ],
};
