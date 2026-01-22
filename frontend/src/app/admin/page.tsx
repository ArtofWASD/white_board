'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { User } from '../../types';

export default function AdminDashboard() {
  const { user, isAuthenticated, token, isLoading } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!isLoading) {
       if (!isAuthenticated) {
          router.push('/login');
       } else if (user && user.role !== 'SUPER_ADMIN') {
          router.push('/dashboard');
       }
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchUsers = async () => {
        if (!token) return;
        try {
            const res = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingUsers(false);
        }
    };
    if (user?.role === 'SUPER_ADMIN') {
        fetchUsers();
    } else if (!isLoading && !user) {
        setLoadingUsers(false);
    }
  }, [user, token, isLoading]);

  const handleRoleChange = async (userId: string, newRole: string) => {
      // Optimistic update
      const oldUsers = [...users];
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      
      try {
          const res = await fetch(`/api/users/${userId}/role`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ role: newRole })
          });
          if (!res.ok) {
              setUsers(oldUsers);
              alert('Failed to update role');
          }
      } catch (e) {
          setUsers(oldUsers);
          alert('Error updating role');
      }
  };

  if (isLoading || loadingUsers) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
  }

  if (!user || user.role !== 'SUPER_ADMIN') return null;

  return (
      <div className="min-h-screen bg-gray-50 p-8">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                    Back to Dashboard
                </button>
            </div>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Role</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Change Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-gray-900 whitespace-no-wrap font-medium">{u.name} {u.lastName}</p>
                                            <p className="text-gray-500 text-xs">{u.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{u.email}</p>
                                </td>
                                 <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight text-white rounded-full text-xs
                                        ${u.role === 'SUPER_ADMIN' ? 'bg-red-500' : 
                                          u.role === 'ORGANIZATION_ADMIN' ? 'bg-purple-500' : 
                                          u.role === 'TRAINER' ? 'bg-blue-500' : 'bg-green-500'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <select 
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        className="block w-full bg-white border border-gray-300 hover:border-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="ATHLETE">ATHLETE</option>
                                        <option value="TRAINER">TRAINER</option>
                                        <option value="ORGANIZATION_ADMIN">ORG_ADMIN</option>
                                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="bg-white p-8 text-center text-gray-500">
                        No users found
                    </div>
                )}
              </div>
            </div>
          </div>
      </div>
  );
}
