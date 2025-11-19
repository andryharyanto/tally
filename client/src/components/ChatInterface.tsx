import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Message, User } from '../types';
import { api } from '../services/api';
import { Socket } from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';

interface ChatInterfaceProps {
  currentUser: User;
  socket: Socket | null;
  onTasksUpdated: () => void;
}

export function ChatInterface({ currentUser, socket, onTasksUpdated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message:new', (data) => {
        loadMessages();
      });

      return () => {
        socket.off('message:new');
      };
    }
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { messages: fetchedMessages } = await api.getMessages(50, 0);
      setMessages(fetchedMessages.reverse());
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);

    try {
      const result = await api.sendMessage(currentUser.id, inputValue);

      // Add message to local state
      setMessages([...messages, result.message]);

      // Notify other components about task updates
      onTasksUpdated();

      // Broadcast to other clients
      if (socket) {
        socket.emit('message:send', {
          userId: currentUser.id,
          content: inputValue,
        });
      }

      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
        <h2 className="text-xl font-bold text-white">Team Chat</h2>
        <p className="text-sm text-blue-100">Describe work in your own words</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.userId === currentUser.id;

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isCurrentUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{message.userName}</span>
                  <span className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.parsedData && message.relatedTaskIds && message.relatedTaskIds.length > 0 && (
                  <div className={`mt-2 text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-600'}`}>
                    <span className="font-medium">
                      {message.parsedData.action === 'create' && '✓ Created task'}
                      {message.parsedData.action === 'update' && '✓ Updated task'}
                      {message.parsedData.action === 'complete' && '✓ Completed task'}
                      {message.parsedData.action === 'block' && '⚠ Task blocked'}
                      {message.parsedData.action === 'handoff' && '→ Handed off task'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (e.g., 'Generated invoices for Acme Corp')"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !inputValue.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Try: "Generated invoice for TechCorp" or "Waiting on payment for INV-2847"
        </p>
      </div>
    </div>
  );
}
