import { Activity, CalendarCheck2, ChartNoAxesCombined, Clock3, MessageSquareHeart, Wallet } from "lucide-react";
import { getServerSession } from "next-auth";
import { UnlockAccessForm } from "@/components/UnlockAccessForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const faqItems = [
  {
    q: "How is this different from standard calendar analytics?",
    a: "Calendar data shows volume, not impact. Meeting Energy Tracker combines schedule load with post-meeting energy scores so managers can identify which sessions help momentum and which sessions drain teams."
  },
  {
    q: "How fast can a team start using this?",
    a: "Most teams connect a calendar and begin collecting actionable data in less than 15 minutes. You can sync existing meetings immediately and start collecting feedback after the next meeting ends."
  },
  {
    q: "How do we collect feedback without creating extra process overhead?",
    a: "Team members submit a 1-5 energy score with optional context in a lightweight post-meeting prompt. It takes under 20 seconds and creates high-signal trend data over time."
  },
  {
    q: "Can we use both Google and Outlook calendars?",
    a: "Yes. The app supports both providers and normalizes meeting metrics so mixed-tool organizations can compare team patterns consistently."
  }
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-[#0d1117] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">meeting-energy-tracker</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Track team energy levels across meetings
              </h1>
              <p className="mt-3 max-w-3xl text-base text-slate-300 sm:text-lg">
                Connect your calendars, capture simple post-meeting energy feedback, and spot patterns that create fatigue before
                it impacts delivery velocity.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <Badge className="w-fit">Niche: team-coordination</Badge>
              <Badge className="w-fit">Price: $10/month</Badge>
              {session?.user?.email ? (
                <a href="/dashboard" className="text-cyan-300 underline decoration-cyan-500 underline-offset-4">
                  Open dashboard for {session.user.email}
                </a>
              ) : (
                <a href="/api/auth/signin" className="text-cyan-300 underline decoration-cyan-500 underline-offset-4">
                  Sign in with Google, Outlook, or email
                </a>
              )}
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <CalendarCheck2 className="h-5 w-5 text-cyan-300" />
                Calendar-aware workload tracking
              </CardTitle>
              <CardDescription>Measure frequency, duration, attendee count, and recurrence trends.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Detect overloaded days and identify repeating meeting blocks that consume deep work capacity.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <MessageSquareHeart className="h-5 w-5 text-cyan-300" />
                Fast post-meeting feedback
              </CardTitle>
              <CardDescription>Capture 1-5 energy signals while context is still fresh.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Build an evidence-based view of which meetings help decisions and which meetings drain team momentum.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <ChartNoAxesCombined className="h-5 w-5 text-cyan-300" />
                Weekly optimization guidance
              </CardTitle>
              <CardDescription>Turn raw meeting data into practical manager actions.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Focus on specific recurring meetings and time slots where energy decay is strongest.
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">The problem teams keep ignoring</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300 sm:text-base">
              <li className="flex items-start gap-2">
                <Clock3 className="mt-0.5 h-4 w-4 text-orange-300" />
                Calendar density rises quietly, then suddenly deep work disappears and cycle time climbs.
              </li>
              <li className="flex items-start gap-2">
                <Activity className="mt-0.5 h-4 w-4 text-orange-300" />
                Teams feel fatigue, but without structured feedback leaders can only guess which meetings are causing it.
              </li>
              <li className="flex items-start gap-2">
                <Wallet className="mt-0.5 h-4 w-4 text-orange-300" />
                Meeting bloat is expensive: one avoidable weekly hour across a 10-person engineering team adds up fast.
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">What this changes</h2>
            <p className="mt-4 text-sm text-slate-300 sm:text-base">
              Team leads and engineering managers get a single dashboard that combines meeting load with energy outcomes. Instead of
              debating calendars by opinion, you can prune recurring meetings, tighten attendee lists, and rebalance schedules based on
              measurable impact.
            </p>
            <div className="mt-5 rounded-lg border border-cyan-900/60 bg-cyan-950/25 p-4 text-sm text-cyan-100">
              The teams that benefit most are those running many cross-functional rituals, planning sessions, and recurring status
              meetings.
            </div>
          </div>
        </section>

        <section id="pricing" className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-semibold">Pricing</h2>
          <p className="mt-2 max-w-2xl text-slate-300">
            One flat plan for managers who need practical scheduling improvements, not another analytics dashboard that no one uses.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-sm uppercase tracking-wide text-cyan-300">Manager Plan</p>
              <p className="mt-1 text-3xl font-bold">$10/mo</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>Google + Outlook calendar sync</li>
                <li>Meeting frequency and duration analytics</li>
                <li>Post-meeting team energy feedback capture</li>
                <li>Energy trend dashboard and optimization recommendations</li>
                <li>Cookie-based paywall access after purchase verification</li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-cyan-500 px-5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  Buy with Stripe
                </a>
                <a
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-5 text-sm font-semibold text-slate-100 hover:bg-slate-800"
                >
                  Go to dashboard
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
              <h3 className="text-lg font-semibold">Already purchased?</h3>
              <p className="mt-2 text-sm text-slate-300">
                Enter the same billing email used in Stripe checkout to unlock dashboard access on this browser.
              </p>
              <UnlockAccessForm />
            </div>
          </div>
        </section>

        <section id="faq" className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <div className="mt-5 space-y-4">
            {faqItems.map((item) => (
              <div key={item.q} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                <h3 className="text-base font-semibold text-slate-100">{item.q}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
