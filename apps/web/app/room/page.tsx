"use client"
import { VideoComponent } from "@repo/ui/videoComponent";
import { ChatComponent } from "@repo/ui/chatComponent";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RoomPage() {
    const router = useRouter();
    const [token, setToken] = useState<string>("");

    useEffect(() => {
        // Check authentication
        const auth_token = localStorage.getItem("auth_token");
        if (!auth_token) {
            router.push("/signin");
            return;
        }

        // Get token
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
        <div className="flex flex-row max-h-screen w-full bg-gray-50">
            <div className="flex flex-row items-center justify-center h-screen w-3/4 p-4">
                <canvas id="canvas" className="w-full h-full rounded-lg shadow-lg bg-white"></canvas>
            </div>
            <div className="flex flex-col h-screen w-1/4 bg-white shadow-lg border-l border-gray-200">
                <div className="flex items-center justify-center h-[30vh] w-full p-3 border-b border-gray-200">
                    <div className="w-full h-full rounded-lg overflow-hidden shadow-sm">
                        <VideoComponent token={token} />
                    </div>
                </div>
                <div className="flex flex-col h-[70vh] w-full p-3">
                    <ChatComponent 
                        currentUser="user" 
                        onSendMessage={() => {}} 
                        messages={[]}
                    />
                </div>
            </div>
        </div>
    )
}