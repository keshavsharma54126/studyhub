'use client';
import { useEffect, useState } from "react";
import { FiPlay, FiUsers, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Dropbox } from "@repo/ui/dropBox";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { useGetUser } from "../../hooks";
import { format,parseISO } from 'date-fns';

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
  console.log(user?.id)
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
  }, [scheduledEvents])


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
          className="flex items-center justify-center space-x-3 bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
          onClick={() => setIsStartModalOpen(true)}
        >
          <FiUsers className="w-5 h-5" />
          <span className="font-medium">Start a Session</span>
        </button>
        
        <button 
          className="flex items-center justify-center space-x-3 bg-gradient-to-r bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
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
          {currentSessions? (
            <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium">
              Active
            </span>
          ) : (
            <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium">
              Inactive
            </span>
          )}
        </div>
        <div className="space-y-4">
          {currentSessions && currentSessions.length > 0 ? (
            currentSessions.map((session) => (
              <div key={session.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                      <FiPlay className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {session.title}
                    </h3>
                  </div>
                  <button 
                    onClick={() => router.push(`/room/${session.id}`)}
                    className="px-4 py-2  bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors duration-200"
                  >
                    Join Now
                  </button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Start Time</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {format(parseISO(session.startTime), 'dd MMM, HH:mm')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Session Code</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {session.secretCode}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                    <p className="text-sm text-gray-800 dark:text-white mt-1">
                      {session.description || 'No description provided'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-100 dark:bg-gray-700/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <FiPlay className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                No active session at the moment
              </p>
              <button 
                onClick={() => setIsStartModalOpen(true)}
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                Start a new session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scheduled Events */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Scheduled Events</h2>
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
      {isJoinModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Start Session</h3>
            <input
              type="text"
              placeholder="Enter session code"
              value={sessionToJoin}
              onChange={(e) => setSessionToJoin(e.target.value)}
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            <div className="flex space-x-4">
              <button
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-300 hover:to-blue-800 transition-all duration-300"
                onClick={handleJoinSession}
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
      {isStartModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Join Session</h3>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <div className="flex space-x-4">
            <input onChange={(e) => setSessionDate(e.target.value)} aria-label="Date and time" type="datetime-local" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div className="flex space-x-4 justify-center items-center mb-4">
            <Dropbox setPdfUrls={setPdfUrls} accessKeyId={process.env.NEXT_PUBLIC_ACCESS_KEY_ID!} secretAccessKey={process.env.NEXT_PUBLIC_SECRET_ACCESS_KEY!} region={process.env.NEXT_PUBLIC_REGION!} bucketName={process.env.NEXT_PUBLIC_BUCKET_NAME!}/>
          </div>
          
          <div className="flex space-x-4">
            <button
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
              onClick={() => {handleStartSession()}}
            >
              Start Session
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
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Delete Session</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Are you sure you want to delete this session?</p>
            <div className="flex space-x-4">
              <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300" onClick={() => handleDeleteSession(sessionToDelete?.id!)}>Delete</button>
              <button className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>    
      )}
    </>
  );
} 