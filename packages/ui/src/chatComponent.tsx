import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from './scrollArea.js';
import { Input } from './input.js';
import { Button } from './button.js';
import { FiSend } from 'react-icons/fi';
import { RoomWebSocket } from '../../../apps/web/app/webSocket.js';

interface Message {
  userId: string;
  username: string;
  profilePicture: string;
  message: string;  
  timestamp: Date;
}

interface User {
  id: string;
  username: string;
  profilePicture: string;
}

interface ChatComponentProps {
  currentUser: User;
  onSendMessage: (message: string) => void;
  messages: Message[];
  className?: string;
  isLoading?: boolean;
  isTyping?: boolean;
  webSocket?: RoomWebSocket;
  sessionId?: string;
  setChatMessages: (messages: Message[]) => void;
}

export function ChatComponent({ currentUser, onSendMessage, messages, className, isLoading, isTyping, webSocket, sessionId, setChatMessages }: ChatComponentProps) {
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const roomWebSocketRef = useRef<RoomWebSocket>(null);

  const scrollToBottom = (smooth = true) => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages,webSocket]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      if (webSocket) {
        try {
          const newMessageObj:Message = {
            message: newMessage,
            userId: currentUser.id,
            username: currentUser.username,
            profilePicture: currentUser.profilePicture,
            timestamp: new Date()
          };
          setChatMessages((prevMessages:Message[]) => [...prevMessages, newMessageObj]);
          webSocket.send(JSON.stringify({
            type: "CHAT_MESSAGE",
            sessionId: sessionId,
            payload: {
              message: newMessage,
              userId: currentUser.id,
              username: currentUser.username,
              profilePicture: currentUser.profilePicture,
              timestamp: new Date()
            }
          }));
        
          console.log('Message sent successfully');
        } catch (error) {
          console.error('Error sending message:', error);
        }
      } else {
        console.error('WebSocket is not connected');
      }
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  useEffect(() => {
    roomWebSocketRef?.current?.setHandlers({
      onChatMessageReceived: (message) => {
        setChatMessages((prevMessages:Message[]) => [...prevMessages, message.payload]);
      },
    });
  }, []);

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm ${className}`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Chat</h3>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-pulse">Loading messages...</div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.userId}
                  className={`flex ${message.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.userId === currentUser.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                    }`}
                  >
                    {message.userId !== currentUser.id && (
                      <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                        {message.username}
                      </p>
                    )}
                    <p className="text-sm">{message.message}</p>
                    <div className="flex items-center justify-between text-xs mt-1 opacity-70">
                      <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button 
            type="submit" 
            className='bg-blue-500 hover:bg-blue-600 text-white transition-colors' 
            disabled={!newMessage.trim()}
          >
            <FiSend className="w-4 h-4 text-white" />
          </Button>
        </div>
      </form>
    </div>
  );
}
