import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SaaSStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await db.saaSConfig.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!config) {
      return NextResponse.json({
        status: "ACTIVE",
        isValid: true,
        validUntil: null,
      });
    }

    const now = new Date();
    const isExpired = config.validUntil < now || config.status === SaaSStatus.EXPIRED;
    const isSuspended = config.status === SaaSStatus.SUSPENDED;
    const isValid = !isExpired && !isSuspended && config.status === SaaSStatus.ACTIVE;

    return NextResponse.json({
      status: config.status,
      isValid,
      validUntil: config.validUntil,
      isExpired,
      isSuspended,
    });
  } catch (error) {
    console.warn("Vérification SaaS : base non disponible, fallback actif pour le dev local.", error);
    return NextResponse.json({
      status: "ACTIVE",
      isValid: true,
      fallback: true,
    });
  }
}
