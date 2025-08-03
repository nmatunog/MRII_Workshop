import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAuth } from '../../features/auth/authSlice';

const EventDashboard: React.FC = () => {
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();

  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  const handleViewEvents = () => {
    navigate('/events/list');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Event Management Dashboard
                </h2>
                
                {user?.is_admin ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                      onClick={handleCreateEvent}
                      className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                      Create New Event
                    </button>
                    <button
                      onClick={handleViewEvents}
                      className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300"
                    >
                      View All Events
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600">
                      Welcome, {user?.fullName}! You can view events and manage your attendance.
                    </p>
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

export default EventDashboard;
