import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getFinancialReport } from '../../features/reports/reportSlice';
import { selectAuth } from '../../features/auth/authSlice';

interface FinancialReportProps {
  eventId: string;
  eventName: string;
}

interface ReportData {
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

const FinancialReport: React.FC<FinancialReportProps> = ({ eventId, eventName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();

  const fetchReport = async () => {
    if (!user?.is_admin) {
      setError('You must be an admin to view financial reports');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await dispatch(getFinancialReport({ eventId })).unwrap();
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch financial report');
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
            <p>You must be an admin to view financial reports</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Financial Report
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
                          <p className="text-sm text-gray-500">Total Revenue</p>
                          <p className="text-2xl font-bold text-gray-900">${reportData.totalRevenue.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Payment Status
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Paid Registrations</p>
                          <p className="text-2xl font-bold text-green-600">{reportData.totalPaid}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Unpaid Registrations</p>
                          <p className="text-2xl font-bold text-red-600">{reportData.totalUnpaid}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Payment Breakdown
                      </h3>
                      <div className="space-y-4">
                        {reportData.paymentBreakdown.map((method, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">{method.method}</p>
                              <p className="text-lg font-medium text-gray-900">{method.count} transactions</p>
                            </div>
                            <p className="text-lg font-medium text-gray-900">${method.amount.toFixed(2)}</p>
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

export default FinancialReport;
