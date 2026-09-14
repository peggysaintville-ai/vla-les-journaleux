import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SaasAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  // Furtivité absolue (Ghost Route) : Si non connecté OU email différent de madacreaapp@gmail.com,
  // déclenche immédiatement un 404 strict rendant la route indétectable.
  if (!user || user.email?.toLowerCase().trim() !== "madacreaapp@gmail.com") {
    notFound();
  }

  return <>{children}</>;
}
