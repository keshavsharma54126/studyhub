'use client';
import { useEffect, useState } from "react";
import { FiPlay, FiUsers, FiPlus, FiTrash2, FiClock, FiCalendar } from 'react-icons/fi';
import { Dropbox } from "@repo/ui/dropBox";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { useGetUser } from "../../hooks";
import { format, parseISO } from 'date-fns';
import { GeistMono } from 'geist/font/mono';

type Session={
  id:string,
  title:string,
  description:string,
  startTime:string,
  secretCode:string,
  status:string,
  slides:string[]
}
export default function HomePage() {
  const { user, isLoading, error, fetchUser } = useGetUser();
  console.log(user)
  const Id = useParams();
  const router = useRouter();
  const sessionCode = uuidv4();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sessionDate, setSessionDate] = useState<string | null>(null);
  const [pdfUrls, setPdfUrls] = useState<string[]>([]);
  const [scheduledEvents, setScheduledEvents] = useState<Session[]>([]);
  const [currentSessions, setCurrentSessions] = useState<Session[] | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [sessionToJoin, setSessionToJoin] = useState<string>("");
  const [loading,setLoading] = useState(true);
enum SessionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

  const handleStartSession = async () =>{
    try{
      const response = await axios.post(`http://localhost:3001/api/v1/sessions/session`,{
        sessionCode: sessionCode,
        title: title,
        description: description,
        sessionDate: sessionDate,
      },{
        headers:{
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`
        }
      })

      if(response.status === 200){
        await axios.post(`http://localhost:3001/api/v1/sessions/session/${response.data.sessionId}/slides/upload`,{
          pdfUrls: pdfUrls
        },{
          headers:{
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`
          }
        })
        setIsStartModalOpen(false);
        setIsJoinModalOpen(false);
        router.push(`/room/${response.data.sessionId}`);

      }
    }catch(error){
      console.error(error);
    }
  }
  const preFetchSessions = async () =>{
    try{
      const response = await axios.get(`http://localhost:3001/api/v1/sessions/sessions/${user?.id}`,{
        headers:{
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      setScheduledEvents(response.data.sessions);
    }catch(error){
      console.error(error);
    } 
  }
  const fetchCurrentSession = async () => {
    try {
      if (scheduledEvents.length > 0) {
        scheduledEvents.map((event) => {
          if(event.status === SessionStatus.ACTIVE){
            if(currentSessions){
              //@ts-ignore
              setCurrentSessions((prev:Session[]) => {
                if(prev.find((session) => session.id === event.id)){
                  return prev;
                }
                return [...prev, event];
              });
            }else{
              setCurrentSessions([event]);
            }
          }
        })
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSession = async (sessionId:string) => {
    try{
      const token = localStorage.getItem("auth_token");
      if(!token){
        return;
      }
      await axios.delete(`http://localhost:3001/api/v1/sessions/session/${sessionId}`,{
        headers:{
          Authorization: `Bearer ${token}`
        }
      })
      setIsDeleteModalOpen(false);
      setSessionToDelete(null);
      window.location.reload();
    }catch(error){
      console.error(error);
    }
  }
  const handleJoinSession = async () => {
    try{
      const token = localStorage.getItem("auth_token");
      console.log("sessionToJoin",sessionToJoin)
      if(!token){
        return;
      }
      const response = await axios.get(`http://localhost:3001/api/v1/sessions/session/tojoin/${sessionToJoin}`,{
        headers:{
          Authorization: `Bearer ${token}`
        }
      })
      console.log(response.data.sessionId)
      setSessionToJoin("");
      setIsJoinModalOpen(false);
      router.push(`/room/${response.data.sessionId}`);
    }catch(error){
      console.error(error);
    }
  }

  useEffect(() => {
    preFetchSessions();

  }, [])
  useEffect(() => {
    fetchCurrentSession();
    setLoading(false);
  }, [scheduledEvents])

  if(loading){
    return (
      <div className={`space-y-8 ${GeistMono.className}`}>
        {/* Hero Stats Section Skeleton */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-black via-gray-900 to-gray-800 p-8 border border-gray-800 mb-8">
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <div key={index} className="relative group">
                <div className="relative p-6 rounded-2xl border border-gray-800 bg-black/40 backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 animate-pulse mb-4" />
                  <div className="h-4 w-24 bg-teal-500/10 rounded animate-pulse mb-4" />
                  <div className="flex items-end justify-between">
                    <div className="h-8 w-16 bg-teal-500/10 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-teal-500/10 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[1, 2].map((index) => (
            <div 
              key={index}
              className="h-[72px] rounded-2xl bg-black/40 backdrop-blur-sm border border-gray-800 animate-pulse"
            />
          ))}
        </div>

        {/* Active Sessions and Scheduled Events Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Active Sessions Skeleton */}
          <div className="rounded-3xl border border-gray-800 bg-black/40 backdrop-blur-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="h-8 w-48 bg-teal-500/10 rounded animate-pulse" />
              <div className="h-6 w-24 bg-teal-500/10 rounded-full animate-pulse" />
            </div>
            
            <div className="space-y-6">
              {[1, 2].map((index) => (
                <div key={index} className="group relative overflow-hidden rounded-2xl border border-gray-800 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-3 flex-1">
                      <div className="h-6 w-48 bg-teal-500/10 rounded animate-pulse" />
                      <div className="h-4 w-72 bg-teal-500/10 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-24 bg-teal-500/10 rounded-xl animate-pulse" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 w-24 bg-teal-500/10 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Events Skeleton */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
            <div className="h-8 w-48 bg-teal-500/10 rounded animate-pulse mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="flex items-center space-x-4 p-4 rounded-xl border border-gray-800">
                  <div className="w-12 h-12 rounded-full bg-teal-500/10 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-teal-500/10 rounded animate-pulse" />
                    <div className="h-3 w-72 bg-teal-500/10 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-24 bg-teal-500/10 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${GeistMono.className}`}>
      {/* Hero Stats Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-black via-gray-900 to-gray-800 p-8 border border-gray-800 mb-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Total Sessions', value: '24', change: '+12%', icon: FiPlay },
            { title: 'Active Users', value: '12', change: '+8%', icon: FiUsers },
            { title: 'Avg. Duration', value: '45m', change: '+15%', icon: FiClock }
          ].map((stat, index) => (
            <div key={index} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 rounded-2xl border border-gray-800 bg-black/40 backdrop-blur-sm">
                <stat.icon className="w-8 h-8 text-teal-500 mb-4" />
                <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                  <span className="text-teal-500 text-sm">{stat.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button 
          onClick={() => setIsStartModalOpen(true)}
          className="group relative overflow-hidden rounded-2xl p-0.5"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500" />
          <div className="relative flex items-center justify-center space-x-4 bg-black/90 backdrop-blur-sm px-8 py-6 rounded-[15px] transition-all duration-500 group-hover:bg-black/70">
            <FiPlay className="w-6 h-6 text-teal-500" />
            <span className="font-medium text-white">Start New Session</span>
          </div>
        </button>

        <button 
          onClick={() => setIsJoinModalOpen(true)}
          className="group relative overflow-hidden rounded-2xl border border-gray-800 hover:border-teal-500/50 transition-colors duration-500"
        >
          <div className="flex items-center justify-center space-x-4 px-8 py-6">
            <FiUsers className="w-6 h-6 text-gray-400 group-hover:text-teal-500 transition-colors" />
            <span className="font-medium text-gray-400 group-hover:text-teal-500 transition-colors">Join Session</span>
          </div>
        </button>
      </div>

      {/* Active Sessions and Scheduled Events Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Active Sessions */}
        <div className="rounded-3xl border border-gray-800 bg-black/40 backdrop-blur-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Active Sessions</h2>
            <span className="px-4 py-1.5 rounded-full text-sm bg-teal-500/10 text-teal-500">
              {currentSessions?.length || 0} Active
            </span>
          </div>

          <div className="space-y-6">
            {currentSessions && currentSessions.length > 0 ? (
              currentSessions.map((session) => (
                <div key={session.id} className="group relative overflow-hidden rounded-2xl border border-gray-800 hover:border-teal-500/50 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{session.title}</h3>
                        <p className="text-gray-400">{session.description || 'No description provided'}</p>
                      </div>
                      <button 
                        onClick={() => router.push(`/room/${session.id}`)}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:from-teal-600 hover:to-cyan-600 transition-all duration-300"
                      >
                        Join Now
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="flex items-center space-x-2">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {format(parseISO(session.startTime), 'dd MMM, HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiUsers className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          12 Participants
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiClock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          45m Duration
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                  <FiPlay className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Active Sessions</h3>
                <p className="text-gray-400 mb-6">Start a new session to begin teaching</p>
                <button 
                  onClick={() => setIsStartModalOpen(true)}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:from-teal-600 hover:to-cyan-600 transition-all duration-300"
                >
                  Start Session
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scheduled Events */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent mb-6">
            Scheduled Events
          </h2>
          <div className="space-y-4">
            {scheduledEvents.length > 0 ? (
              scheduledEvents.map((event) => (
                <div 
                  key={event.id}
                  onClick={() => router.push(`/room/${event.id}`)}
                  className="flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 p-3 rounded-full">
                    <FiPlay className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{event.title}</p>
                      <div>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                          {format(parseISO(event.startTime), 'dd MMM, HH:mm')}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSessionToDelete(event);
                            setIsDeleteModalOpen(true);
                          }}
                          className="ml-2 inline-flex items-center px-2 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded-lg transition-colors duration-200"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{event.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                No scheduled events
              </div>
            )}
          </div>
        </div>
      </div>

      {isJoinModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-black/80 p-8 rounded-2xl w-full max-w-md border border-teal-500">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent mb-6">
              Join Session
            </h3>
            <input
              type="text"
              placeholder="Enter session code"
              value={sessionToJoin}
              onChange={(e) => setSessionToJoin(e.target.value)}
              className="w-full p-3 bg-black/40 border border-gray-800 rounded-xl mb-6 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-white placeholder-gray-500"
            />
            <div className="flex space-x-4">
              <button
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300"
                onClick={handleJoinSession}
              >
                Join
              </button>
              <button
                className="flex-1 border border-gray-800 text-gray-400 px-6 py-3 rounded-xl hover:bg-gray-800/50 transition-all duration-300"
                onClick={() => setIsJoinModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isStartModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-black/80 p-8 rounded-2xl w-full max-w-md border border-teal-500">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent mb-6">
              Start Session
            </h3>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-black/40 border border-gray-800 rounded-xl mb-6 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-white placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-black/40 border border-gray-800 rounded-xl mb-6 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-white placeholder-gray-500"
            />
            <div className="flex space-x-4">
              <input 
                onChange={(e) => setSessionDate(e.target.value)} 
                aria-label="Date and time" 
                type="datetime-local" 
                className="w-full p-3 bg-black/40 border border-gray-800 rounded-xl mb-6 
                  focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none 
                  text-gray-400 placeholder-gray-400
                  [&::-webkit-calendar-picker-indicator]:invert
                  [&::-webkit-calendar-picker-indicator]:opacity-70
                  [&::-webkit-calendar-picker-indicator]:hover:opacity-100
                  [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
            <div className="flex space-x-4 justify-center items-center mb-4">
              <Dropbox 
                setPdfUrls={setPdfUrls} 
                accessKeyId={process.env.NEXT_PUBLIC_ACCESS_KEY_ID!} 
                secretAccessKey={process.env.NEXT_PUBLIC_SECRET_ACCESS_KEY!} 
                region={process.env.NEXT_PUBLIC_REGION!} 
                bucketName={process.env.NEXT_PUBLIC_BUCKET_NAME!}
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300"
                onClick={() => {handleStartSession()}}
              >
                Start Session
              </button>
              <button
                className="flex-1 border border-gray-800 text-gray-400 px-6 py-3 rounded-xl hover:bg-gray-800/50 transition-all duration-300"
                onClick={() => setIsStartModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-black/80 p-8 rounded-2xl w-full max-w-md border border-teal-500/10">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent mb-6">
              Delete Session
            </h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete this session?</p>
            <div className="flex space-x-4">
              <button 
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300"
                onClick={() => handleDeleteSession(sessionToDelete?.id!)}
              >
                Delete
              </button>
              <button 
                className="flex-1 border border-gray-800 text-gray-400 px-6 py-3 rounded-xl hover:bg-gray-800/50 transition-all duration-300"
                onClick={() => setIsDeleteModalOpen(false)}
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