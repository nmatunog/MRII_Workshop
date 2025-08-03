import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

interface ReportState {
  attendance: {
    totalEvents: number;
    totalAttendees: number;
    averageAttendance: number;
    attendanceByEvent: {
      [eventId: string]: {
        eventId: string;
        eventName: string;
        totalCapacity: number;
        totalAttendees: number;
        attendanceRate: number;
      };
    };
  };
  financial: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    revenueByEvent: {
      [eventId: string]: {
        eventId: string;
        eventName: string;
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
      };
    };
  };
}

const initialState: ReportState = {
  attendance: {
    totalEvents: 0,
    totalAttendees: 0,
    averageAttendance: 0,
    attendanceByEvent: {},
  },
  financial: {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    revenueByEvent: {},
  },
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    getAttendanceReport: (
      state,
      action: PayloadAction<{
        totalEvents: number;
        totalAttendees: number;
        averageAttendance: number;
        attendanceByEvent: {
          [eventId: string]: {
            eventId: string;
            eventName: string;
            totalCapacity: number;
            totalAttendees: number;
            attendanceRate: number;
          };
        };
      }>
    ) => {
      state.attendance = action.payload;
    },
    getFinancialReport: (
      state,
      action: PayloadAction<{
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
        revenueByEvent: {
          [eventId: string]: {
            eventId: string;
            eventName: string;
            totalRevenue: number;
            totalExpenses: number;
            netProfit: number;
          };
        };
      }>
    ) => {
      state.financial = action.payload;
    },
  },
});

export const selectAttendanceReport = createSelector(
  (state: { reports: ReportState }) => state.reports.attendance,
  (attendance) => attendance
);

export const selectFinancialReport = createSelector(
  (state: { reports: ReportState }) => state.reports.financial,
  (financial) => financial
);

export const { getAttendanceReport, getFinancialReport } = reportSlice.actions;
export default reportSlice.reducer;
