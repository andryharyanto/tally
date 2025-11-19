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
} from 'lucide-react';
import { Task, User, Workflow, TaskStatus } from '../types';
import { api } from '../services/api';
import { Socket } from 'socket.io-client';
import { format } from 'date-fns';

interface TaskBoardProps {
  socket: Socket | null;
  refresh: number;
}

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  todo: <Circle size={18} className="text-gray-400" />,
  in_progress: <Clock size={18} className="text-blue-500" />,
  blocked: <AlertCircle size={18} className="text-red-500" />,
  completed: <CheckCircle2 size={18} className="text-green-500" />,
  cancelled: <X size={18} className="text-gray-400" />,
};

const statusColors: Record<TaskStatus, string> = {
  todo: 'border-l-gray-400',
  in_progress: 'border-l-blue-500',
  blocked: 'border-l-red-500',
  completed: 'border-l-green-500',
  cancelled: 'border-l-gray-400',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export function TaskBoard({ socket, refresh }: TaskBoardProps) {
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

  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const status = task.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-600">
        <h2 className="text-xl font-bold text-white">Shared Task Board</h2>
        <p className="text-sm text-purple-100">Everyone's work in one place</p>
      </div>

      <div className="p-4 border-b border-gray-200 flex gap-4 items-center bg-gray-50">
        <Filter size={18} className="text-gray-600" />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="blocked">Blocked</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filterWorkflow}
          onChange={(e) => setFilterWorkflow(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Workflows</option>
          {workflows.map((workflow) => (
            <option key={workflow.id} value={workflow.name}>
              {workflow.name}
            </option>
          ))}
          <option value="general">General</option>
        </select>

        <div className="ml-auto text-sm text-gray-600">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No tasks yet. Start a conversation to create tasks!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(['todo', 'in_progress', 'blocked', 'completed'] as TaskStatus[]).map((status) => {
              const statusTasks = groupedTasks[status] || [];
              if (statusTasks.length === 0 && filterStatus !== 'all') return null;

              return (
                <div key={status} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    {statusIcons[status]}
                    <h3 className="font-semibold text-gray-700 capitalize">
                      {status.replace('_', ' ')} ({statusTasks.length})
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {statusTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`bg-white rounded-lg p-3 border-l-4 ${statusColors[task.status]} shadow-sm hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-gray-900 text-sm flex-1">
                            {task.title}
                          </h4>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete task"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {task.description && (
                          <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              priorityColors[task.priority]
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                            {task.workflowType}
                          </span>
                        </div>

                        {task.assignees.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                            <Users size={12} />
                            <span>{getAssigneeNames(task.assignees)}</span>
                          </div>
                        )}

                        {task.deadline && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                            <Calendar size={12} />
                            <span>Due: {format(new Date(task.deadline), 'MMM d, yyyy')}</span>
                          </div>
                        )}

                        {task.blockedBy && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            <strong>Blocked:</strong> {task.blockedBy}
                          </div>
                        )}

                        {task.metadata && Object.keys(task.metadata).length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            {task.metadata.invoiceNumber && (
                              <div>Invoice: {task.metadata.invoiceNumber}</div>
                            )}
                            {task.metadata.customerName && (
                              <div>Customer: {task.metadata.customerName}</div>
                            )}
                            {task.metadata.amount && (
                              <div>Amount: ${task.metadata.amount.toFixed(2)}</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
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
