'use client';
import { useState } from "react";
import { FiPlay, FiUsers, FiPlus } from 'react-icons/fi';
import { DialogDemo } from "@repo/ui/dialog";
export default function HomePage() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Sessions</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">24</p>
          <div className="mt-2 text-sm text-green-600 dark:text-green-400">↑ 12% from last week</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Users</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">12</p>
          <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">↑ 8% from last hour</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Average Session Time</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">45m</p>
          <div className="mt-2 text-sm text-purple-600 dark:text-purple-400">↑ 15% improvement</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
      <button 
          className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-sm hover:shadow-md"
          onClick={() => setIsStartModalOpen(true)}
        >
          <FiUsers className="w-5 h-5" />
          <span className="font-medium">Start a Session</span>
        </button>
        
        <button 
          className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-sm hover:shadow-md"
          onClick={() => setIsJoinModalOpen(true)}
        >
          <FiUsers className="w-5 h-5" />
          <span className="font-medium">Join a Session</span>
        </button>
      </div>

      {/* Current Session Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Current Session</h2>
          <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium">
            Inactive
          </span>
        </div>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">No active session. Start or join a session to begin.</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 p-3 rounded-full">
              <FiPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white">New session created</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Join Session Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Start Session</h3>
            <input
              type="text"
              placeholder="Enter session code"
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            <div className="flex space-x-4">
              <button
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                onClick={() => {/* Handle join session */}}
              >
                Start
              </button>
              <button
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                onClick={() => setIsStartModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isStartModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Join Session</h3>
          <input
            type="text"
            placeholder="Enter session code"
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <div className="flex space-x-4">
            <button
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
              onClick={() => {/* Handle join session */}}
            >
              Join
            </button>
            <button
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
              onClick={() => setIsJoinModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  );
} 