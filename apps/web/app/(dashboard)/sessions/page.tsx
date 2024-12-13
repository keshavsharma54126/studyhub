'use client';
import { useState } from 'react';
import { FiCalendar, FiClock, FiUsers, FiFilter } from 'react-icons/fi';

// You might want to replace this with your actual session type
type Session = {
  id: string;
  date: string;
  duration: string;
  participants: number;
  status: 'completed' | 'interrupted';
};

export default function SessionsPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Mock data - replace with actual data fetching
  const sessions: Session[] = [
    {
      id: '1',
      date: '2024-03-15',
      duration: '45m',
      participants: 4,
      status: 'completed',
    },
    {
      id: '2',
      date: '2024-03-14',
      duration: '30m',
      participants: 3,
      status: 'interrupted',
    },
    // Add more mock sessions as needed
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Previous Sessions</h1>
        
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <FiFilter className="w-5 h-5" />
          <span>Filter</span>
        </button>
      </div>

      {filterOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <input
                type="date"
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration
              </label>
              <select className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                <option value="any">Any duration</option>
                <option value="short">Under 30m</option>
                <option value="medium">30m - 1h</option>
                <option value="long">Over 1h</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                <option value="any">Any status</option>
                <option value="completed">Completed</option>
                <option value="interrupted">Interrupted</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 p-3 rounded-full">
                  <FiClock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Session #{session.id}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiClock className="w-4 h-4" />
                      <span>{session.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiUsers className="w-4 h-4" />
                      <span>{session.participants} participants</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    session.status === 'completed'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                  }`}
                >
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </span>
                <button
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  onClick={() => {/* Handle view details */}}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No sessions found</p>
        </div>
      )}
    </div>
  );
} 