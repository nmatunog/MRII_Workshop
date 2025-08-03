import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkIn, checkOut, getAttendanceStatus } from '../../features/events/eventSlice';
import { selectAuth } from '../../features/auth/authSlice';

interface AttendanceProps {
  eventId: string;
  eventName: string;
}

const Attendance: React.FC<AttendanceProps> = ({ eventId, eventName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string>('unknown');
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();

  const fetchAttendanceStatus = async () => {
    if (!user) return;

    try {
      const status = await dispatch(getAttendanceStatus({ eventId, userId: user.id })).unwrap();
      setAttendanceStatus(status);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance status');
    }
  };

  const handleCheckIn = async () => {
    if (!user) {
      setError('Please login to check in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await dispatch(checkIn({ eventId, userId: user.id })).unwrap();
      await fetchAttendanceStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user) {
      setError('Please login to check out');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await dispatch(checkOut({ eventId, userId: user.id })).unwrap();
      await fetchAttendanceStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAttendanceStatus();
  }, [eventId, user?.id]);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-300 to-purple-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Event Attendance
                </h2>
                
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p>{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {eventName}
                    </h3>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Current Status
                    </h3>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      attendanceStatus === 'checked-in' 
                        ? 'bg-green-100 text-green-800'
                        : attendanceStatus === 'checked-out' 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {attendanceStatus === 'checked-in' ? 'Checked In' : 
                       attendanceStatus === 'checked-out' ? 'Checked Out' : 
                       'Not Checked In'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleCheckIn}
                      disabled={loading || attendanceStatus === 'checked-in'}
                      className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                        attendanceStatus === 'checked-in' 
                          ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                    >
                      {loading ? 'Checking In...' : 'Check In'}
                    </button>
                    <button
                      onClick={handleCheckOut}
                      disabled={loading || attendanceStatus !== 'checked-in'}
                      className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                        attendanceStatus !== 'checked-in' 
                          ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                    >
                      {loading ? 'Checking Out...' : 'Check Out'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
