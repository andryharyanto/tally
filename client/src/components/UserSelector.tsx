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
    <div className="fixed top-6 right-6 z-50">
      <div className="glass rounded border border-cyan-500/30 p-3 min-w-[200px]">
        <div className="flex items-center gap-2 mb-2">
          <UserIcon size={14} className="text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-400 mono tracking-wider">
            OPERATOR
          </span>
        </div>
        <select
          value={currentUser?.id || ''}
          onChange={(e) => {
            const user = users.find((u) => u.id === e.target.value);
            if (user) onSelectUser(user);
          }}
          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded text-sm text-slate-200 mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id} className="bg-slate-900">
              {user.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
