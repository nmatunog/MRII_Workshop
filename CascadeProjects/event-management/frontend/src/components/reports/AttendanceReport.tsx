import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAttendanceReport } from '../../features/reports/reportSlice';
import { selectAuth } from '../../features/auth/authSlice';

interface AttendanceReportProps {
  eventId: string;
  eventName: string;
}

interface ReportData {
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

const AttendanceReport: React.FC<AttendanceReportProps> = ({ eventId, eventName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();

  const fetchReport = async () => {
    if (!user?.is_admin) {
      setError('You must be an admin to view attendance reports');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await dispatch(getAttendanceReport({ eventId })).unwrap();
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance report');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReport();
  }, [eventId, user?.is_admin]);

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p>You must be an admin to view attendance reports</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Attendance Report
                </h2>
                
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p>{error}</p>
                  </div>
                )}

                {loading && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                  </div>
                )}

                {reportData && (
                  <div className="space-y-8">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Event Overview
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Registrations</p>
                          <p className="text-2xl font-bold text-gray-900">{reportData.totalRegistrations}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Attendees</p>
                          <p className="text-2xl font-bold text-gray-900">{reportData.totalAttendees}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Attendance Rate
                      </h3>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${reportData.attendanceRate}%` }}
                        ></div>
                      </div>
                      <p className="mt-2 text-xl font-bold text-gray-900">
                        {reportData.attendanceRate}%
                      </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Check-in Times
                      </h3>
                      <div className="space-y-4">
                        {reportData.checkInTimes.map((time, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">{time.time}</p>
                              <p className="text-lg font-medium text-gray-900">{time.count} check-ins</p>
                            </div>
                            <div className="w-1/4">
                              <div className="bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${(time.count / reportData.totalAttendees) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Daily Attendance
                      </h3>
                      <div className="space-y-4">
                        {reportData.attendanceByDate.map((day, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">{day.date}</p>
                              <p className="text-lg font-medium text-gray-900">{day.total} total</p>
                            </div>
                            <div className="flex items-center">
                              <div className="flex-1 bg-green-100 h-4 rounded-r-full">
                                <div 
                                  className="bg-green-600 h-4 rounded-r-full" 
                                  style={{ width: `${(day.checkedIn / day.total) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex-1 bg-red-100 h-4 rounded-l-full">
                                <div 
                                  className="bg-red-600 h-4 rounded-l-full" 
                                  style={{ width: `${(day.checkedOut / day.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;
