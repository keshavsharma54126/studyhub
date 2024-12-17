import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from './scrollArea.js';
import { Input } from './input.js';
import { Button } from './button.js';
import { FiSend } from 'react-icons/fi';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isCurrentUser: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface ChatComponentProps {
  currentUser: string;
  onSendMessage: (message: string) => void;
  messages: Message[];
  className?: string;
  isLoading?: boolean;
  isTyping?: boolean;
}

export function ChatComponent({ currentUser, onSendMessage, messages, className, isLoading, isTyping }: ChatComponentProps) {
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

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
                  key={message.id}
                  className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isCurrentUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                    }`}
                  >
                    {!message.isCurrentUser && (
                      <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                        {message.sender}
                      </p>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between text-xs mt-1 opacity-70">
                      <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                      {message.isCurrentUser && message.status && (
                        <span className="ml-2">
                          {message.status === 'sending' && '⋯'}
                          {message.status === 'sent' && '✓'}
                          {message.status === 'delivered' && '✓✓'}
                          {message.status === 'read' && '✓✓'}
                        </span>
                      )}
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
