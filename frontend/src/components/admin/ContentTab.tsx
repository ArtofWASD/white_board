import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { Modal } from '../ui/Modal';

export const ContentTab: React.FC = () => {
  const { token } = useAuthStore();
  
  const [activeContentTab, setActiveContentTab] = useState<'wods' | 'exercises' | 'news'>('wods');
  const [wods, setWods] = useState<any[]>([]);
  const [globalExercises, setGlobalExercises] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [contentModalType, setContentModalType] = useState<'wod' | 'exercise' | 'news'>('wod');
  const [editingItem, setEditingItem] = useState<any>(null); // If null, it's create mode
  const [newWod, setNewWod] = useState({ name: '', description: '', type: 'CLASSIC', isGlobal: true });
  const [newExercise, setNewExercise] = useState({ name: '', description: '', videoUrl: '' });
  const [newNews, setNewNews] = useState({ title: '', content: '', excerpt: '', imageUrl: '' });

  useEffect(() => {
     fetchContent();
  }, [token]);

  const fetchContent = async () => {
      setLoadingContent(true);
      try {
          const [wodsRes, exercisesRes, newsRes] = await Promise.all([
              fetch('/api/admin/wods', { headers: { 'Authorization': `Bearer ${token}` } }),
              fetch('/api/admin/exercises', { headers: { 'Authorization': `Bearer ${token}` } }),
              fetch('/api/news', { headers: { 'Authorization': `Bearer ${token}` } })
          ]);

          if (wodsRes.ok) setWods(await wodsRes.json());
          if (exercisesRes.ok) setGlobalExercises(await exercisesRes.json());
          if (newsRes.ok) setNews(await newsRes.json());
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingContent(false);
      }
  };

  const handleCreateContent = async () => {
      if (contentModalType === 'wod') {
          try {
              const res = await fetch('/api/admin/wods', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify(newWod)
              });
              if (res.ok) {
                  fetchContent();
                  setIsContentModalOpen(false);
                  setNewWod({ name: '', description: '', type: 'CLASSIC', isGlobal: true });
              } else {
                  alert('Ошибка создания WOD');
              }
          } catch (e) { alert('Ошибка запроса'); }
      } else if (contentModalType === 'news') {
          try {
              const res = await fetch('/api/news', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify(newNews)
              });
              if (res.ok) {
                  fetchContent();
                  setIsContentModalOpen(false);
                  setNewNews({ title: '', content: '', excerpt: '', imageUrl: '' });
              } else {
                  alert('Ошибка создания новости');
              }
          } catch (e) { alert('Ошибка запроса'); }
      } else {
          try {
              const res = await fetch('/api/admin/exercises', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify(newExercise)
              });
              if (res.ok) {
                  fetchContent();
                  setIsContentModalOpen(false);
                  setNewExercise({ name: '', description: '', videoUrl: '' });
              } else {
                  alert('Ошибка создания упражнения');
              }
          } catch (e) { alert('Ошибка запроса'); }
      }
  };

  const handleUpdateContent = async () => {
      if (!editingItem) return;
      if (contentModalType === 'wod') {
          try {
              const res = await fetch(`/api/admin/wods/${editingItem.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify(newWod)
              });
              if (res.ok) {
                  fetchContent();
                  setIsContentModalOpen(false);
                  setEditingItem(null);
                  setNewWod({ name: '', description: '', type: 'CLASSIC', isGlobal: true });
              } else {
                  alert('Ошибка обновления WOD');
              }
          } catch (e) { alert('Ошибка запроса'); }
      } else if (contentModalType === 'news') {
          try {
              const res = await fetch(`/api/news/${editingItem.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify(newNews)
              });
              if (res.ok) {
                  fetchContent();
                  setIsContentModalOpen(false);
                  setEditingItem(null);
                  setNewNews({ title: '', content: '', excerpt: '', imageUrl: '' });
              } else {
                  alert('Ошибка обновления новости');
              }
          } catch (e) { alert('Ошибка запроса'); }
      } else {
            try {
                const res = await fetch(`/api/admin/exercises/${editingItem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(newExercise)
                });
                if (res.ok) {
                    fetchContent();
                    setIsContentModalOpen(false);
                    setEditingItem(null);
                    setNewExercise({ name: '', description: '', videoUrl: '' });
                } else {
                    alert('Ошибка обновления упражнения');
                }
            } catch (e) { alert('Ошибка запроса'); }
      }
  };

  const handleDeleteContent = async (item: any, type: 'wod' | 'exercise' | 'news') => {
      if (!confirm('Вы уверены, что хотите удалить этот элемент?')) return;
      try {
          let url = '';
          if (type === 'wod') url = `/api/admin/wods/${item.id}`;
          else if (type === 'exercise') url = `/api/admin/exercises/${item.id}`;
          else url = `/api/news/${item.id}`;
          
          const res = await fetch(url, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
              fetchContent();
          } else {
              alert('Ошибка удаления');
          }
      } catch (e) { alert('Ошибка запроса'); }
  };

  const openEditModal = (item: any, type: 'wod' | 'exercise' | 'news') => {
      setEditingItem(item);
      setContentModalType(type);
      if (type === 'wod') {
          setNewWod({
              name: item.name,
              description: item.description,
              type: item.type,
              isGlobal: item.isGlobal
          });
      } else {
           setNewExercise({
              name: item.name,
              description: item.description || '',
              videoUrl: item.videoUrl || ''
           });
      }
      setIsContentModalOpen(true);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-full">
        <div className="flex border-b border-gray-200">
            <button 
                className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeContentTab === 'wods' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveContentTab('wods')}
            >
                WODs / Комплексы
            </button>
            <button 
                className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeContentTab === 'exercises' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveContentTab('exercises')}
            >
                Упражнения
            </button>
            <button 
                className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeContentTab === 'news' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveContentTab('news')}
            >
                Новости
            </button>
        </div>

        <div className="p-4 flex justify-end">
            <button 
                onClick={() => {
                    setEditingItem(null);

                    setContentModalType(activeContentTab === 'wods' ? 'wod' : activeContentTab === 'exercises' ? 'exercise' : 'news');
                    if (activeContentTab === 'wods') setNewWod({ name: '', description: '', type: 'CLASSIC', isGlobal: true });
                    else if (activeContentTab === 'news') setNewNews({ title: '', content: '', excerpt: '', imageUrl: '' });
                    else setNewExercise({ name: '', description: '', videoUrl: '' });
                    setIsContentModalOpen(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition flex items-center"
            >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Добавить {activeContentTab === 'wods' ? 'WOD' : activeContentTab === 'exercises' ? 'Упражнение' : 'Новость'}
            </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
            {loadingContent ? (
                 <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
            ) : activeContentTab === 'wods' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wods.map(wod => (
                        <div key={wod.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-800">{wod.name}</h3>
                                <span className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-600">{wod.type}</span>
                            </div>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap mb-4 h-24 overflow-hidden">{wod.description}</p>
                            <div className="flex justify-end gap-2 border-t pt-2">
                                <button onClick={() => openEditModal(wod, 'wod')} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Ред.</button>
                                <button onClick={() => handleDeleteContent(wod, 'wod')} className="text-red-600 hover:text-red-800 text-sm font-medium">Удалить</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : activeContentTab === 'exercises' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {globalExercises.map(ex => (
                        <div key={ex.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-800">{ex.name}</h3>
                            </div>
                            {ex.description && <p className="text-gray-600 text-sm mb-2">{ex.description}</p>}
                            {ex.videoUrl && <a href={ex.videoUrl} target="_blank" rel="noreferrer" className="text-blue-500 text-sm block mb-2 hover:underline">Видео</a>}
                            <div className="flex justify-end gap-2 border-t pt-2">
                                <button onClick={() => openEditModal(ex, 'exercise')} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Ред.</button>
                                <button onClick={() => handleDeleteContent(ex, 'exercise')} className="text-red-600 hover:text-red-800 text-sm font-medium">Удалить</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {news.map(n => (
                        <div key={n.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-800">{n.title}</h3>
                                <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                            {n.excerpt && <p className="text-gray-600 text-sm mb-2 italic">{n.excerpt}</p>}
                            <div className="flex justify-end gap-2 border-t pt-2">
                                <button onClick={() => openEditModal(n, 'news')} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Ред.</button>
                                <button onClick={() => handleDeleteContent(n, 'news')} className="text-red-600 hover:text-red-800 text-sm font-medium">Удалить</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        <Modal
              isOpen={isContentModalOpen}
              onClose={() => setIsContentModalOpen(false)}
              title={
                  editingItem 
                    ? (contentModalType === 'wod' ? 'Редактировать WOD' : contentModalType === 'exercise' ? 'Редактировать Упражнение' : 'Редактировать Новость')
                    : (contentModalType === 'wod' ? 'Создать WOD' : contentModalType === 'exercise' ? 'Создать Упражнение' : 'Создать Новость')
              }
              size="md"
              footer={
                  <div className="flex justify-end gap-2">
                       <button 
                          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
                          onClick={() => setIsContentModalOpen(false)}
                          disabled={loadingContent}
                       >
                           Отмена
                       </button>
                      <button 
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50"
                          onClick={editingItem ? handleUpdateContent : handleCreateContent}
                          disabled={loadingContent}
                      >
                          {loadingContent ? 'Сохранение...' : 'Сохранить'}
                      </button>
                  </div>
              }
          >
              {contentModalType === 'wod' ? (
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                          <input 
                              type="text"
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              value={newWod.name}
                              onChange={(e) => setNewWod({...newWod, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                          <select 
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              value={newWod.type}
                              onChange={(e) => setNewWod({...newWod, type: e.target.value})}
                          >
                              <option value="CLASSIC">CLASSIC (Классический)</option>
                              <option value="HERO">HERO (Герои)</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                          <textarea 
                              className="w-full border border-gray-300 rounded px-3 py-2 h-32 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              value={newWod.description}
                              onChange={(e) => setNewWod({...newWod, description: e.target.value})}
                          />
                      </div>
                  </div>
              ) : (
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                          <input 
                              type="text"
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              value={newExercise.name}
                              onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Описание (опционально)</label>
                          <textarea 
                              className="w-full border border-gray-300 rounded px-3 py-2 h-24 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              value={newExercise.description}
                              onChange={(e) => setNewExercise({...newExercise, description: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">URL Видео (опционально)</label>
                          <input 
                              type="text"
                              placeholder="https://youtube.com/..."
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              value={newExercise.videoUrl}
                              onChange={(e) => setNewExercise({...newExercise, videoUrl: e.target.value})}
                          />
                      </div>
                  </div>
              )}
              {contentModalType === 'news' && (
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
                          <input 
                              type="text"
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              value={newNews.title}
                              onChange={(e) => setNewNews({...newNews, title: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Краткое описание (превью)</label>
                          <textarea 
                              className="w-full border border-gray-300 rounded px-3 py-2 h-20 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              value={newNews.excerpt}
                              onChange={(e) => setNewNews({...newNews, excerpt: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Контент</label>
                          <textarea 
                              className="w-full border border-gray-300 rounded px-3 py-2 h-40 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              value={newNews.content}
                              onChange={(e) => setNewNews({...newNews, content: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">URL Изображения (опционально)</label>
                          <input 
                              type="text"
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              value={newNews.imageUrl}
                              onChange={(e) => setNewNews({...newNews, imageUrl: e.target.value})}
                          />
                      </div>
                  </div>
              )}
          </Modal>
    </div>
  );
};
