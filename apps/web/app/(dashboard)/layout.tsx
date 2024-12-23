'use client';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { FiHome, FiUser, FiClock, FiLogOut, FiBell, FiSettings, FiSun, FiMoon } from 'react-icons/fi';
import { useGetUser } from "../hooks/index";
import Image from "next/image";
type User = {
  id: string;
  email: string;
  username: string;
  profilePicture: string;
  sessions: Session[];
}
type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}
export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const { user, isLoading, error, fetchUser } = useGetUser();

  useEffect(() => {
    setMounted(true);
    
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/signin");
    }

    fetchUser();
  }, []);


  if (!mounted) return null;

  if(isLoading) return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="m-auto">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    </div>
  );

  if(error) return <div>Error: {error.message}</div>;

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
            onClick={() => router.push("/home")}
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
          <Image 
            src={user?.profilePicture || 'https://static.vecteezy.com/system/resources/previews/020/168/719/non_2x/pretty-boy-with-stylish-hairstyle-flat-avatar-icon-with-green-dot-editable-default-persona-for-ux-ui-design-profile-character-picture-with-online-status-color-messaging-app-user-badge-vector.jpg'}
            alt="profile"
            width={40}
            height={40}
            className="rounded-full object-cover w-[40px] h-[40px]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/default-avatar.png';
            }}
          />
        </div>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
} 

