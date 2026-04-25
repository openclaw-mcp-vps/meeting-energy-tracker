import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { DashboardClient } from "@/components/DashboardClient";
import { authOptions } from "@/lib/auth";
import { PAID_COOKIE_NAME } from "@/lib/paywall";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const paidCookie = cookieStore.get(PAID_COOKIE_NAME)?.value;

  if (paidCookie !== "1") {
    redirect("/");
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  return <DashboardClient userEmail={session.user.email} />;
}
