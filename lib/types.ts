export interface Meeting {
  id: string;
  title: string;
  provider: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  attendeeCount: number;
  isRecurring: boolean;
  avgEnergy: number | null;
  feedbackCount: number;
}

export interface EnergyTrendPoint {
  day: string;
  avgEnergy: number | null;
  meetingMinutes: number;
  meetingCount: number;
}

export interface DashboardStats {
  totalMeetings: number;
  weeklyHours: number;
  avgEnergy: number;
  lowEnergyRate: number;
}
