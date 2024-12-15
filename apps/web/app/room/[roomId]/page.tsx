"use client"
import { VideoComponent } from "@repo/ui/videoComponent";
import { ChatComponent } from "@repo/ui/chatComponent";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { ArrowLeftIcon } from "lucide-react";

export default function RoomPage() {
    const router = useRouter();
    const [token, setToken] = useState<string>("");

    useEffect(() => {
        const auth_token = localStorage.getItem("auth_token");
        if (!auth_token) {
            router.push("/signin");
            return;
        }

        axios.post(`http://localhost:3001/api/v1/session/token`,
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

    
                <canvas 
                    id="canvas" 
                    className="w-full h-full rounded-lg shadow-lg bg-white 
                              border border-gray-200"
                ></canvas>
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