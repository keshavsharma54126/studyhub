'use client';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { ChatComponent } from '@repo/ui/chatComponent';
import { Button } from '@repo/ui/button';
import { PlayIcon, PauseIcon, RotateCcwIcon, MessageCircle, X as CloseIcon } from 'lucide-react';
import { useGetUser } from "../../hooks";
import { eachWeekOfInterval } from 'date-fns';
import VideoJS from "video.js"
import "video.js/dist/video-js.css"
import Player from 'video.js/dist/types/player';
import {use} from "react"
import { useParams } from 'next/navigation';
import { emptyEl } from 'video.js/dist/types/utils/dom';

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
    const [videoUrl,setVideoUrl] = useState<string>(`https://syncstream.s3.ap-south-1.amazonaws.com/studyhub/recordings/${sessionId}.m3u8`);
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<Player | null>(null);
    const[slides,setSlides] = useState<Slide[]>([]);


    const videoJsOptions = {
        autoplay:true,
        controls:true,
        responsive:true,
        fluid:true,
        sources:[{
            src:videoUrl,
            type:"application/x-mpegURL"
        }]
    }
    
    useEffect(() => {
        const initializeSession = async () => {
            await fetchSessionRecording();
            await fetchSlides();
            initCanvas();
            
            if(!playerRef.current){
                const videoElement = videoRef.current;
                if(!videoElement) return;
                
                playerRef.current = VideoJS(videoElement,videoJsOptions);
                playerRef.current.on("error",(error:any)=>{
                    console.error("VideoJS error",error);
                });
            }
        };

        initializeSession();

        return () => {
            if(playerRef.current){
                playerRef.current.dispose();
                playerRef.current = null;
            }
        }
    }, [sessionId]);
    

    const fetchSlides = async ()=>{
        try{
            const token = localStorage.getItem("auth_token");
            const response = await axios.get(`http://localhost:3001/api/v1/sessions/session/${sessionId}/slides/images`,{
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

    const playRecording = () => {
        // Create a local ref to track playing state to avoid state closure issues
        isPlayingRef.current = true;
        setIsPlaying(true);
        const firstEventTime = events[0]?.timestamp?.getTime() || 0;
        startTimeRef.current = Date.now() - ((events[currentEventIndex]?.timestamp?.getTime() || firstEventTime) - firstEventTime);

        const animate = () => {
            // Use ref instead of state
            if (!isPlayingRef.current) {
                console.log("Animation stopped - isPlaying is false");
                return;
            }

            const currentTime = Date.now();
            const firstEventTime = events[0]?.timestamp?.getTime() || 0;
            const playbackTime = (currentTime - startTimeRef.current) * playbackSpeed;
            const currentPlaybackTime = firstEventTime + playbackTime;

            let shouldContinue = false;

            // Process all events that should have occurred by now
            for (let i = currentEventIndex; i < events.length; i++) {
                const eventReceived= events[i];
                console.log(eventReceived)
                
                if (!eventReceived?.timestamp) continue;

                if (eventReceived.timestamp.getTime() <= currentPlaybackTime) {
                    switch (eventReceived.eventType) {
                        case 'STROKE_RECEIVED':
                            console.log("Stroke event received");
                            handleStrokeEvent(eventReceived.eventData);
                            break;
                        case 'CLEAR_RECEIVED':
                            console.log("Clear event received");
                            const ctx = drawingCanvasRef.current?.getContext('2d');
                            if (ctx) {
                                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                            }
                            break;
                        case 'SLIDE_CHANGE_RECEIVED':
                            console.log("Slide change event received");
                            displaySlide(eventReceived.eventData.url);
                            break;
                        case 'CHAT_MESSAGE_RECEIVED':
                            console.log("Chat message event received");
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
                animationFrameId.current = requestAnimationFrame(animate);
            } else {
                isPlayingRef.current = false;
                setIsPlaying(false);
            }
        };

        animationFrameId.current = requestAnimationFrame(animate);
    };

    const pauseRecording = () => {
        // Update both state and ref
        setIsPlaying(false);
        isPlayingRef.current = false;
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    };

    const resetRecording = () => {
        setIsPlaying(false);
        setCurrentEventIndex(0);
        const drawingCtx = drawingCanvasRef.current?.getContext('2d');
        if (drawingCtx) {
            drawingCtx.clearRect(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height);
        }
        // Reset slide to initial state
        if (events.length > 0) {
            const initialSlideEvent = events.find(event => event.eventType === 'SLIDE_CHANGE');
            if (initialSlideEvent) {
                displaySlide(initialSlideEvent.eventData.url);
            }
        }
    };

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
            <div className="w-80 border-l flex flex-col">
                {/* Video Component */}
                <div data-vjs-player>
                    <video ref={videoRef} className="video-js vjs-theme-sea" />
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

function useUser(): { user: any; isLoading: any; error: any; } {
    throw new Error('Function not implemented.');
}
