'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiUsers, FiFilter } from 'react-icons/fi';
import { useGetUser } from '../../hooks';
import { useRouter } from 'next/navigation';
// You might want to replace this with your actual session type
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
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start space-x-6">
                <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
                <div className="space-y-3 flex-1">
                  <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="flex gap-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-12 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Previous Sessions
        </h1>
        
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
        >
          <FiFilter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="font-medium">Filter</span>
        </button>
      </div>

      {filterOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-lg border border-gray-100 dark:border-gray-700 backdrop-blur-lg backdrop-filter">
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

      <div className="grid gap-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 backdrop-blur-lg backdrop-filter"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start space-x-6">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 p-4 rounded-2xl">
                  <FiClock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {session?.title}
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
                    {session?.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
                      <FiCalendar className="w-4 h-4" />
                      <span>{new Date(session?.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
                      <FiClock className="w-4 h-4" />
                      <span>{(() => {
                        const durationMs = Math.abs(new Date(session?.endTime).getTime() - new Date(session?.startTime).getTime());
                        const hours = Math.floor(durationMs / (1000 * 60 * 60));
                        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
                        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                      })()}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
                      <FiUsers className="w-4 h-4" />
                      <span>{session.participants} participants</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <button
                  className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={() => {router.push(`/recording/${session.id}`)}}
                >
                  Watch Recording
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <p className="text-lg text-gray-600 dark:text-gray-400">No sessions found</p>
        </div>
      )}
    </div>
  );
} 