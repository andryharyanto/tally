import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, Terminal, X, Filter } from 'lucide-react';
import { Message, User, Task } from '../types';
import { api } from '../services/api';
import { Socket } from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';

interface ChatInterfaceProps {
  currentUser: User;
  socket: Socket | null;
  onTasksUpdated: () => void;
  selectedTaskId: string | null;
  onClearFilter: () => void;
}

export function ChatInterface({ currentUser, socket, onTasksUpdated, selectedTaskId, onClearFilter }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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

  // Load selected task details
  useEffect(() => {
    if (selectedTaskId) {
      api.getTaskById(selectedTaskId).then(task => {
        setSelectedTask(task);
      }).catch(error => {
        console.error('Failed to load selected task:', error);
        setSelectedTask(null);
      });
    } else {
      setSelectedTask(null);
    }
  }, [selectedTaskId]);

  // Filter messages based on selected task
  const filteredMessages = useMemo(() => {
    if (!selectedTaskId) {
      return messages;
    }
    return messages.filter(msg =>
      msg.relatedTaskIds && msg.relatedTaskIds.includes(selectedTaskId)
    );
  }, [messages, selectedTaskId]);

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
    <div className="flex flex-col h-full glass rounded-lg overflow-hidden border border-cyan-500/20">
      {/* Header */}
      <div className="glass-dark border-b border-cyan-500/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-cyan-400" />
          <h2 className="text-sm font-semibold text-cyan-400 mono tracking-wider">
            COMMAND INTERFACE
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1 mono">
          Natural language task management
        </p>
      </div>

      {/* Magic Filter Banner */}
      {selectedTask && (
        <div className="glass-dark border-b border-cyan-500/30 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-cyan-400" />
              <span className="text-xs text-cyan-400 mono">FILTERING:</span>
              <span className="text-xs text-slate-300 mono">{selectedTask.title}</span>
              <span className="text-xs text-slate-600 mono">
                ({filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''})
              </span>
            </div>
            <button
              onClick={onClearFilter}
              className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 rounded transition-all-smooth"
              title="Clear filter"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 data-grid">
        {filteredMessages.length === 0 && selectedTask && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="glass p-6 rounded-lg max-w-md">
              <Filter size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 mono mb-2">No messages found for this task</p>
              <p className="text-xs text-slate-600 mono">
                Try sending a message or <button onClick={onClearFilter} className="text-cyan-400 hover:underline">clear the filter</button>
              </p>
            </div>
          </div>
        )}
        {filteredMessages.map((message) => {
          const isCurrentUser = message.userId === currentUser.id;
          const isTaskWorthy = (message.parsedData as any)?.isTaskWorthy;
          const confidence = (message.parsedData as any)?.confidence;

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] transition-all-smooth ${
                  isCurrentUser
                    ? 'glass-dark border border-cyan-500/30'
                    : 'glass border border-slate-700/30'
                } rounded-lg p-3`}
              >
                {/* Message header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold mono ${
                    isCurrentUser ? 'text-cyan-400' : 'text-slate-400'
                  }`}>
                    {isCurrentUser ? '>' : '•'} {message.userName}
                  </span>
                  <span className="text-xs text-slate-600 mono">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </span>
                </div>

                {/* Message content */}
                <p className="text-sm text-slate-200 leading-relaxed">
                  {message.content}
                </p>

                {/* Parse result indicators */}
                {message.parsedData && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    {/* Non-task indicators */}
                    {isTaskWorthy === false && (
                      <div className="flex items-center gap-2 text-xs mono">
                        {(message.parsedData as any).messageType === 'question' && (
                          <>
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                            <span className="text-amber-400">QUESTION</span>
                          </>
                        )}
                        {(message.parsedData as any).messageType === 'comment' && (
                          <>
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            <span className="text-blue-400">COMMENT</span>
                          </>
                        )}
                        {(message.parsedData as any).messageType === 'observation' && (
                          <>
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                            <span className="text-purple-400">OBSERVATION</span>
                          </>
                        )}
                        {(message.parsedData as any).messageType === 'conversation' && (
                          <>
                            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
                            <span className="text-slate-500">CONVERSATION</span>
                          </>
                        )}
                        {message.relatedTaskIds && message.relatedTaskIds.length > 0 && (
                          <span className="text-xs text-slate-600 mono">
                            → Linked to task
                          </span>
                        )}
                      </div>
                    )}

                    {/* Task created/updated indicator */}
                    {message.relatedTaskIds && message.relatedTaskIds.length > 0 && isTaskWorthy && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs mono">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full glow-cyan"></div>
                          <span className="text-cyan-400">
                            {message.parsedData.action === 'create' && 'TASK_CREATED'}
                            {message.parsedData.action === 'update' && 'TASK_UPDATED'}
                            {message.parsedData.action === 'complete' && 'TASK_COMPLETED'}
                            {message.parsedData.action === 'block' && 'TASK_BLOCKED'}
                            {message.parsedData.action === 'handoff' && 'TASK_TRANSFERRED'}
                            {message.parsedData.action === 'comment' && 'COMMENT_ADDED'}
                          </span>
                          {message.relatedTaskIds.length > 1 && (
                            <span className="text-slate-500">
                              [{message.relatedTaskIds.length}]
                            </span>
                          )}
                        </div>

                        {/* Confidence score */}
                        {confidence !== undefined && isTaskWorthy && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 mono">
                            <span>CONFIDENCE:</span>
                            <div className="flex-1 max-w-[100px] h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                style={{ width: `${confidence * 100}%` }}
                              ></div>
                            </div>
                            <span>{Math.round(confidence * 100)}%</span>
                          </div>
                        )}

                        {/* Suggestions */}
                        {(message.parsedData as any).suggestions && (message.parsedData as any).suggestions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="text-xs text-amber-400 mono">SUGGESTIONS:</div>
                            {(message.parsedData as any).suggestions.map((suggestion: string, idx: number) => (
                              <div key={idx} className="text-xs text-slate-400 pl-3 mono">
                                → {suggestion}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="glass-dark border-t border-cyan-500/20 p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 mono text-sm">
              &gt;
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter command or describe work..."
              className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded text-slate-200 text-sm mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-600 transition-all-smooth"
              disabled={loading}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={loading || !inputValue.trim()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all-smooth glow-blue mono text-sm font-semibold"
          >
            <Send size={16} />
            SEND
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2 mono">
          // Try: "Generated invoice for TechCorp" or "Waiting on payment for INV-2847"
        </p>
      </div>
    </div>
  );
}
