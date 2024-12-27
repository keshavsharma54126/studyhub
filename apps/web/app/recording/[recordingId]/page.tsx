'use client';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { ChatComponent } from '@repo/ui/chatComponent';
import { Button } from '@repo/ui/button';
import { PlayIcon, PauseIcon, RotateCcwIcon, MessageCircle, X as CloseIcon, Loader2 } from 'lucide-react';
import { useGetUser } from "../../hooks";
import VideoJS from "video.js"
import "video.js/dist/video-js.css"
import Player from 'video.js/dist/types/player';
import { useParams } from 'next/navigation';

interface SessionEvent {
    id: string;
    sessionId: string;
    userId: string;
    eventType: string;
    eventData: any;
    timestamp: Date;
}

interface ChatMessage {
    userId: string;
    username: string;
    profilePicture: string;
    message: string;
    timestamp: Date;
}

interface Slide{
    url:string;
    timestamp:Date;
    id:string;
}

export default function SessionReplayPage() {
    const isPlayingRef = useRef(false);
    const {user,isLoading,error} = useGetUser();
    const [events, setEvents] = useState<SessionEvent[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const slideCanvasRef = useRef<HTMLCanvasElement>(null);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>();
    const startTimeRef = useRef<number>(0);
    const sessionId = useParams().recordingId;
    const [videoUrl,setVideoUrl] = useState<string>(`${process.env.NEXT_PUBLIC_AWS_URL}/${sessionId}.m3u8`);
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<Player | null>(null);
    const[slides,setSlides] = useState<Slide[]>([]);
    const startVideoRef = useRef<boolean>(false);
    const[loading,setLoading] = useState<boolean>(true);

    const animate = useRef<() => void>();
    
    

    const videoJsOptions = {
        autoplay:false,
        controls:false,
        responsive:true,
        fluid:true,
        sources:[{
            src:videoUrl,
            type:"application/x-mpegURL"
        }]
    }
    
    useEffect(() => {
        setLoading(true);
        const initializeSession = async () => {
            await fetchSessionRecording();
            await fetchSlides();
            initCanvas();
            setLoading(false);
            

            const videoElement = videoRef.current;

            if(!videoElement) return;
                playerRef.current = VideoJS(videoElement,videoJsOptions);
                
                playerRef.current.ready(()=>{
                    
                    playerRef.current?.on("play",()=>{
                        console.log("Video is playing");
                    })
                    playerRef.current?.on("pause",()=>{
                        console.log("Video is paused");
                    })
                    playerRef.current?.on("restart",()=>{
                        console.log("Video is restarted");
                    })
                })
            
        };

        initializeSession();

        return () => {
            if(playerRef.current){
                playerRef.current.dispose();
                playerRef.current = null;
                console.log("Player disposed");
            }
        }

        
    }, [sessionId,videoUrl,videoRef,playerRef]);


    

    const fetchSlides = async ()=>{
        try{
            const token = localStorage.getItem("auth_token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/sessions/session/${sessionId}/slides/images`,{
                headers:{
                    "Authorization": `Bearer ${token}`
                }
            });
            console.log(response.data);
            setSlides(response.data.images.map((slide:any)=>({
                url:slide.url,
                sessionId:sessionId,
                id:slide.id
            }))); 
            if(response.data.images.length > 0){
                displaySlide(response.data.images[0]?.url||"");
            }
        }catch(error){
            console.error(error);
        }
    }

    const fetchSessionRecording = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if(sessionId){
            const recordingResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/sessions/session/${sessionId}/recording`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            const eventWithDates = recordingResponse.data.sessionRecording.map((event:any)=>({
                ...event,
                timestamp:new Date(event.timestamp)
            }));
            setEvents(eventWithDates);
            }
        } catch (error) {
            console.error('Failed to fetch session recording:', error);
        }
    };


    const initCanvas = () => {
        const slideCanvas = slideCanvasRef.current;
        const drawingCanvas = drawingCanvasRef.current;
        if (!slideCanvas || !drawingCanvas) return;

        // Set both canvases to match container dimensions
        const setCanvasDimensions = (canvas: HTMLCanvasElement) => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        setCanvasDimensions(slideCanvas);
        setCanvasDimensions(drawingCanvas);

        // Initialize drawing canvas context
        const ctx = drawingCanvas.getContext('2d');
        if (ctx) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    };

    const handleStrokeEvent = (eventData: any) => {
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y, lastX, lastY, color, width, isEraser } = eventData;

        ctx.beginPath();
        ctx.moveTo(lastX * canvas.width, lastY * canvas.height);
        ctx.lineTo(x * canvas.width, y * canvas.height);

        if (isEraser) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = width * 10;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
        }

        ctx.stroke();
    };

    const displaySlide = (slideUrl: string) => {
        const canvas = slideCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            if (drawingCanvasRef.current) {
                drawingCanvasRef.current.width = canvas.width;
                drawingCanvasRef.current.height = canvas.height;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = slideUrl;
    };

    useEffect(() => {
        animate.current = () => {
            if (!isPlayingRef.current) {
                console.log("Animation stopped - isPlaying is false");
                return;
            }

            const currentTime = Date.now();
            const firstEventTime = events[0]?.timestamp?.getTime() || 0;
            const playbackTime = (currentTime - startTimeRef.current) * playbackSpeed;
            const currentPlaybackTime = firstEventTime + playbackTime;

            let shouldContinue = false;

            for (let i = currentEventIndex; i < events.length; i++) {
                const eventReceived = events[i];
                if (!eventReceived?.timestamp) continue;

                if (eventReceived.timestamp.getTime() <= currentPlaybackTime) {
                    switch (eventReceived.eventType) {
                        case 'STROKE_RECEIVED':
                            handleStrokeEvent(eventReceived.eventData);
                            break;
                        case 'CLEAR_RECEIVED':
                            const ctx = drawingCanvasRef.current?.getContext('2d');
                            if (ctx) {
                                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                            }
                            break;
                        case 'SLIDE_CHANGE_RECEIVED':
                            displaySlide(eventReceived.eventData.url);
                            break;
                        case 'CHAT_MESSAGE_RECEIVED':
                            setChatMessages(prev => [...prev, eventReceived.eventData]);
                            break;
                    }
                    setCurrentEventIndex(i + 1);
                } else {
                    shouldContinue = true;
                    break;
                }
            }

            if (shouldContinue) {
                animationFrameId.current = requestAnimationFrame(animate.current!);
            } else {
                isPlayingRef.current = false;
                setIsPlaying(false);
            }
        };
    }, [events, currentEventIndex, playbackSpeed]);

    const playRecording = () => {
       if(playerRef.current){
        startVideoRef.current = !startVideoRef.current;
        setIsPlaying(true);

        if(playerRef.current){
            isPlayingRef.current = true;
            playerRef.current.play();
        }
        
        const firstEventTime = events[0]?.timestamp?.getTime() || 0;
        startTimeRef.current = Date.now() - ((events[currentEventIndex]?.timestamp?.getTime() || firstEventTime) - firstEventTime);

        if (animate.current) {
            animationFrameId.current = requestAnimationFrame(animate.current);
        }
       }else{
         window.location.reload();
       }
    };

    const pauseRecording = () => {
        // Update both state and ref
        setIsPlaying(false);
        if(playerRef.current){
            playerRef.current.pause();
        }
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    };

    const resetRecording = () => {
        // First pause any ongoing playback
        isPlayingRef.current = false;
        setIsPlaying(false);
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }

        // Reset video
        if (playerRef.current) {
            playerRef.current.currentTime(0);
        }

        // Reset canvas
        const drawingCtx = drawingCanvasRef.current?.getContext('2d');
        if (drawingCtx) {
            drawingCtx.clearRect(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height);
        }

        // Reset event index and chat messages
        setCurrentEventIndex(0);
        setChatMessages([]);

        // Reset initial slide if exists
        if (events.length > 0) {
            const initialSlideEvent = events.find(event => 
                event.eventType === 'SLIDE_CHANGE_RECEIVED' || 
                event.eventType === 'SLIDE_CHANGE'
            );
            if (initialSlideEvent) {
                displaySlide(initialSlideEvent.eventData.url);
            }
        }

        // Reset timing reference to match first event
        const firstEventTime = events[0]?.timestamp?.getTime() || 0;
        startTimeRef.current = Date.now() - (firstEventTime - firstEventTime);

        // Start playback immediately
        isPlayingRef.current = true;
        setIsPlaying(true);
        if (playerRef.current) {
            playerRef.current.play();
        }
        if (animate.current) {
            animationFrameId.current = requestAnimationFrame(animate.current);
        }
    };

    const plus5 = ()=>{
        if(playerRef.current){
            const currentTime = playerRef.current.currentTime();
            if(currentTime){
                playerRef.current.currentTime(currentTime + 5);
            }
        }
        
    }
    const minus5 =()=>{
        if(playerRef.current){
            const currentTime = playerRef.current.currentTime();
            if(currentTime){
                playerRef.current.currentTime(Math.max(0,currentTime - 5));
            }
        }
    }

    if(loading){
        return <div className="h-screen flex justify-center items-center"> <Loader2 className="w-10 h-10 animate-spin" /> </div>
    }

    return (
        <div suppressHydrationWarning className="h-screen flex">
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h1 className="text-2xl font-bold">Session Replay</h1>
                    <div className="flex gap-4 items-center">
                        <select
                            value={playbackSpeed}
                            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                            className="px-3 py-2 border rounded"
                        >
                            <option value={0.5}>0.5x</option>
                            <option value={1}>1x</option>
                            <option value={2}>2x</option>
                            <option value={4}>4x</option>
                        </select>
                        <Button onClick={minus5} className='bg-blue-600 hover:bg-blue-400 text-white'><RotateCcwIcon className="w-5 h-5" />-5</Button>
                        <Button
                            onClick={() => {
                                console.log("Button clicked");
                                isPlaying ? pauseRecording() : playRecording();
                            }}
                            variant="outline"
                            className="w-12 h-12 flex items-center justify-center"
                        >
                            {isPlaying ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10" />}
                        </Button>
                        <Button onClick={plus5} className='bg-blue-600 hover:bg-blue-400 text-white'>+5 <RotateCcwIcon className="w-5 h-5 scale-x-[-1]" /></Button>
                        <Button 
                            onClick={resetRecording} 
                            variant="outline"
                            className="w-12 h-12 flex items-center justify-center"
                        >
                            <RotateCcwIcon className="w-10 h-10" />
                        </Button>
                    </div>
                </div>

                {/* Canvas Container */}
                <div className="flex-1 relative">
                    <canvas
                        suppressHydrationWarning
                        ref={slideCanvasRef}
                        className="absolute inset-0 w-full h-full"
                    />
                    <canvas
                        suppressHydrationWarning
                        ref={drawingCanvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                    />
                </div>
            </div>

            {/* Right Sidebar */}
            <div suppressHydrationWarning className="w-80 border-l flex flex-col">
                {/* Video Component */}
                <div suppressHydrationWarning data-vjs-player>
                    <video 
                        suppressHydrationWarning 
                        ref={videoRef} 
                        playsInline={playerRef.current ? true : false} 
                        className="video-js vjs-theme-sea" 
                    />
                </div>
                <div className="flex-1 relative">
                    <Button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className="lg:hidden fixed bottom-3/4 right-1 z-50 rounded-full w-12 h-12 flex items-center justify-center bg-blue-500 text-white shadow-lg"
                    >
                        {isChatOpen ? <CloseIcon size={24} /> : <MessageCircle size={24} />}
                    </Button>
                    
                    <div className={`
                        absolute inset-0 bg-white
                        transform transition-transform duration-300 ease-in-out
                        ${isChatOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                    `}>
                                <ChatComponent 
                                    currentUser={user || {id: "", username: "", profilePicture: ""}}
                                    onSendMessage={() => {}}
                                    //@ts-ignore
                                    messages={chatMessages}
                                    setChatMessages={setChatMessages}
                                    sessionId={sessionId as string}
                                />
                     
                    </div>
                </div>
            </div>
        </div>
    );
}
