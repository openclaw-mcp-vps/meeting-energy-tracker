import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { CalendarMeeting } from "@/lib/calendar";
import type { DashboardStats, EnergyTrendPoint, Meeting } from "@/lib/types";

const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "meeting-energy.db");

let dbInstance: Database.Database | null = null;

function createDatabase() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      userEmail TEXT NOT NULL,
      provider TEXT NOT NULL,
      title TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      durationMinutes INTEGER NOT NULL,
      attendeeCount INTEGER NOT NULL,
      isRecurring INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_meetings_user_start ON meetings(userEmail, startTime DESC);

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      meetingId TEXT NOT NULL,
      userEmail TEXT NOT NULL,
      energyScore INTEGER NOT NULL CHECK(energyScore BETWEEN 1 AND 5),
      notes TEXT,
      submittedAt TEXT NOT NULL,
      UNIQUE(meetingId, userEmail),
      FOREIGN KEY(meetingId) REFERENCES meetings(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_feedback_user_submitted ON feedback(userEmail, submittedAt DESC);

    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      checkoutSessionId TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL,
      paidAt TEXT NOT NULL
    );
  `);

  return db;
}

function getDb() {
  if (!dbInstance) {
    dbInstance = createDatabase();
  }

  return dbInstance;
}

export function upsertMeetings(userEmail: string, provider: string, meetings: CalendarMeeting[]) {
  const db = getDb();

  const insert = db.prepare(`
    INSERT INTO meetings (
      id, userEmail, provider, title, startTime, endTime, durationMinutes, attendeeCount, isRecurring, updatedAt
    ) VALUES (
      @id, @userEmail, @provider, @title, @startTime, @endTime, @durationMinutes, @attendeeCount, @isRecurring, datetime('now')
    )
    ON CONFLICT(id)
    DO UPDATE SET
      title = excluded.title,
      startTime = excluded.startTime,
      endTime = excluded.endTime,
      durationMinutes = excluded.durationMinutes,
      attendeeCount = excluded.attendeeCount,
      isRecurring = excluded.isRecurring,
      updatedAt = datetime('now')
  `);

  const transaction = db.transaction((rows: CalendarMeeting[]) => {
    for (const meeting of rows) {
      insert.run({
        id: `${provider}:${meeting.externalId}`,
        userEmail,
        provider,
        title: meeting.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        durationMinutes: meeting.durationMinutes,
        attendeeCount: meeting.attendeeCount,
        isRecurring: meeting.isRecurring ? 1 : 0
      });
    }
  });

  transaction(meetings);

  return meetings.length;
}

export function getMeetingsForUser(userEmail: string, limit = 120): Meeting[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT
        m.id,
        m.title,
        m.provider,
        m.startTime,
        m.endTime,
        m.durationMinutes,
        m.attendeeCount,
        m.isRecurring,
        ROUND(AVG(f.energyScore), 2) AS avgEnergy,
        COUNT(f.id) AS feedbackCount
      FROM meetings m
      LEFT JOIN feedback f ON f.meetingId = m.id
      WHERE m.userEmail = ?
      GROUP BY m.id
      ORDER BY m.startTime DESC
      LIMIT ?
    `
    )
    .all(userEmail, limit) as Array<{
    id: string;
    title: string;
    provider: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    attendeeCount: number;
    isRecurring: number;
    avgEnergy: number | null;
    feedbackCount: number;
  }>;

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    provider: row.provider,
    startTime: row.startTime,
    endTime: row.endTime,
    durationMinutes: row.durationMinutes,
    attendeeCount: row.attendeeCount,
    isRecurring: Boolean(row.isRecurring),
    avgEnergy: row.avgEnergy,
    feedbackCount: row.feedbackCount
  }));
}

export function getEnergyTrendForUser(userEmail: string, days = 30): EnergyTrendPoint[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT
        substr(m.startTime, 1, 10) AS day,
        ROUND(AVG(f.energyScore), 2) AS avgEnergy,
        SUM(m.durationMinutes) AS meetingMinutes,
        COUNT(DISTINCT m.id) AS meetingCount
      FROM meetings m
      LEFT JOIN feedback f ON f.meetingId = m.id
      WHERE m.userEmail = ?
        AND m.startTime >= datetime('now', ?)
      GROUP BY day
      ORDER BY day ASC
    `
    )
    .all(userEmail, `-${days} days`) as Array<{
    day: string;
    avgEnergy: number | null;
    meetingMinutes: number | null;
    meetingCount: number;
  }>;

  return rows.map((row) => ({
    day: row.day,
    avgEnergy: row.avgEnergy,
    meetingMinutes: row.meetingMinutes ?? 0,
    meetingCount: row.meetingCount
  }));
}

export function getDashboardStatsForUser(userEmail: string): DashboardStats {
  const db = getDb();

  const weekly = db
    .prepare(
      `
      SELECT
        COUNT(*) AS totalMeetings,
        SUM(durationMinutes) AS weeklyMinutes
      FROM meetings
      WHERE userEmail = ?
        AND startTime >= datetime('now', '-7 days')
    `
    )
    .get(userEmail) as { totalMeetings: number; weeklyMinutes: number | null };

  const energy = db
    .prepare(
      `
      SELECT
        ROUND(AVG(f.energyScore), 2) AS avgEnergy,
        AVG(CASE WHEN f.energyScore <= 2 THEN 1.0 ELSE 0 END) AS lowEnergyRate
      FROM feedback f
      INNER JOIN meetings m ON m.id = f.meetingId
      WHERE m.userEmail = ?
        AND f.submittedAt >= datetime('now', '-30 days')
    `
    )
    .get(userEmail) as { avgEnergy: number | null; lowEnergyRate: number | null };

  return {
    totalMeetings: weekly.totalMeetings ?? 0,
    weeklyHours: Number((((weekly.weeklyMinutes ?? 0) as number) / 60).toFixed(1)),
    avgEnergy: energy.avgEnergy ?? 0,
    lowEnergyRate: Number((((energy.lowEnergyRate ?? 0) as number) * 100).toFixed(1))
  };
}

export function saveFeedbackForMeeting(input: {
  meetingId: string;
  userEmail: string;
  energyScore: number;
  notes?: string;
}) {
  const db = getDb();

  db.prepare(
    `
      INSERT INTO feedback (id, meetingId, userEmail, energyScore, notes, submittedAt)
      VALUES (@id, @meetingId, @userEmail, @energyScore, @notes, datetime('now'))
      ON CONFLICT(meetingId, userEmail)
      DO UPDATE SET
        energyScore = excluded.energyScore,
        notes = excluded.notes,
        submittedAt = datetime('now')
    `
  ).run({
    id: `${input.meetingId}:${input.userEmail}`,
    meetingId: input.meetingId,
    userEmail: input.userEmail,
    energyScore: input.energyScore,
    notes: input.notes?.trim() || null
  });
}

export function recordPurchase(input: { email: string; checkoutSessionId: string; source: string }) {
  const db = getDb();

  db.prepare(
    `
      INSERT INTO purchases (email, checkoutSessionId, source, paidAt)
      VALUES (@email, @checkoutSessionId, @source, datetime('now'))
      ON CONFLICT(email)
      DO UPDATE SET
        checkoutSessionId = excluded.checkoutSessionId,
        source = excluded.source,
        paidAt = datetime('now')
    `
  ).run(input);
}

export function hasPaidEmail(email: string) {
  const db = getDb();
  const row = db.prepare(`SELECT 1 AS paid FROM purchases WHERE email = ? LIMIT 1`).get(email) as
    | { paid: number }
    | undefined;
  return Boolean(row?.paid);
}
