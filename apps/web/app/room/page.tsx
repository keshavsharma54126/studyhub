"use client"

import VideoComponent from "@repo/ui/videoComponent";
import { ChatComponent } from "@repo/ui/chatComponent";

export default function RoomPage() {
    return (
        <div className="flex flex-row max-h-screen w-full bg-gray-50">
            {/* Main Canvas Area */}
            <div className="flex flex-row items-center justify-center h-screen w-3/4 p-4">
                <canvas id="canvas" className="w-full h-full rounded-lg shadow-lg bg-white"></canvas>
            </div>
            
            {/* Sidebar with Video and Chat */}
            <div className="flex flex-col h-screen w-1/4 bg-white shadow-lg border-l border-gray-200">
                {/* Video Component Container */}
                <div className="flex items-center justify-center h-[30vh] w-full p-3 border-b border-gray-200">
                    <div className="w-full h-full rounded-lg overflow-hidden shadow-sm">
                        <VideoComponent />
                    </div>
                </div>
                
                {/* Chat Component Container */}
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