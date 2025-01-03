import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { Button } from './button';
import { FiSend, FiSmile } from 'react-icons/fi';
import { RoomWebSocket } from '../../../apps/web/app/webSocket';
import data from "@emoji-mart/data"
import EmojiPicker from "@emoji-mart/react"
import { cn } from '../utils/cn';
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const roomWebSocketRef = useRef<RoomWebSocket>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };
  const addEmoji = (emoji: any) => {
    setNewMessage(newMessage + emoji.native);
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          //@ts-ignore
          setChatMessages((prevMessages:Message[]) => [...prevMessages, newMessageObj]);
          webSocket.send(JSON.stringify({
            type: "CHAT_MESSAGE",
            sessionId: sessionId,
            payload: {
              message: newMessage,
              userId: currentUser.id,
              username: currentUser.username,
              profilePicture: currentUser.profilePicture,
              timestamp: new Date(),
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
        //@ts-ignore
        setChatMessages((prevMessages:Message[]) => [...prevMessages, message.payload]);
      },
    });
  }, []);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      //@ts-ignore
      if (isEmojiPickerOpen && !e.target?.closest('.emoji-picker-container')) {
        setIsEmojiPickerOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isEmojiPickerOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className={cn("flex flex-col h-full bg-gray-100 dark:bg-gray-800", className)}>
      <div className="flex-none h-[40px] p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Chat</h3>
      </div>

      <ScrollAreaPrimitive.Root className="flex-1 bg-gray-100 dark:bg-gray-800">
        <ScrollAreaPrimitive.Viewport ref={chatContainerRef} className="h-full w-full">
          <div className="p-4 space-y-2">
            {messages.map((message, index) => (
              <div
                key={`${message.userId}-${index}`}
                className={`flex ${
                  message.userId === currentUser.id ? 'justify-end' : 'justify-start'
                } gap-2`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-2 text-sm ${
                    message.userId === currentUser.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                  }`}
                >
                  {message.userId !== currentUser.id && (
                    <p className="text-md font-medium mb-1 text-gray-600 dark:text-gray-400">
                      {message.username}
                    </p>
                  )}
                  <p className="text-sm break-words">{message.message}</p>
                  <div className="flex items-center justify-end text-xs mt-1 opacity-70">
                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollAreaPrimitive.Viewport>
        <ScrollAreaPrimitive.Scrollbar orientation="vertical">
          <ScrollAreaPrimitive.Thumb />
        </ScrollAreaPrimitive.Scrollbar>
      </ScrollAreaPrimitive.Root>

      <div className="flex-none p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
        <div  className="flex gap-2">
          <Input
            type="text"
            placeholder="Message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={() => setIsEmojiPickerOpen(false)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100`"
          />
          <Button onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}>
            <FiSmile />
          </Button>
          {isEmojiPickerOpen && (
          <div className="absolute bottom-2 right-0 .emoji-picker-container">
            {/* @ts-ignore */}
           <EmojiPicker 
              className="absolute bottom-2 right-0 z-50 "
              data={data} 
              onEmojiSelect={addEmoji}
           />
          </div>
          )}
          <Button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white p-2" 
            disabled={!newMessage.trim()}
            onClick={handleSendMessage}
          >
            <FiSend className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
