import { Pool } from 'pg';
import { format } from 'date-fns';

interface FinancialReport {
  totalRegistrations: number;
  totalRevenue: number;
  totalPaid: number;
  totalUnpaid: number;
  paymentBreakdown: {
    method: string;
    amount: number;
    count: number;
  }[];
}

interface AttendanceReport {
  totalRegistrations: number;
  totalAttendees: number;
  attendanceRate: number;
  checkInTimes: {
    time: string;
    count: number;
  }[];
  attendanceByDate: {
    date: string;
    total: number;
    checkedIn: number;
    checkedOut: number;
  }[];
}

interface EventStats {
  totalEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  activeEvents: number;
  upcomingEvents: number;
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

export const getFinancialReport = async (eventId: string): Promise<FinancialReport> => {
  try {
    const registrationQuery = `
      SELECT COUNT(*) as total_registrations
      FROM registrations
      WHERE event_id = $1
    `;

    const revenueQuery = `
      SELECT SUM(amount) as total_revenue
      FROM payments
      WHERE event_id = $1
    `;

    const paymentStatusQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'paid') as total_paid,
        COUNT(*) FILTER (WHERE status = 'unpaid') as total_unpaid
      FROM registrations
      WHERE event_id = $1
    `;

    const paymentBreakdownQuery = `
      SELECT 
        payment_method as method,
        SUM(amount) as amount,
        COUNT(*) as count
      FROM payments
      WHERE event_id = $1
      GROUP BY payment_method
    `;

    const [registrations, revenue, paymentStatus, paymentBreakdown] = await Promise.all([
      pool.query(registrationQuery, [eventId]),
      pool.query(revenueQuery, [eventId]),
      pool.query(paymentStatusQuery, [eventId]),
      pool.query(paymentBreakdownQuery, [eventId]),
    ]);

    return {
      totalRegistrations: registrations.rows[0].total_registrations,
      totalRevenue: revenue.rows[0].total_revenue || 0,
      totalPaid: paymentStatus.rows[0].total_paid || 0,
      totalUnpaid: paymentStatus.rows[0].total_unpaid || 0,
      paymentBreakdown: paymentBreakdown.rows,
    };
  } catch (error) {
    throw new Error(`Failed to generate financial report: ${error}`);
  }
};

export const getAttendanceReport = async (eventId: string): Promise<AttendanceReport> => {
  try {
    const registrationQuery = `
      SELECT COUNT(*) as total_registrations
      FROM registrations
      WHERE event_id = $1
    `;

    const attendanceQuery = `
      SELECT 
        COUNT(DISTINCT user_id) as total_attendees
      FROM check_ins
      WHERE event_id = $1
    `;

    const attendanceRateQuery = `
      SELECT 
        COUNT(DISTINCT CASE WHEN status = 'checked-in' THEN user_id END) as checked_in,
        COUNT(DISTINCT user_id) as total
      FROM check_ins
      WHERE event_id = $1
    `;

    const checkInTimesQuery = `
      SELECT 
        TO_CHAR(check_in_time, 'HH12:MI AM') as time,
        COUNT(*) as count
      FROM check_ins
      WHERE event_id = $1
      GROUP BY TO_CHAR(check_in_time, 'HH12:MI AM')
      ORDER BY time
    `;

    const attendanceByDateQuery = `
      SELECT 
        TO_CHAR(check_in_time, 'YYYY-MM-DD') as date,
        COUNT(DISTINCT user_id) as total,
        COUNT(DISTINCT CASE WHEN status = 'checked-in' THEN user_id END) as checked_in,
        COUNT(DISTINCT CASE WHEN status = 'checked-out' THEN user_id END) as checked_out
      FROM check_ins
      WHERE event_id = $1
      GROUP BY date
      ORDER BY date
    `;

    const [registrations, attendance, attendanceRate, checkInTimes, attendanceByDate] = await Promise.all([
      pool.query(registrationQuery, [eventId]),
      pool.query(attendanceQuery, [eventId]),
      pool.query(attendanceRateQuery, [eventId]),
      pool.query(checkInTimesQuery, [eventId]),
      pool.query(attendanceByDateQuery, [eventId]),
    ]);

    const rate = attendanceRate.rows[0].checked_in / (attendanceRate.rows[0].total || 1) * 100;

    return {
      totalRegistrations: registrations.rows[0].total_registrations,
      totalAttendees: attendance.rows[0].total_attendees,
      attendanceRate: Math.round(rate * 100) / 100,
      checkInTimes: checkInTimes.rows,
      attendanceByDate: attendanceByDate.rows,
    };
  } catch (error) {
    throw new Error(`Failed to generate attendance report: ${error}`);
  }
};

export const getEventStats = async (eventId: string): Promise<EventStats> => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE id = $1) as total_events,
        COUNT(DISTINCT r.user_id) as total_registrations,
        COALESCE(SUM(p.amount), 0) as total_revenue,
        COUNT(*) FILTER (WHERE e.status = 'active') as active_events,
        COUNT(*) FILTER (WHERE e.start_date > NOW()) as upcoming_events
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      LEFT JOIN payments p ON r.id = p.registration_id
      WHERE e.id = $1
    `;

    const stats = await pool.query(statsQuery, [eventId]);
    return stats.rows[0];
  } catch (error) {
    throw new Error(`Failed to generate event stats: ${error}`);
  }
};

export const getOverallStats = async (): Promise<EventStats> => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT r.user_id) as total_registrations,
        COALESCE(SUM(p.amount), 0) as total_revenue,
        COUNT(*) FILTER (WHERE e.status = 'active') as active_events,
        COUNT(*) FILTER (WHERE e.start_date > NOW()) as upcoming_events
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      LEFT JOIN payments p ON r.id = p.registration_id
    `;

    const stats = await pool.query(statsQuery);
    return stats.rows[0];
  } catch (error) {
    throw new Error(`Failed to generate overall stats: ${error}`);
  }
};
