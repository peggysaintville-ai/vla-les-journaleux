import { Metadata } from "next";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import PlanningManager from "@/components/planning-manager";

export const metadata: Metadata = {
  title: "Planning Média & Enregistrements | V'LÀ LES JOURNALEUX",
  description: "Calendrier des sessions d'enregistrement, tournages, interviews et directs.",
};

export const dynamic = "force-dynamic";

export default async function PlanningPage() {
  const user = await getCurrentUser();

  const [events, users] = await Promise.all([
    db.calendarEvent.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    }),
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <PlanningManager
      initialEvents={events.map((e) => ({
        ...e,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate.toISOString(),
      }))}
      journalists={users}
      currentUserId={user?.userId}
    />
  );
}
