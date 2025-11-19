import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Users,
  Calendar,
  Filter,
  X,
  Trash2,
  Grid3x3,
} from 'lucide-react';
import { Task, User, Workflow, TaskStatus } from '../types';
import { api } from '../services/api';
import { Socket } from 'socket.io-client';
import { format } from 'date-fns';

interface TaskBoardProps {
  socket: Socket | null;
  refresh: number;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
}

const statusConfig: Record<TaskStatus, { icon: React.ReactNode; color: string; label: string }> = {
  todo: { icon: <Circle size={14} />, color: 'text-slate-500', label: 'PENDING' },
  in_progress: { icon: <Clock size={14} />, color: 'text-cyan-400', label: 'ACTIVE' },
  blocked: { icon: <AlertCircle size={14} />, color: 'text-red-400', label: 'BLOCKED' },
  completed: { icon: <CheckCircle2 size={14} />, color: 'text-emerald-400', label: 'COMPLETE' },
  cancelled: { icon: <X size={14} />, color: 'text-slate-600', label: 'CANCELLED' },
};

const priorityColors = {
  low: 'border-l-slate-600',
  medium: 'border-l-amber-500',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-500',
};

export function TaskBoard({ socket, refresh, selectedTaskId, onSelectTask }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterWorkflow, setFilterWorkflow] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [refresh]);

  useEffect(() => {
    if (socket) {
      socket.on('task:updated', () => {
        loadData();
      });

      return () => {
        socket.off('task:updated');
      };
    }
  }, [socket]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, usersData, workflowsData] = await Promise.all([
        api.getTasks(),
        api.getUsers(),
        api.getWorkflows(),
      ]);

      setTasks(tasksData.tasks);
      setUsers(usersData);
      setWorkflows(workflowsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));

      if (socket) {
        socket.emit('task:update', { taskId, action: 'delete' });
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  const getAssigneeNames = (assigneeIds: string[]) => {
    return assigneeIds
      .map((id) => {
        const user = users.find((u) => u.id === id);
        return user ? user.name : 'Unknown';
      })
      .join(', ');
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterWorkflow !== 'all' && task.workflowType !== filterWorkflow) return false;
    return true;
  });

  const tasksByStatus = filteredTasks.reduce((acc, task) => {
    const status = task.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full glass rounded-lg border border-cyan-500/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-500 mx-auto mb-3 glow-cyan"></div>
          <p className="text-slate-400 mono text-sm">LOADING TASKS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full glass rounded-lg overflow-hidden border border-cyan-500/20">
      {/* Header */}
      <div className="glass-dark border-b border-cyan-500/20 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Grid3x3 size={16} className="text-cyan-400" />
            <h2 className="text-sm font-semibold text-cyan-400 mono tracking-wider">
              OPERATIONS BOARD
            </h2>
          </div>
          <div className="text-xs text-slate-500 mono">
            {filteredTasks.length} ACTIVE
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 items-center">
          <Filter size={14} className="text-slate-600" />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
            className="px-2 py-1 bg-slate-900/50 border border-slate-700/50 rounded text-xs mono text-slate-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">ALL_STATUS</option>
            <option value="todo">PENDING</option>
            <option value="in_progress">ACTIVE</option>
            <option value="blocked">BLOCKED</option>
            <option value="completed">COMPLETE</option>
          </select>

          <select
            value={filterWorkflow}
            onChange={(e) => setFilterWorkflow(e.target.value)}
            className="px-2 py-1 bg-slate-900/50 border border-slate-700/50 rounded text-xs mono text-slate-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">ALL_WORKFLOWS</option>
            {workflows.map((workflow) => (
              <option key={workflow.id} value={workflow.name}>
                {workflow.name.toUpperCase().replace(/\s+/g, '_')}
              </option>
            ))}
            <option value="general">GENERAL</option>
          </select>
        </div>
      </div>

      {/* Task Grid */}
      <div className="flex-1 overflow-y-auto p-4 data-grid">
        {filteredTasks.length === 0 ? (
          <div className="text-center text-slate-600 py-12 mono text-sm">
            // NO ACTIVE TASKS
            <div className="text-xs text-slate-700 mt-2">
              Start a conversation to create tasks
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {(['todo', 'in_progress', 'blocked', 'completed'] as TaskStatus[]).map((status) => {
              const statusTasks = tasksByStatus[status] || [];
              if (statusTasks.length === 0) return null;

              const config = statusConfig[status];

              return (
                <div key={status} className="space-y-2">
                  {/* Status header */}
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-700/30">
                    <div className={`${config.color}`}>{config.icon}</div>
                    <h3 className={`text-xs font-semibold mono tracking-wider ${config.color}`}>
                      {config.label}
                    </h3>
                    <div className="flex-1 h-px bg-slate-700/30"></div>
                    <span className="text-xs text-slate-600 mono">{statusTasks.length}</span>
                  </div>

                  {/* Tasks */}
                  <div className="grid grid-cols-1 gap-2">
                    {statusTasks.map((task) => {
                      const isSelected = selectedTaskId === task.id;
                      return (
                        <div
                          key={task.id}
                          onClick={() => onSelectTask(isSelected ? null : task.id)}
                          className={`glass-dark border-l-2 ${priorityColors[task.priority]} rounded p-3 transition-all-smooth group cursor-pointer ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                              : 'hover:border-cyan-500/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              {isSelected && (
                                <Filter size={12} className="text-cyan-400 flex-shrink-0" />
                              )}
                              <h4 className="font-medium text-slate-200 text-sm leading-tight">
                                {task.title}
                              </h4>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                              title="Delete task"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="text-xs px-2 py-0.5 bg-slate-800/50 text-slate-400 rounded mono border border-slate-700/50">
                            {task.priority.toUpperCase()}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded mono border border-cyan-500/30">
                            {task.workflowType.replace(/-/g, '_').toUpperCase()}
                          </span>
                          {task.tags && task.tags.length > 0 && task.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded mono border border-purple-500/30"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Details */}
                        <div className="space-y-1">
                          {task.assignees.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 mono">
                              <Users size={10} />
                              <span>{getAssigneeNames(task.assignees)}</span>
                            </div>
                          )}

                          {task.deadline && (
                            <div className="flex items-center gap-2 text-xs text-amber-500 mono">
                              <Calendar size={10} />
                              <span>{format(new Date(task.deadline), 'MMM d, yyyy')}</span>
                            </div>
                          )}

                          {task.blockedBy && (
                            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 mono">
                              BLOCKED: {task.blockedBy}
                            </div>
                          )}

                          {/* Metadata display */}
                          {task.metadata && Object.keys(task.metadata).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-700/50 space-y-1">
                              {task.metadata.invoiceNumber && (
                                <div className="flex items-center gap-2 text-xs text-slate-500 mono">
                                  <span className="text-slate-600">INV:</span>
                                  <span className="text-cyan-400">{task.metadata.invoiceNumber}</span>
                                </div>
                              )}
                              {task.metadata.customerName && (
                                <div className="flex items-center gap-2 text-xs text-slate-500 mono">
                                  <span className="text-slate-600">CLIENT:</span>
                                  <span>{task.metadata.customerName}</span>
                                </div>
                              )}
                              {task.metadata.amount && (
                                <div className="flex items-center gap-2 text-xs text-slate-500 mono">
                                  <span className="text-slate-600">AMOUNT:</span>
                                  <span className="text-emerald-400">
                                    ${task.metadata.amount.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
