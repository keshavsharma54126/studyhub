'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiUsers, FiFilter } from 'react-icons/fi';
import { useGetUser } from '../../hooks';
import { useRouter } from 'next/navigation';
import { GeistMono } from 'geist/font/mono'

type Session = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  participants: number; 
  status: 'completed' | 'interrupted';
  slides:any[];
};

export default function SessionsPage() {
  const router = useRouter();
  const token = localStorage.getItem("auth_token");
  const {user,isLoading,error} = useGetUser();
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading,setLoading] = useState(true);
  
  // Mock data - replace with actual data fetching
  const [sessions,setSessions] = useState<any[]>([]);

  useEffect(()=>{
    setLoading(true);
    if (typeof window !== 'undefined' && user) {

      const fetchEndedSessions = async () => {
        try{

           
            const endedSessions = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/sessions/ended/${user?.id}`,{
              headers:{
                Authorization: `Bearer ${token}`
              }
             });
             console.log(endedSessions.data.sessions);
             setSessions(endedSessions.data.sessions);
           
           
        }catch(error){
          console.error("Error fetching ended sessions",error);
        }
      }
      fetchEndedSessions();
      setTimeout(()=>{
        setLoading(false);
      },2000)
    }
  },[user])

  if (loading || !sessions) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-10">
          <div className="h-8 w-48 bg-gray-800 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-800 rounded animate-pulse" />
        </div>
        
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-800 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start space-x-6">
                <div className="h-16 w-16 bg-gray-800 rounded-2xl animate-pulse" />
                <div className="space-y-3 flex-1">
                  <div className="h-6 w-48 bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 w-96 bg-gray-800 rounded animate-pulse" />
                  <div className="flex gap-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-8 w-32 bg-gray-800 rounded-full animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-12 w-36 bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if(!isLoading && error){
    return <div>Error fetching sessions</div>
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 py-12 ${GeistMono.className}`}>
      <div className="flex flex-col space-y-4 mb-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-100">
              Previous Sessions
            </h1>
            <p className="text-gray-400 mt-2">Review and analyze your past presentation recordings</p>
          </div>
          
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-all duration-300 border border-gray-800"
          >
            <FiFilter className="w-5 h-5 text-gray-300" />
            <span className="font-medium text-gray-300">Filter</span>
          </button>
        </div>
      </div>

      {filterOpen && (
        <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-lg border border-gray-800">
          <h2 className="text-xl font-semibold text-gray-100 mb-6">Filter Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date Range
              </label>
              <input
                type="date"
                className="w-full p-2 border border-gray-800 rounded-lg bg-black/50 text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration
              </label>
              <select className="w-full p-2 border border-gray-800 rounded-lg bg-black/50 text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none">
                <option value="any">Any duration</option>
                <option value="short">Under 30m</option>
                <option value="medium">30m - 1h</option>
                <option value="long">Over 1h</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select className="w-full p-2 border border-gray-800 rounded-lg bg-black/50 text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none">
                <option value="any">Any status</option>
                <option value="completed">Completed</option>
                <option value="interrupted">Interrupted</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="group bg-black/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg 
              hover:shadow-xl transition-all duration-300 border border-gray-800 
              hover:border-gray-700 transform hover:-translate-y-1"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Left Section - Icon and Details */}
              <div className="flex items-start space-x-6 flex-1">
                <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 
                  p-4 rounded-2xl flex-shrink-0 group-hover:from-teal-500/30 
                  group-hover:to-cyan-500/30 transition-all duration-300"
                >
                  <FiClock className="w-8 h-8 text-teal-400" />
                </div>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-100 mb-2 
                      group-hover:text-teal-400 transition-colors">
                      {session?.title}
                    </h3>
                    <p className="text-base text-gray-400 line-clamp-2">
                      {session?.description}
                    </p>
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2 bg-black/40 
                      px-4 py-2 rounded-full border border-gray-800">
                      <FiCalendar className="w-4 h-4 text-teal-400" />
                      <span className="text-sm text-gray-300">
                        {new Date(session?.startTime).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 bg-black/40 
                      px-4 py-2 rounded-full border border-gray-800">
                      <FiClock className="w-4 h-4 text-teal-400" />
                      <span className="text-sm text-gray-300">
                        {(() => {
                          const durationMs = Math.abs(
                            new Date(session?.endTime).getTime() - 
                            new Date(session?.startTime).getTime()
                          );
                          const hours = Math.floor(durationMs / (1000 * 60 * 60));
                          const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                          const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
                          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                        })()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 bg-black/40 
                      px-4 py-2 rounded-full border border-gray-800">
                      <FiUsers className="w-4 h-4 text-teal-400" />
                      <span className="text-sm text-gray-300">
                        {session.participants} participants
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Action Button */}
              <div className="flex items-center">
                <button
                  onClick={() => router.push(`/recording/${session.id}`)}
                  className="w-full md:w-auto px-6 py-3 text-sm font-medium text-white 
                    bg-gradient-to-r from-teal-600 to-cyan-600 
                    hover:from-teal-500 hover:to-cyan-500 
                    rounded-lg transition-all duration-300 
                    shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Watch Recording
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-20 bg-black/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-800">
          <FiClock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-xl font-medium text-gray-300">No sessions found</p>
          <p className="text-gray-400 mt-2">Your completed sessions will appear here</p>
        </div>
      )}
    </div>
  );
} 