import { api } from "./api";

export interface CalendarPeriodRecord {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  is_ongoing: boolean;
}

export interface CalendarSymptomRecord {
  id: string;
  user_id: string;
  log_date: string;
  symptom_type: string;
  severity: number | null;
  notes: string | null;
}

export interface CalendarEstimatedPeriod {
  estimated_start_date: string;
  estimated_end_date: string;
  is_estimate: boolean;
}

export interface CalendarDataResponse {
  month: string;
  date_range: {
    start: string;
    end: string;
  };
  periods: CalendarPeriodRecord[];
  symptoms: CalendarSymptomRecord[];
  estimated_periods: CalendarEstimatedPeriod[];
  disclaimer: string;
}

export const calendarService = {
  /**
   * Fetch month tracking entries, symptoms, and estimated periods
   * GET /api/calendar?month=YYYY-MM
   */
  async getCalendarData(monthStr: string): Promise<CalendarDataResponse | null> {
    try {
      const response = await api.get<{
        status: string;
        data: CalendarDataResponse;
      }>(`/api/calendar?month=${monthStr}`);
      return response.data.data;
    } catch {
      return null;
    }
  },

  /**
   * Log a new period
   * POST /api/periods
   */
  async createPeriod(payload: {
    startDate: string;
    endDate?: string | null;
    notes?: string | null;
  }): Promise<CalendarPeriodRecord | null> {
    try {
      const response = await api.post<{
        status: string;
        data: { period: CalendarPeriodRecord };
      }>("/api/periods", {
        startDate: payload.startDate,
        endDate: payload.endDate,
        notes: payload.notes,
      });
      return response.data.data.period;
    } catch {
      return null;
    }
  },

  /**
   * Delete a period record
   * DELETE /api/periods/:id
   */
  async deletePeriod(id: string): Promise<boolean> {
    try {
      await api.delete(`/api/periods/${id}`);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Log a symptom
   * POST /api/symptoms
   */
  async logSymptom(payload: {
    logDate: string;
    symptomType: string;
    severity?: number;
    notes?: string;
  }): Promise<CalendarSymptomRecord | null> {
    try {
      const response = await api.post<{
        status: string;
        data: { symptom: CalendarSymptomRecord };
      }>("/api/symptoms", {
        logDate: payload.logDate,
        symptomType: payload.symptomType,
        severity: payload.severity,
        notes: payload.notes,
      });
      return response.data.data.symptom;
    } catch {
      return null;
    }
  },

  /**
   * Delete a symptom log
   * DELETE /api/symptoms/:id
   */
  async deleteSymptom(id: string): Promise<boolean> {
    try {
      await api.delete(`/api/symptoms/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
