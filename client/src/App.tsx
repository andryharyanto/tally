import { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { TaskBoard } from './components/TaskBoard';
import { UserSelector } from './components/UserSelector';
import { useSocket } from './hooks/useSocket';
import { User } from './types';
import { api } from './services/api';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { socket, connected } = useSocket();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const fetchedUsers = await api.getUsers();
      setUsers(fetchedUsers);

      // Set first user as default
      if (fetchedUsers.length > 0 && !currentUser) {
        setCurrentUser(fetchedUsers[0]);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTasksUpdated = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen grid-bg">
        <div className="text-center glass p-8 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500 mx-auto mb-4 glow-cyan"></div>
          <p className="text-slate-300 mono text-sm">INITIALIZING TALLY...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen grid-bg">
      <UserSelector
        users={users}
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
      />

      <div className="h-full flex flex-col">
        {/* Top navigation bar */}
        <header className="glass-dark border-b border-cyan-500/20">
          <div className="max-w-[1800px] mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold gradient-text tracking-tight mono">
                  TALLY
                </h1>
                <div className="h-4 w-px bg-cyan-500/30"></div>
                <span className="text-xs text-slate-400 mono tracking-wider">
                  FINANCE INTELLIGENCE PLATFORM
                </span>
              </div>

              <div className="flex items-center gap-4">
                {connected && (
                  <div className="flex items-center gap-2 glass px-3 py-1 rounded">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full pulse-glow"></div>
                    <span className="text-xs text-cyan-400 mono">CONNECTED</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="max-w-[1800px] mx-auto h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChatInterface
              currentUser={currentUser}
              socket={socket}
              onTasksUpdated={handleTasksUpdated}
              selectedTaskId={selectedTaskId}
              onClearFilter={() => setSelectedTaskId(null)}
            />
            <TaskBoard
              socket={socket}
              refresh={refreshCounter}
              selectedTaskId={selectedTaskId}
              onSelectTask={setSelectedTaskId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
