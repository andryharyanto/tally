import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface UserSelectorProps {
  users: User[];
  currentUser: User | null;
  onSelectUser: (user: User) => void;
}

export function UserSelector({ users, currentUser, onSelectUser }: UserSelectorProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <UserIcon size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Current User:</span>
        </div>
        <select
          value={currentUser?.id || ''}
          onChange={(e) => {
            const user = users.find((u) => u.id === e.target.value);
            if (user) onSelectUser(user);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
