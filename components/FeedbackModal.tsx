"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Meeting } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackModalProps {
  open: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  onSubmit: (payload: { meetingId: string; energyScore: number; notes: string }) => Promise<void>;
}

const energyLabels = [
  "Drained",
  "Low",
  "Neutral",
  "Good",
  "Energized"
] as const;

export function FeedbackModal({ open, meeting, onClose, onSubmit }: FeedbackModalProps) {
  const [energyScore, setEnergyScore] = useState(3);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !meeting) {
      return;
    }

    setEnergyScore(Math.min(5, Math.max(1, Math.round(meeting.avgEnergy ?? 3))));
    setNotes("");
  }, [meeting, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open || !meeting) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-[#0d1117] p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Post-meeting energy check</h3>
            <p className="mt-1 text-sm text-slate-400">{meeting.title}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            aria-label="Close feedback modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-200">How did this meeting leave you?</p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => setEnergyScore(score)}
                  className={`rounded-md border px-2 py-3 text-center text-sm transition-colors ${
                    energyScore === score
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                      : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <div className="font-semibold">{score}</div>
                  <div className="mt-1 text-xs">{energyLabels[score - 1]}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-200">Context for your score (optional)</p>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What made this meeting useful or draining?"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await onSubmit({
                    meetingId: meeting.id,
                    energyScore,
                    notes
                  });
                  onClose();
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Saving..." : "Save feedback"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
