'use client';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { FiHome, FiUser, FiClock, FiLogOut, FiPlay, FiUsers, FiPlus, FiBell, FiSettings, FiSun, FiMoon } from 'react-icons/fi';

export default function DashboardPage() {
  const router = useRouter();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Wait for mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication
  const token = localStorage.getItem("auth_token");
  if (!token) {
    router.push("/signin");
  }

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <div className="w-72 bg-white dark:bg-gray-800 shadow-xl">
        <div className="p-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? (
              <FiSun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
        <nav className="space-y-3 px-6">
          <button 
            className="flex items-center space-x-3 w-full p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
            onClick={() => router.push("/profile")}
          >
            <FiUser className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </button>
          
          <button 
            className="flex items-center space-x-3 w-full p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
            onClick={() => router.push("/sessions")}
          >
            <FiClock className="w-5 h-5" />
            <span className="font-medium">Previous Sessions</span>
          </button>
          
          <button 
            className="flex items-center space-x-3 w-full p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
            onClick={() => router.push("/")}
          >
            <FiHome className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </button>

          <button 
            className="flex items-center space-x-3 w-full p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 mt-8"
            onClick={() => {
              localStorage.removeItem("auth_token");
              router.push("/signin");
            }}
          >
            <FiLogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-end items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <FiBell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <FiSettings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
        </div>

        <div className="p-8">
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
              className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow-md"
              onClick={() => {/* Handle start session */}}
            >
              <FiPlay className="w-5 h-5" />
              <span className="font-medium">Start a New Session</span>
            </button>
            
            <button 
              className="flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-sm hover:shadow-md"
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
        </div>
      </div>

      {/* Join Session Modal */}
      {isJoinModalOpen && (
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
    </div>
  );
}
