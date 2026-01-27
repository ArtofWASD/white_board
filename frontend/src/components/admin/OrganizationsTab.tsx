import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/store/useAuthStore';

export const OrganizationsTab: React.FC = () => {
  const { token } = useAuthStore();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);

  useEffect(() => {
    const fetchOrganizations = async () => {
        setLoadingOrganizations(true);
        try {
            const res = await fetch('/api/organization/admin/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setOrganizations(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingOrganizations(false);
        }
      };
      
    if (token) {
        fetchOrganizations();
    }
  }, [token]);

  const handleToggleOrganizationBlock = async (org: any) => {
    if (!confirm(`Вы уверены, что хотите ${org.isBlocked ? 'разблокировать' : 'заблокировать'} организацию ${org.name}?`)) return;

    const newStatus = !org.isBlocked;
    const oldOrgs = [...organizations];
    setOrganizations(organizations.map(o => o.id === org.id ? { ...o, isBlocked: newStatus } : o));

    try {
        const res = await fetch(`/api/organization/${org.id}/block`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isBlocked: newStatus })
        });

        if (!res.ok) {
            setOrganizations(oldOrgs);
            alert('Не удалось изменить статус блокировки');
        }
    } catch (e) {
         setOrganizations(oldOrgs);
         alert('Ошибка запроса');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col">
       <div className="p-4 border-b border-gray-200">
            {/* Potential Filters for Organizations could go here */}
       </div>
       
       {loadingOrganizations ? (
           <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
       ) : (
           <>
               {/* Mobile View (Cards) */}
               <div className="md:hidden space-y-4 p-4">
                   {organizations.map(org => (
                       <div key={org.id} className={`bg-white rounded-lg shadow p-4 ${org.isBlocked ? 'opacity-75' : ''} border border-gray-100`}>
                           <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                                        {org.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-gray-900 font-medium">{org.name}</p>
                                        <p className="text-xs text-gray-500">Создано: {new Date(org.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {org.isBlocked && <span className="text-xs text-red-500 font-bold bg-red-100 px-2 py-1 rounded">Блок</span>}
                           </div>
                           <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                               <div>Пользователей: <span className="font-semibold">{org.userCount}</span></div>
                               <div>Команд: <span className="font-semibold">{org.teamCount}</span></div>
                           </div>
                           <div className="flex justify-end pt-3 border-t border-gray-100">
                               <button onClick={() => handleToggleOrganizationBlock(org)} className={`${org.isBlocked ? 'text-green-600' : 'text-orange-500'} hover:opacity-80 text-sm font-medium`}>
                                   {org.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                               </button>
                           </div>
                       </div>
                   ))}
               </div>

               {/* Desktop View (Table) */}
               <div className="hidden md:block overflow-x-auto">
                   <table className="min-w-full leading-normal">
                       <thead>
                           <tr>
                               <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Организация</th>
                               <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Дата создания</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Статус</th>
                               <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Действия</th>
                           </tr>
                       </thead>
                       <tbody>
                           {organizations.map(org => (
                               <tr key={org.id} className={org.isBlocked ? 'bg-gray-50 opacity-75' : ''}>
                                   <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                       <div className="flex items-center">
                                           <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                                                {org.name.charAt(0).toUpperCase()}
                                           </div>
                                           <div className="ml-3">
                                               <p className="text-gray-900 whitespace-no-wrap font-medium">{org.name}</p>
                                           </div>
                                       </div>
                                   </td>
                                   <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                       {new Date(org.createdAt).toLocaleDateString()}
                                   </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                       <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${org.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                           {org.isBlocked ? 'Заблокирована' : 'Активна'}
                                       </span>
                                   </td>
                                   <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                       <button 
                                            onClick={() => handleToggleOrganizationBlock(org)}
                                            className={`${org.isBlocked ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'} font-medium`}
                                       >
                                           {org.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                                       </button>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
                    {organizations.length === 0 && (
                        <div className="bg-white p-8 text-center text-gray-500">
                            Организации не найдены
                        </div>
                    )}
               </div>
           </>
       )}
    </div>
  );
};
