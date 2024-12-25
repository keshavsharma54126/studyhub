"use client"
import { VideoComponent } from "@repo/ui/videoComponent";
import { ChatComponent } from "@repo/ui/chatComponent";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon, XIcon, Eraser as ClearIcon, PaintBucketIcon, Pen, Minus, MessageCircle, X as CloseIcon, PlusIcon } from "lucide-react";
import { useGetUser } from "../../hooks";
import { HexColorPicker } from "react-colorful";
import { RoomWebSocket } from "../../webSocket";

interface Slide {
    id: string;
    url: string;
    createdAt: string;
    sessionId: string;
}

interface ChatMessage {
    userId: string;
    username: string;
    profilePicture: string;
    message: string;
}


export default function RoomPage() {

    const router = useRouter();
    const [token, setToken] = useState<string>("");
    const [isHost,setIsHost] = useState(false);
    const sessionId = useParams().roomId;
    const [slides, setSlides] = useState<Slide[]>([]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const slideCanvasRef = useRef<HTMLCanvasElement>(null);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isSessionEnded, setIsSessionEnded] = useState(false);
    const[hasSessionEnded,setHasSessionEnded] = useState(false);
    const [isSessionStarted, setIsSessionStarted] = useState(false);
    const { user, isLoading, error, fetchUser } = useGetUser();
    const [isDrawing,setIsDrawing] = useState(false);
    const[lastX,setLastX] = useState(0);
    const[lastY,setLastY] = useState(0);
    const[strokeColor,setStrokeColor] = useState("#000000");
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [isEraser,setIsEraser] = useState(false);
    const [strokeSize,setStrokeSize] = useState(2);
    const roomWebSocketRef = useRef<RoomWebSocket | null>(null);
    const [isConnected,setIsConnected] = useState(false);
    const [isAdmin,setIsAdmin] = useState(false);
    const [chatMessages,setChatMessages] = useState<ChatMessage[]>([]);
    const [isChatOpen,setIsChatOpen] = useState(false);
    const [isDrawingControlsOpen,setIsDrawingControlsOpen] = useState(false);
    const [isRecording,setIsRecording] = useState(false);

    const currentSlideIndexRef = useRef<number>(
        parseInt(localStorage.getItem(`slideIndex-${sessionId}`) || "0")
    );
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
        const canvas = slideCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            // Set canvas dimensions to match the container size
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            
            // Set drawing canvas to match
            if (drawingCanvasRef.current) {
                drawingCanvasRef.current.width = canvas.width;
                drawingCanvasRef.current.height = canvas.height;
            }

            // Draw image to fill entire canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = slideUrl;
    };

    const nextSlide = (wsBool: boolean = false) => {
        if (currentSlideIndexRef.current < slides.length - 1) {
            const newIndex = currentSlideIndexRef.current + 1;
            
            // Only emit websocket event if it's the host and not a received event
            if (roomWebSocketRef.current && !wsBool && isHost) {
                roomWebSocketRef.current.send(JSON.stringify({
                    type: "SLIDE_CHANGE",
                    payload: {
                        sessionId,
                        slideIndex: newIndex,
                        move: "next",
                        url: slides[newIndex]?.url
                    }
                }));
            }
            
            // Always update the slide index
            currentSlideIndexRef.current = newIndex;
            // Force display the new slide
            localStorage.setItem(`slideIndex-${sessionId}`,newIndex.toString());
            console.log("slides",slides[newIndex]?.url);
            displaySlide(slides[newIndex]?.url || "");
        }
    };

    const previousSlide = (wsBool: boolean) => {
        if (currentSlideIndexRef.current > 0) {
            const newIndex = currentSlideIndexRef.current - 1;
            
            // Only emit websocket event if it's the host and not a received event
            if (roomWebSocketRef.current && !wsBool && isHost) {
                roomWebSocketRef.current.send(JSON.stringify({
                    type: "SLIDE_CHANGE",
                    payload: {
                        sessionId,
                        slideIndex: newIndex,
                        move: "previous",
                        url: slides[newIndex]?.url
                    }
                }));
            }
            
            // Always update the slide index
            currentSlideIndexRef.current = newIndex;
            // Force display the new slide
            localStorage.setItem(`slideIndex-${sessionId}`,newIndex.toString());
            displaySlide(slides[newIndex]?.url || "");
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
    const checkAdmin = async () => {
        try {
            const auth_token = localStorage.getItem("auth_token");
            const response = await axios.get(`http://localhost:3001/api/v1/sessions/session/${sessionId}`, {
                headers: {
                    "Authorization": `Bearer ${auth_token}`
                }
            });
            const isUserAdmin = response.data.session.userId === user?.id;
            setIsAdmin(isUserAdmin);
            return isUserAdmin;  // Return the value directly
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    useEffect(() => {
        checkSessionEnded();
        checkAdmin();
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
        checkAdmin();
        if(user){
        axios.post(`http://localhost:3001/api/v1/sessions/token`,
            {
                roomName:sessionId,
                participantName: user?.username,
                sessionId: sessionId
            },
            {
                headers: {
                    "Authorization": `Bearer ${auth_token}`
                }
            })
            .then(res => {
                setToken(res.data.token);
                setIsHost(res.data.isHost);
            })
            .catch(err => console.error(err));
        }
        getSlides();
           
    }, [router,user]);

    useEffect(() => {
        const wsFunc = async () => {
            const token = localStorage.getItem("auth_token");
            roomWebSocketRef.current = new RoomWebSocket(`ws://localhost:8081/?token=${token}`);

            const isUserAdmin = await checkAdmin();
            
            roomWebSocketRef.current.setHandlers({
                onConnect: () => {
                    console.log("connected to websocket");
                    setIsConnected(true);
                    if (roomWebSocketRef.current && user) {
                        const subscribeMessage = {
                            type: isUserAdmin ? "SUBSCRIBE_ADMIN" : "SUBSCRIBE_USER",
                            payload: {
                                sessionId,
                                userId: user.id,
                                username: user.username,
                                profilePicture: user.profilePicture
                            }
                        };
                        console.log("Sending subscription message:", subscribeMessage); // Add debug log
                        roomWebSocketRef.current.send(JSON.stringify(subscribeMessage));
                    }
                },
                onDisconnect: () => {
                    console.log("disconnected from websocket");
                    setIsConnected(false);
                },
                onError: (error: any) => {
                    console.error(error);
                    setIsConnected(false);
                },
                onAdminJoined: (parsedMessage: any) => {
                    console.log("admin joined", parsedMessage);
                    
                },
                onUserJoined: (parsedMessage: any) => {
                    console.log("user joined", parsedMessage);
                },
                onStrokeReceived: (parsedMessage: any) => {
                    const canvas = drawingCanvasRef.current;
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;

                    const { x, y, lastX, lastY, color, width, isEraser } = parsedMessage.payload;
                    
                    // Convert normalized coordinates back to actual canvas coordinates
                    const actualX = x * canvas.width;
                    const actualY = y * canvas.height;
                    const actualLastX = lastX * canvas.width;
                    const actualLastY = lastY * canvas.height;
                    
                    ctx.beginPath();
                    ctx.moveTo(actualLastX, actualLastY);
                    ctx.lineTo(actualX, actualY);
                    
                    if (isEraser) {
                        ctx.globalCompositeOperation = 'destination-out';
                        ctx.lineWidth = width * 10;
                    } else {
                        ctx.globalCompositeOperation = 'source-over';
                        ctx.strokeStyle = color;
                        ctx.lineWidth = width;
                    }
                    
                    ctx.lineCap = "round";
                    ctx.stroke();
                },
                onClearReceived: () => {
                    const canvas = drawingCanvasRef.current;
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                },
                onChatMessageReceived: (parsedMessage: any) => {
                    // This will be handled in the ChatComponent
                    setChatMessages((prevMessages) => [...prevMessages, parsedMessage.payload]);
                },
                onSlideChangeReceived: (parsedMessage: any) => {
                    console.log("Received slide change:", parsedMessage);
                    const newIndex = parsedMessage.payload.slideIndex;
                    currentSlideIndexRef.current = newIndex;
                    localStorage.setItem(`slideIndex-${sessionId}`,newIndex.toString());
                    displaySlide(parsedMessage.payload.url);
                }
            });

            if (roomWebSocketRef.current && token) {
                roomWebSocketRef.current.connect(sessionId as string)
                .catch((error) => {
                    console.error(error);
                    setIsConnected(false);
                });
            }
        };
        
        if (user) {
            wsFunc();
        }

        return () => {
            roomWebSocketRef.current?.close();
        };
    }, [sessionId, user]);

    useEffect(() => {
        if (slides.length > 0) {
            setCurrentSlideIndex(currentSlideIndexRef.current);
            displaySlide(slides[currentSlideIndexRef.current]?.url || "");
        }
    }, [slides]);

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

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isAdmin) return;
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        
        // Convert to normalized coordinates (0-1)
        const normalizedX = (e.clientX - rect.left) / rect.width;
        const normalizedY = (e.clientY - rect.top) / rect.height;
        
        setIsDrawing(true);
        setLastX(normalizedX);
        setLastY(normalizedY);
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isAdmin) return;
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;
        if (!isDrawing) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        
        // Convert to normalized coordinates (0-1)
        const normalizedX = (e.clientX - rect.left) / rect.width;
        const normalizedY = (e.clientY - rect.top) / rect.height;

        // Draw locally using actual canvas coordinates
        ctx.beginPath();
        ctx.moveTo(lastX * canvas.width, lastY * canvas.height);
        ctx.lineTo(normalizedX * canvas.width, normalizedY * canvas.height);
        
        if (isEraser) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = strokeSize * 10;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeSize;
        }
        ctx.lineCap = "round";
        ctx.stroke();

        // Emit normalized coordinates
        if (roomWebSocketRef.current) {
            roomWebSocketRef.current.send(JSON.stringify({
                type: "STROKE",
                payload: {
                    sessionId,
                    lastX,
                    lastY,
                    x: normalizedX,
                    y: normalizedY,
                    color: strokeColor,
                    width: strokeSize,
                    isEraser
                }
            }));
        }

        setLastX(normalizedX);
        setLastY(normalizedY);
    };

    const stopDrawing = ()=>{
        setIsDrawing(false);
    }

    const clearCanvas = () => {
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Emit clear event
        if (roomWebSocketRef.current) {
            roomWebSocketRef.current.send(JSON.stringify({
                type: "CLEAR",
                payload: {
                    sessionId
                }
            }));
        }
    };

    return (
        <div suppressHydrationWarning className="flex flex-col h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex flex-col h-full">
                {/* Main Content Grid - Modified for responsiveness */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] h-screen relative">
                    {/* Left Side - Slides and Drawing */}
                    <div className="relative h-full">
                        {/* Host Controls - Adjusted positioning */}
                        {isHost && (
                            <div className="flex absolute top-4 left-4 z-10 gap-2 flex-wrap">
                                <Button 
                                    onClick={handleStartSession}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm"
                                >
                                    <PlayIcon size={14} className="mr-1" />
                                    {isSessionStarted ? "Started" : "Start"}
                                </Button>
                                <Button 
                                    onClick={() => setIsSessionEnded(true)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm"
                                >
                                    <ArrowLeftIcon size={14} className="mr-1" />
                                    End
                                </Button>
                            </div>
                        )}

                        {/* Slide Canvas Container - Adjusted for responsiveness */}
                        <div className="relative w-full h-[calc(100vh-280px)] lg:h-full bg-white rounded-lg shadow-lg overflow-hidden">
                            <canvas 
                                ref={slideCanvasRef}
                                className="absolute inset-0 w-full h-full"
                            />
                            <canvas 
                                ref={drawingCanvasRef}
                                className={`absolute inset-0 w-full h-full ${isAdmin ? 'cursor-crosshair' : 'cursor-default'}`}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseOut={stopDrawing}
                            />

                            {/* Drawing Controls - Adjusted positioning */}
                            {isHost && (
                                <div className="absolute top-1 right-2 lg:right-6 z-10 flex gap-2 flex-wrap justify-end">
                                    <Button 
                                        onClick={() => setIsDrawingControlsOpen(!isDrawingControlsOpen)}
                                        className="bg-black/90 hover:bg-white/95 text-white hover:text-black px-3 py-2 rounded-lg shadow-lg text-sm"
                                    >
                                        <PaintBucketIcon size={18} />
                                        <span className="hidden sm:inline ml-2">Drawing Tools</span>
                                    </Button>
                                    <Button
                                        onClick={() => {}}
                                        className="bg-black/90 hover:bg-white/95 text-white hover:text-black px-3 py-2 rounded-lg shadow-lg text-sm"
                                    >
                                        <PlusIcon size={18} />
                                        <span className="hidden sm:inline ml-2">Add Slide</span>
                                    </Button>
                                </div>
                            )}

                            {/* Slide Navigation - Adjusted positioning */}
                            {isHost && (
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                                    <Button
                                        onClick={() => previousSlide(false)}
                                        disabled={currentSlideIndexRef.current === 0}
                                        className="p-1 rounded-full disabled:opacity-50"
                                    >
                                        <ChevronLeftIcon size={18} />
                                    </Button>
                                    <span className="text-xs font-medium mx-2">
                                        {currentSlideIndexRef.current + 1} / {slides.length}
                                    </span>
                                    <Button
                                        onClick={() => nextSlide(false)}
                                        disabled={currentSlideIndexRef.current === slides.length - 1}
                                        className="p-1 rounded-full disabled:opacity-50"
                                    >
                                        <ChevronRightIcon size={18} />
                                    </Button>
                                </div>
                            )}

                            {/* Drawing Controls - Add this right after the Drawing Tools button */}
                            {isHost && isDrawingControlsOpen && (
                                <div className="absolute top-14 right-2 lg:right-6 z-20 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                                    <div className="flex flex-col gap-4">
                                        {/* Color Picker */}
                                        <div className="relative">
                                            <Button 
                                                onClick={() => setShowColorPicker(!showColorPicker)}
                                                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border"
                                                style={{ backgroundColor: strokeColor }}
                                            >
                                                <span className="text-white text-sm">Color</span>
                                            </Button>
                                            {showColorPicker && (
                                                <div className="absolute mt-2 z-30">
                                                    <HexColorPicker color={strokeColor} onChange={setStrokeColor} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Tool Buttons */}
                                        <div className="flex gap-2">
                                            <Button 
                                                onClick={() => setIsEraser(false)}
                                                className={`flex-1 px-3 py-2 rounded-lg ${!isEraser ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                            >
                                                <Pen size={18} />
                                            </Button>
                                            <Button 
                                                onClick={() => setIsEraser(true)}
                                                className={`flex-1 px-3 py-2 rounded-lg ${isEraser ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                            >
                                                <ClearIcon size={18} />
                                            </Button>
                                        </div>

                                        {/* Stroke Size */}
                                        <div className="flex items-center gap-2">
                                            <Minus size={14} />
                                            <input 
                                                type="range" 
                                                min="1" 
                                                max="10" 
                                                value={strokeSize}
                                                onChange={(e) => setStrokeSize(parseInt(e.target.value))}
                                                className="flex-1"
                                            />
                                            <Minus size={20} />
                                        </div>

                                        {/* Clear Canvas Button */}
                                        <Button 
                                            onClick={clearCanvas}
                                            className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
                                        >
                                            Clear Canvas
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Video and Chat */}
                    <div className="fixed lg:relative bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto h-[280px] lg:h-screen bg-white/95 border-t lg:border-l border-gray-200">
                        {/* Video Component */}
                        <div className="h-[280px] lg:h-1/4 p-2">
                            <div className="w-full h-full rounded-lg overflow-hidden bg-gray-900">
                                <VideoComponent token={token} isHost={isHost} sessionId={sessionId as string} />
                            </div>
                        </div>

                        {/* Chat Component with Drawer for Mobile */}
                        <div className="fixed lg:relative bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto">
                            {/* Chat Toggle Button - Only visible on mobile */}
                            <Button
                                onClick={() => setIsChatOpen(!isChatOpen)}
                                className="lg:hidden fixed bottom-3/4 right-1 z-50 rounded-full w-12 h-12 flex items-center justify-center bg-blue-500 text-white shadow-lg"
                            >
                                {isChatOpen ? <CloseIcon size={24} /> : <MessageCircle size={24} />}
                            </Button>

                            {/* Chat Drawer */}
                            <div className={`
                                fixed lg:relative bottom-0 left-0 right-0 
                                h-[60vh] lg:max-h-[calc(100vh-280px)]
                                bg-white shadow-lg lg:shadow-none
                                transform transition-transform duration-300 ease-in-out
                                ${isChatOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
                            `}>
                                <ChatComponent 
                                    currentUser={user || {id: "", username: "", profilePicture: ""}}
                                    onSendMessage={() => {}}
                                    //@ts-ignore
                                    messages={chatMessages}
                                    setChatMessages={setChatMessages}
                                    webSocket={roomWebSocketRef.current || undefined}
                                    sessionId={sessionId as string}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Session End Modals */}
            {(isSessionEnded || hasSessionEnded) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm 
                               flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-2xl 
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