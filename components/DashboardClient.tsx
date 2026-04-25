"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderCircle, LogOut, RefreshCcw } from "lucide-react";
import { EnergyChart } from "@/components/EnergyChart";
import { FeedbackModal } from "@/components/FeedbackModal";
import { MeetingList } from "@/components/MeetingList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats, EnergyTrendPoint, Meeting } from "@/lib/types";

interface DashboardClientProps {
  userEmail: string;
}

interface MeetingsPayload {
  meetings: Meeting[];
  trend: EnergyTrendPoint[];
  stats: DashboardStats;
}

const emptyStats: DashboardStats = {
  totalMeetings: 0,
  weeklyHours: 0,
  avgEnergy: 0,
  lowEnergyRate: 0
};

export function DashboardClient({ userEmail }: DashboardClientProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [trend, setTrend] = useState<EnergyTrendPoint[]>([]);
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);

  const loadMeetings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/meetings", { cache: "no-store" });
      const payload = (await response.json()) as MeetingsPayload & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load meetings.");
      }

      setMeetings(payload.meetings ?? []);
      setTrend(payload.trend ?? []);
      setStats(payload.stats ?? emptyStats);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  const insight = useMemo(() => {
    if (stats.totalMeetings === 0) {
      return "Sync your calendar to generate your first energy and meeting load insights.";
    }

    if (stats.avgEnergy > 0 && stats.avgEnergy < 3) {
      return "Your team energy trend is trending low. Start by shortening recurring status meetings to 25 minutes and batch decision meetings into two fixed windows.";
    }

    if (stats.lowEnergyRate > 30) {
      return "A high share of meetings are flagged as draining. Review meetings with energy <=2 and remove attendees who do not make decisions in those sessions.";
    }

    return "Energy feedback is stable. Keep collecting responses and target reductions in the highest-duration recurring meetings first.";
  }, [stats]);

  return (
    <main className="min-h-screen bg-[#0d1117] pb-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Team Energy Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              Signed in as <span className="text-slate-200">{userEmail}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                setSyncing(true);
                setError("");

                try {
                  const response = await fetch("/api/calendar/sync", { method: "POST" });
                  const payload = (await response.json()) as { error?: string };

                  if (!response.ok) {
                    throw new Error(payload.error ?? "Calendar sync failed.");
                  }

                  await loadMeetings();
                } catch (caught) {
                  setError(caught instanceof Error ? caught.message : "Calendar sync failed.");
                } finally {
                  setSyncing(false);
                }
              }}
              disabled={syncing}
            >
              {syncing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Sync calendar
            </Button>
            <a
              href="/api/auth/signout"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-4 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </a>
          </div>
        </header>

        {error ? (
          <div className="rounded-md border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-200">{error}</div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Meetings this week</CardDescription>
              <CardTitle>{stats.totalMeetings}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-400">Sessions in the last 7 days</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Hours in meetings</CardDescription>
              <CardTitle>{stats.weeklyHours}h</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-400">Time consumed by meetings this week</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average energy</CardDescription>
              <CardTitle>{stats.avgEnergy > 0 ? `${stats.avgEnergy.toFixed(1)}/5` : "No signal yet"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-400">Based on the last 30 days of feedback</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Low-energy share</CardDescription>
              <CardTitle>{stats.lowEnergyRate}%</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-400">Responses at 1-2 energy score</CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <EnergyChart trend={trend} />
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Actionable Insight</CardTitle>
              <CardDescription>What to change this week</CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-slate-300">{insight}</CardContent>
          </Card>
        </section>

        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-sm text-slate-400">
            Loading meeting and feedback data...
          </div>
        ) : (
          <MeetingList meetings={meetings} onOpenFeedback={setActiveMeeting} />
        )}
      </div>

      <FeedbackModal
        open={Boolean(activeMeeting)}
        meeting={activeMeeting}
        onClose={() => setActiveMeeting(null)}
        onSubmit={async (payload) => {
          const response = await fetch("/api/feedback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });

          const result = (await response.json()) as { error?: string };

          if (!response.ok) {
            throw new Error(result.error ?? "Failed to save feedback.");
          }

          await loadMeetings();
        }}
      />
    </main>
  );
}
