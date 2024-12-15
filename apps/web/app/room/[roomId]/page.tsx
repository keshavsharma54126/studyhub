"use client"
import { VideoComponent } from "@repo/ui/videoComponent";
import { ChatComponent } from "@repo/ui/chatComponent";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

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

    useEffect(() => {
        if (slides.length > 0) {
            displaySlide(slides[currentSlideIndex]?.url || "");
        }
    }, [currentSlideIndex, slides]);

    useEffect(() => {
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

    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full bg-slate-50">

            <div className="relative flex-1 h-[60vh] lg:h-screen p-2 sm:p-3 lg:p-4">

                <Button 
                    onClick={() => router.push('/')}
                    className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 bg-red-500 
                              hover:bg-red-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 
                              text-sm rounded-lg transition-colors duration-200 
                              flex items-center gap-1.5 shadow-md"
                >
                    <ArrowLeftIcon size={16} className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className=" xs:inline">End Session</span>
                </Button>

                <div className="relative w-full h-full">
                    <canvas 
                        ref={canvasRef}
                        id="canvas" 
                        className="w-full h-full rounded-lg shadow-lg bg-white 
                                  border border-gray-200"
                    ></canvas>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                                  flex items-center gap-4">
                        <Button
                            onClick={previousSlide}
                            disabled={currentSlideIndex === 0}
                            className="bg-white hover:bg-gray-100 text-gray-800 
                                     shadow-md rounded-full p-2"
                        >
                            <ChevronLeftIcon size={24} />
                        </Button>

                        <span className="bg-white px-3 py-1 rounded-full shadow-md">
                            {currentSlideIndex + 1} / {slides.length}
                        </span>

                        <Button
                            onClick={nextSlide}
                            disabled={currentSlideIndex === slides.length - 1}
                            className="bg-white hover:bg-gray-100 text-gray-800 
                                     shadow-md rounded-full p-2"
                        >
                            <ChevronRightIcon size={24} />
                        </Button>
                    </div>
                </div>
            </div>


            <div className="flex flex-col w-full lg:w-80 xl:w-96 2xl:w-[420px] 
                          bg-white border-t lg:border-l border-gray-200 shadow-lg">

                <div className="h-[30vh] sm:h-[35vh] lg:h-[40vh] p-2 sm:p-3">
                    <div className="w-full h-full rounded-lg overflow-hidden 
                                  shadow-md bg-gray-50">
                        <VideoComponent token={token} />
                    </div>
                </div>


                <div className="flex-1 min-h-[40vh] lg:min-h-[60vh] p-2 sm:p-3">
                    <ChatComponent 
                        currentUser="user" 
                        onSendMessage={() => {}} 
                        messages={[]}
                        className="h-full rounded-lg shadow-sm"
                    />
                </div>
            </div>
        </div>
    );
}