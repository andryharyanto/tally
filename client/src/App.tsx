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
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Tally...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100">
      <UserSelector
        users={users}
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
      />

      <div className="h-full flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tally
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Your finance team's conversational program manager
            </p>
            {connected && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Connected</span>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-4">
          <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChatInterface
              currentUser={currentUser}
              socket={socket}
              onTasksUpdated={handleTasksUpdated}
            />
            <TaskBoard socket={socket} refresh={refreshCounter} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
