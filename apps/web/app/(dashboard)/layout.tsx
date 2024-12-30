'use client';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { FiHome, FiUser, FiClock, FiLogOut, FiBell, FiSettings, FiSun, FiMoon, FiMenu } from 'react-icons/fi';
import { useGetUser } from "../hooks/index";
import Image from "next/image";
import { GeistMono } from 'geist/font/mono';

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

  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/signin");
    }

    fetchUser();
  }, []);


  if (!mounted) return null;

  if(isLoading){
    return (
      <div className="flex h-screen bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-black via-gray-950 to-gray-900">
        {/* Sidebar Skeleton */}
        <div className="w-64 h-screen bg-black/90 backdrop-blur-md border-r border-teal-500/10">
          <div className="p-6">
            <div className="h-8 w-32 bg-teal-500/10 rounded animate-pulse" />
          </div>
          <div className="px-4 space-y-2">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="p-3 rounded-lg bg-teal-500/5 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar Skeleton */}
          <div className="h-16 bg-black/90 backdrop-blur-md border-b border-teal-500/10 px-6 flex items-center justify-between">
            <div className="flex space-x-4">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 animate-pulse" />
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 animate-pulse" />
            </div>
            <div className="flex space-x-4">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 animate-pulse" />
              <div className="w-8 h-8 rounded-full bg-teal-500/10 animate-pulse" />
            </div>
          </div>

          {/* Page Content Skeleton */}
          <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-black via-gray-950 to-gray-900">
            <div className="space-y-8">
              {/* Hero Stats Section */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-black via-gray-900 to-gray-800 p-8 border border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="relative p-6 rounded-2xl border border-gray-800 bg-black/40 backdrop-blur-sm">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 animate-pulse mb-4" />
                      <div className="h-6 w-32 bg-teal-500/10 rounded animate-pulse mb-4" />
                      <div className="flex items-end justify-between">
                        <div className="h-10 w-20 bg-teal-500/10 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-teal-500/10 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((index) => (
                  <div 
                    key={index}
                    className="h-[72px] rounded-2xl bg-black/40 backdrop-blur-sm border border-gray-800 animate-pulse"
                  />
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="rounded-3xl border border-gray-800 bg-black/40 backdrop-blur-sm p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="h-8 w-48 bg-teal-500/10 rounded animate-pulse" />
                    <div className="h-8 w-32 bg-teal-500/10 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-6">
                    {[1, 2].map((index) => (
                      <div key={index} className="rounded-2xl border border-gray-800 p-6">
                        <div className="space-y-4">
                          <div className="h-6 w-3/4 bg-teal-500/10 rounded animate-pulse" />
                          <div className="h-4 w-1/2 bg-teal-500/10 rounded animate-pulse" />
                          <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="h-4 bg-teal-500/10 rounded animate-pulse" />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="rounded-2xl border border-gray-800 bg-black/40 backdrop-blur-sm p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-teal-500/10 animate-pulse" />
                        <div className="flex-1">
                          <div className="h-5 w-48 bg-teal-500/10 rounded animate-pulse mb-2" />
                          <div className="h-4 w-32 bg-teal-500/10 rounded animate-pulse" />
                        </div>
                        <div className="h-8 w-24 bg-teal-500/10 rounded-full animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if(error) return <div>Error: {error.message}</div>;

  return (
    <div className={`flex h-screen bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-black via-gray-950 to-gray-900 transition-colors duration-200 ${GeistMono.className}`}>
      {/* Sidebar */}
      <div className={`
        fixed md:relative
        ${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'} 
        h-screen 
        transition-all duration-300 ease-in-out
        bg-black/90 backdrop-blur-md border-r border-teal-500/10
        z-50
        ${GeistMono.className}
      `}>
        {/* Sidebar Toggle Button - visible on mobile */}
        <button 
          className="md:hidden absolute -right-12 top-4 bg-black/80 p-2 rounded-r-lg"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <FiMenu className="w-6 h-6 text-teal-500" />
        </button>

        <div className={`${!isSidebarOpen && 'md:hidden'} p-6`}>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Dashboard
          </h2>
        </div>
        
        <nav className="mt-6 px-4">
          <button 
            className={`flex items-center w-full p-3 mb-2 rounded-lg text-gray-300 hover:bg-gradient-to-r hover:from-teal-500/10 hover:to-cyan-500/10 transition-all group ${GeistMono.className}`}
            onClick={() => router.push("/home")}
          >
            <FiHome className={`w-5 h-5 group-hover:text-teal-500 transition-colors ${!isSidebarOpen ? 'mx-auto' : ''}`} />
            {isSidebarOpen && (
              <span className="ml-3 font-medium group-hover:text-teal-500 transition-colors">
                Home
              </span>
            )}
          </button>

          <button 
            className={`flex items-center w-full p-3 mb-2 rounded-lg text-gray-300 hover:bg-gradient-to-r hover:from-teal-500/10 hover:to-cyan-500/10 transition-all group ${GeistMono.className}`}
            onClick={() => router.push("/profile")}
          >
            <FiUser className={`w-5 h-5 group-hover:text-teal-500 transition-colors ${!isSidebarOpen ? 'mx-auto' : ''}`} />
            {isSidebarOpen && (
              <span className="ml-3 font-medium group-hover:text-teal-500 transition-colors">
                Profile
              </span>
            )}
          </button>
          
          <button 
            className={`flex items-center w-full p-3 mb-2 rounded-lg text-gray-300 hover:bg-gradient-to-r hover:from-teal-500/10 hover:to-cyan-500/10 transition-all group ${GeistMono.className}`}
            onClick={() => router.push("/sessions")}
          >
            <FiClock className={`w-5 h-5 group-hover:text-teal-500 transition-colors ${!isSidebarOpen ? 'mx-auto' : ''}`} />
            {isSidebarOpen && (
              <span className="ml-3 font-medium group-hover:text-teal-500 transition-colors">
                Sessions
              </span>
            )}
          </button>

          <div className="border-t border-teal-500/10 my-4" />

          <button 
            className={`flex items-center w-full p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all group ${GeistMono.className}`}
            onClick={() => {
              localStorage.removeItem("auth_token");
              router.push("/signin");
            }}
          >
            <FiLogOut className={`w-5 h-5 group-hover:text-red-500 transition-colors ${!isSidebarOpen ? 'mx-auto' : ''}`} />
            {isSidebarOpen && (
              <span className="ml-3 font-medium group-hover:text-red-500 transition-colors">
                Logout
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${GeistMono.className}`}>
        {/* Top Bar - darker background */}
        <div className="h-16 bg-black/90 backdrop-blur-md border-b border-teal-500/10 px-6 flex items-center justify-between">
          {/* Add sidebar toggle for desktop */}
          <div className="flex items-center space-x-4">
            <button
              className="hidden md:block p-2 rounded-lg hover:bg-gradient-to-r hover:from-teal-500/10 hover:to-cyan-500/10"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              <FiMenu className="w-5 h-5 text-gray-300 hover:text-teal-500 transition-colors" />
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gradient-to-r hover:from-teal-500/10 hover:to-cyan-500/10 transition-colors group"
            >
              {theme === 'dark' ? (
                <FiSun className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors" />
              ) : (
                <FiMoon className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors" />
              )}
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gradient-to-r hover:from-teal-500/10 hover:to-cyan-500/10 rounded-lg transition-colors group">
              <FiBell className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors" />
            </button>
            <div className="relative">
              <Image 
                src={user?.profilePicture || '/default-avatar.png'}
                alt="profile"
                width={32}
                height={32}
                className="rounded-full object-cover ring-2 ring-teal-500/20 hover:ring-teal-500/40 transition-all"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-avatar.png';
                }}
              />
            </div>
          </div>
        </div>

        {/* Page Content - darker background */}
        <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-black via-gray-950 to-gray-900">
          {children}
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 

