"use client"
import { VideoComponent } from "@repo/ui/videoComponent";
import { ChatComponent } from "@repo/ui/chatComponent";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon } from "lucide-react";
import { div, span } from "framer-motion/client";

interface Slide {
    id: string;
    url: string;
    createdAt: string;
    sessionId: string;
}

export default function RoomPage() {
    const router = useRouter();
    const [token, setToken] = useState<string>("");
    const sessionId = useParams().roomId;
    const [slides, setSlides] = useState<Slide[]>([]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isSessionEnded, setIsSessionEnded] = useState(false);
    const[hasSessionEnded,setHasSessionEnded] = useState(false);
    const [isSessionStarted, setIsSessionStarted] = useState(false);

    const getSlides = async () => {
       try{
        const auth_token = localStorage.getItem("auth_token");
        const response = await axios.get(`http://localhost:3001/api/v1/sessions/session/${sessionId}/slides/images`,{
            headers:{
                "Authorization": `Bearer ${auth_token}`
            }
        });
        console.log(response.data);
        setSlides(response.data.images);
       }catch(error){
        console.error(error);
       }
    }

    const displaySlide = (slideUrl: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            // Set canvas dimensions to match the image aspect ratio
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            // Calculate dimensions to maintain aspect ratio
            const ratio = Math.min(
                canvas.width / img.width,
                canvas.height / img.height
            );
            const centerX = (canvas.width - img.width * ratio) / 2;
            const centerY = (canvas.height - img.height * ratio) / 2;

            // Clear canvas and draw image
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
                img,
                centerX,
                centerY,
                img.width * ratio,
                img.height * ratio
            );
        };
        img.src = slideUrl;
    };

    const nextSlide = () => {
        if (currentSlideIndex < slides.length - 1) {
            setCurrentSlideIndex(prev => prev + 1);
        }
    };

    const previousSlide = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1);
        }
    };

    const checkSessionEnded = async()=>{
        try{
            console.log("checking session ended");
            const auth_token = localStorage.getItem("auth_token");
            const response = await axios.get(`http://localhost:3001/api/v1/sessions/session/${sessionId}/status`,{
                headers:{
                    "Authorization": `Bearer ${auth_token}`
                }
            });
            console.log(response.data);
            if(response.data.message === "session ended"){
                setHasSessionEnded(true);
            }
            else{
                setHasSessionEnded(false);
            }
        }catch(error){
            console.error(error);
        }
    }

    useEffect(() => {
        checkSessionEnded();
        if (slides.length > 0) {
            displaySlide(slides[currentSlideIndex]?.url || "");
        }
    }, [currentSlideIndex, slides]);

    useEffect(() => {
        checkSessionEnded();
        const auth_token = localStorage.getItem("auth_token");
        if (!auth_token) {
            router.push("/signin");
            return;
        }

        axios.post(`http://localhost:3001/api/v1/sessions/token`,
            {
                roomName: "room1",
                participantName: "user1"
            },
            {
                headers: {
                    "Authorization": `Bearer ${auth_token}`
                }
            })
            .then(res => setToken(res.data.token))
            .catch(err => console.error(err));
            getSlides();
    }, [router]);

    const handleStartSession = async()=>{
        try{
            const auth_token = localStorage.getItem("auth_token");
            const response = await axios.put(`http://localhost:3001/api/v1/sessions/session/${sessionId}/start`,{},{
                headers:{
                    "Authorization": `Bearer ${auth_token}`
                }
            });
            console.log(response.data.message);
            setIsSessionStarted(true);
        }catch(error){
            console.error(error);
        }
    }

    const handleEndSession = async()=>{
        try{
            const auth_token = localStorage.getItem("auth_token");
            const response = await axios.put(`http://localhost:3001/api/v1/sessions/session/${sessionId}/end`,{},{
                headers:{
                    "Authorization": `Bearer ${auth_token}`
                }
            });
            console.log(response.data.message);
            setIsSessionEnded(true);
            window.location.reload();
        }catch(error){
            console.error(error);
        }
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full bg-gray-50">
            <div className="relative flex-1 h-[60vh] lg:h-screen p-3 sm:p-4 lg:p-6">
                <div className="absolute top-4 left-4 z-10 flex space-x-3">
                    <Button onClick={handleStartSession} className="bg-green-500 hover:bg-green-600 text-white 
                                   px-4 py-2 rounded-lg transition-all duration-200 
                                   flex items-center gap-2 shadow-lg hover:shadow-xl">
                        <PlayIcon size={18} />
                        {isSessionStarted?(<span className="hidden sm:inline">Session Started</span>):(<span className="hidden sm:inline">Start Session</span>)}
                    </Button>
                    <Button 
                        onClick={() => setIsSessionEnded(true)}
                        className="bg-red-500 hover:bg-red-600 text-white 
                                 px-4 py-2 rounded-lg transition-all duration-200 
                                 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        <ArrowLeftIcon size={18} />
                        <span className="hidden sm:inline">End Session</span>
                    </Button>
                </div>

                <div className="relative w-full h-full bg-white rounded-xl shadow-xl 
                              border border-gray-200 overflow-hidden">
                    <canvas 
                        ref={canvasRef}
                        id="canvas" 
                        className="w-full h-full"
                    ></canvas>

                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 
                                 flex items-center gap-4 bg-white/90 backdrop-blur-sm 
                                 px-6 py-3 rounded-full shadow-lg">
                        <Button
                            onClick={previousSlide}
                            disabled={currentSlideIndex === 0}
                            className="bg-white hover:bg-gray-100 text-gray-800 
                                   shadow-md rounded-full p-2 disabled:opacity-50
                                   transition-all duration-200 hover:shadow-lg"
                        >
                            <ChevronLeftIcon size={24} />
                        </Button>

                        <span className="font-medium text-gray-700">
                            {currentSlideIndex + 1} / {slides.length}
                        </span>

                        <Button
                            onClick={nextSlide}
                            disabled={currentSlideIndex === slides.length - 1}
                            className="bg-white hover:bg-gray-100 text-gray-800 
                                   shadow-md rounded-full p-2 disabled:opacity-50
                                   transition-all duration-200 hover:shadow-lg"
                        >
                            <ChevronRightIcon size={24} />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-full lg:w-80 xl:w-96 2xl:w-[420px] 
                          bg-white border-t lg:border-l border-gray-200 shadow-xl">
                <div className="h-[30vh] sm:h-[35vh] lg:h-[40vh] p-3 sm:p-4">
                    <div className="w-full h-full rounded-xl overflow-hidden 
                                 shadow-lg bg-gray-50">
                        <VideoComponent token={token} />
                    </div>
                </div>

                <div className="flex-1 min-h-[40vh] lg:min-h-[60vh] p-3 sm:p-4">
                    <ChatComponent 
                        currentUser="user" 
                        onSendMessage={() => {}} 
                        messages={[]}
                        className="h-full rounded-xl shadow-lg"
                    />
                </div>
            </div>

            {isSessionEnded && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm 
                             flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl 
                                 w-full max-w-md shadow-2xl transform transition-all">
                        <div className="flex flex-col items-center justify-center">
                            <h3 className="text-2xl font-bold text-gray-800 
                                       dark:text-white mb-6">
                                Do you want to end the session?
                            </h3>
                            <div className="flex flex-row items-center justify-center gap-4">
                                <Button 
                                    onClick={handleEndSession} 
                                    className="bg-red-500 hover:bg-red-600 text-white 
                                           px-6 py-2.5 rounded-lg transition-all 
                                           duration-200 font-medium"
                                >
                                    Yes, End Session
                                </Button>
                                <Button 
                                    onClick={() => setIsSessionEnded(false)} 
                                    className="bg-gray-500 hover:bg-gray-600 text-white 
                                           px-6 py-2.5 rounded-lg transition-all 
                                           duration-200 font-medium"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {hasSessionEnded && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm 
                             flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl 
                                 w-full max-w-md shadow-2xl transform transition-all">
                        <h3 className="text-2xl font-bold text-gray-800 
                                   dark:text-white mb-6">
                            Session Ended
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Thank you for using our platform. We hope you had a great experience.
                        </p>
                        <Button 
                            onClick={() => router.push('/home')} 
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white 
                                           px-6 py-3 rounded-lg transition-all duration-200 
                                           font-medium"
                        >
                            Return to Home
                        </Button>
                    </div>
                </div>
            )}
        </div>
       
    );
}