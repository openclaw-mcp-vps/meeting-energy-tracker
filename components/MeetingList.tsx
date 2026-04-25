"use client";

import { CalendarClock, Repeat, Users } from "lucide-react";
import type { Meeting } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MeetingListProps {
  meetings: Meeting[];
  onOpenFeedback: (meeting: Meeting) => void;
}

function formatMeetingWindow(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Unknown schedule";
  }

  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(start);

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });

  return `${day} • ${time.format(start)} - ${time.format(end)}`;
}

function energyBadgeTone(avgEnergy: number | null) {
  if (avgEnergy === null) {
    return "border-slate-700 bg-slate-800 text-slate-300";
  }

  if (avgEnergy <= 2) {
    return "border-red-800 bg-red-950/40 text-red-300";
  }

  if (avgEnergy < 3.5) {
    return "border-amber-800 bg-amber-950/40 text-amber-300";
  }

  return "border-emerald-800 bg-emerald-950/40 text-emerald-300";
}

export function MeetingList({ meetings, onOpenFeedback }: MeetingListProps) {
  if (meetings.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
        No meetings synced yet. Connect Google or Outlook and run your first sync.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60">
      <div className="border-b border-slate-800 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-100">Recent Meetings</h3>
        <p className="mt-1 text-sm text-slate-400">Capture feedback immediately after meetings for better signal quality.</p>
      </div>
      <ul className="divide-y divide-slate-800">
        {meetings.slice(0, 20).map((meeting) => (
          <li key={meeting.id} className="px-6 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-100">{meeting.title}</p>
                  <Badge className="uppercase tracking-wide">{meeting.provider}</Badge>
                  {meeting.isRecurring ? (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Repeat className="h-3.5 w-3.5" /> Recurring
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="h-4 w-4" />
                    {formatMeetingWindow(meeting.startTime, meeting.endTime)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {meeting.attendeeCount} attendees
                  </span>
                  <span>{meeting.durationMinutes} min</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${energyBadgeTone(
                    meeting.avgEnergy
                  )}`}
                >
                  {meeting.avgEnergy === null
                    ? "No feedback yet"
                    : `Avg energy ${meeting.avgEnergy.toFixed(1)}/5 (${meeting.feedbackCount})`}
                </span>
                <Button size="sm" variant="outline" onClick={() => onOpenFeedback(meeting)}>
                  {meeting.feedbackCount > 0 ? "Update feedback" : "Add feedback"}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
