import React, { useEffect, useState } from "react"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { Modal } from "../ui/Modal"
import { logApiError } from "../../lib/logger"

import { adminApi, ContentBlock } from "../../lib/api/admin"

export const ContentTab: React.FC = () => {
  // const { token } = useAuthStore() // Token no longer needed explicitely

  const [activeContentTab, setActiveContentTab] = useState<"wods" | "exercises" | "news" | "blocks">(
    "wods",
  )
  const [activeBlockLocation, setActiveBlockLocation] = useState<"LANDING" | "KNOWLEDGE">("LANDING")
  const [wods, setWods] = useState<any[]>([])
  const [globalExercises, setGlobalExercises] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [loadingContent, setLoadingContent] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [isContentModalOpen, setIsContentModalOpen] = useState(false)
  const [contentModalType, setContentModalType] = useState<"wod" | "exercise" | "news" | "block">(
    "wod",
  )
  const [editingItem, setEditingItem] = useState<any>(null) // Если null, это режим создания
  const [newWod, setNewWod] = useState({
    name: "",
    description: "",
    type: "CLASSIC",
    scheme: "FOR_TIME",
    isGlobal: true,
    muscleGroups: [] as string[],
  })
  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    videoUrl: "",
    muscleGroups: [] as string[],
  })
  const [newNews, setNewNews] = useState({
    title: "",
    content: "",
    excerpt: "",
    imageUrl: "",
    createdAt: "",
  })
  const [newBlock, setNewBlock] = useState<Omit<ContentBlock, "id">>({
    title: "",
    description: "",
    content: "",
    imageUrl: "",
    location: "LANDING",
    isActive: true,
    order: 0,
    seoTitle: "",
    seoDescription: "",
  })

  const MUSCLE_GROUPS = [
    { id: "CHEST", label: "Грудные мышцы" },
    { id: "BACK", label: "Мышцы спины" },
    { id: "LEGS", label: "Мышцы ног" },
    { id: "SHOULDERS", label: "Плечи" },
    { id: "ARMS", label: "Руки" },
    { id: "CORE", label: "Мышцы кора" },
  ]

  useEffect(() => {
    fetchContent()
  }, []) // Removed token dependency as apiClient handles it

  const fetchContent = async () => {
    setLoadingContent(true)
    try {
      const [wodsData, exercisesData, newsData, blocksData] = await Promise.all([
        adminApi.getWods(),
        adminApi.getExercises(),
        adminApi.getNews(),
        adminApi.getContentBlocks(),
      ])

      setWods(wodsData || [])
      setGlobalExercises(exercisesData || [])
      setNews(newsData || [])
      setBlocks(blocksData || [])
    } catch (e) {
      logApiError("/api/admin/content", e)
    } finally {
      setLoadingContent(false)
    }
  }

  const handleCreateContent = async () => {
    if (contentModalType === "wod") {
      try {
        await adminApi.createWod(newWod)
        fetchContent()
        setIsContentModalOpen(false)
        setNewWod({
          name: "",
          description: "",
          type: "CLASSIC",
          scheme: "FOR_TIME",
          isGlobal: true,
          muscleGroups: [],
        })
      } catch (e) {
        alert("Ошибка создания WOD")
      }
    } else if (contentModalType === "news") {
      try {
        await adminApi.createNews(newNews)
        fetchContent()
        setIsContentModalOpen(false)
        setNewNews({ title: "", content: "", excerpt: "", imageUrl: "", createdAt: "" })
      } catch (e) {
        alert("Ошибка создания новости")
      }
    } else if (contentModalType === "block") {
      try {
        let imageUrl = newBlock.imageUrl
        if (imageFile) {
          const uploadRes = await adminApi.uploadImage(imageFile)
          imageUrl = uploadRes.imageUrl
        }
        await adminApi.createContentBlock({ ...newBlock, imageUrl })
        fetchContent()
        setIsContentModalOpen(false)
        setNewBlock({
          title: "",
          description: "",
          content: "",
          imageUrl: "",
          location: "LANDING",
          isActive: true,
          order: 0,
          seoTitle: "",
          seoDescription: "",
        })
        setImageFile(null)
      } catch (e) {
        alert("Ошибка создания блока")
      }
    } else {
      try {
        await adminApi.createExercise(newExercise)
        fetchContent()
        setIsContentModalOpen(false)
        setNewExercise({ name: "", description: "", videoUrl: "", muscleGroups: [] })
      } catch (e) {
        alert("Ошибка создания упражнения")
      }
    }
  }

  const handleUpdateContent = async () => {
    if (!editingItem) return
    if (contentModalType === "wod") {
      try {
        await adminApi.updateWod(editingItem.id, newWod)
        fetchContent()
        setIsContentModalOpen(false)
        setEditingItem(null)
        setNewWod({
          name: "",
          description: "",
          type: "CLASSIC",
          scheme: "FOR_TIME",
          isGlobal: true,
          muscleGroups: [],
        })
      } catch (e) {
        alert("Ошибка обновления WOD")
      }
    } else if (contentModalType === "news") {
      try {
        await adminApi.updateNews(editingItem.id, newNews)
        fetchContent()
        setIsContentModalOpen(false)
        setEditingItem(null)
        setNewNews({ title: "", content: "", excerpt: "", imageUrl: "", createdAt: "" })
      } catch (e) {
        alert("Ошибка обновления новости")
      }
    } else if (contentModalType === "block") {
      try {
        let imageUrl = newBlock.imageUrl
        if (imageFile) {
          const uploadRes = await adminApi.uploadImage(imageFile)
          imageUrl = uploadRes.imageUrl
        }
        await adminApi.updateContentBlock(editingItem.id, { ...newBlock, imageUrl })
        fetchContent()
        setIsContentModalOpen(false)
        setEditingItem(null)
        setNewBlock({
          title: "",
          description: "",
          content: "",
          imageUrl: "",
          location: "LANDING",
          isActive: true,
          order: 0,
          seoTitle: "",
          seoDescription: "",
        })
        setImageFile(null)
      } catch (e) {
        alert("Ошибка обновления блока")
      }
    } else {
      try {
        await adminApi.updateExercise(editingItem.id, newExercise)
        fetchContent()
        setIsContentModalOpen(false)
        setEditingItem(null)
        setNewExercise({ name: "", description: "", videoUrl: "", muscleGroups: [] })
      } catch (e) {
        alert("Ошибка обновления упражнения")
      }
    }
  }

  const handleDeleteContent = async (item: any, type: "wod" | "exercise" | "news" | "block") => {
    if (!confirm("Вы уверены, что хотите удалить этот элемент?")) return
    try {
      if (type === "wod") await adminApi.deleteWod(item.id)
      else if (type === "exercise") await adminApi.deleteExercise(item.id)
      else if (type === "news") await adminApi.deleteNews(item.id)
      else await adminApi.deleteContentBlock(item.id)

      fetchContent()
    } catch (e) {
      alert("Ошибка удаления")
    }
  }

  const openEditModal = (item: any, type: "wod" | "exercise" | "news" | "block") => {
    setEditingItem(item)
    setContentModalType(type)
    setImageFile(null)
    if (type === "wod") {
      setNewWod({
        name: item.name,
        description: item.description,
        type: item.type,
        scheme: item.scheme || "FOR_TIME",
        isGlobal: item.isGlobal,
        muscleGroups: item.muscleGroups || [],
      })
    } else if (type === "news") {
      setNewNews({
        title: item.title,
        content: item.content,
        excerpt: item.excerpt || "",
        imageUrl: item.imageUrl || "",
        createdAt: item.createdAt ? item.createdAt.substring(0, 16) : "",
      })
    } else if (type === "block") {
      setNewBlock({
        title: item.title,
        description: item.description || "",
        content: item.content || "",
        imageUrl: item.imageUrl || "",
        location: item.location,
        isActive: item.isActive,
        order: item.order,
        seoTitle: item.seoTitle || "",
        seoDescription: item.seoDescription || "",
      })
    } else {
      setNewExercise({
        name: item.name,
        description: item.description || "",
        videoUrl: item.videoUrl || "",
        muscleGroups: item.muscleGroups || [],
      })
    }
    setIsContentModalOpen(true)
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-full">
      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeContentTab === "wods" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveContentTab("wods")}>
          WODs / Комплексы
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeContentTab === "exercises" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveContentTab("exercises")}>
          Упражнения
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeContentTab === "news" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveContentTab("news")}>
          Новости
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeContentTab === "blocks" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveContentTab("blocks")}>
          Блоки / Слайды
        </button>
      </div>

      <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {activeContentTab === "blocks" ? (
          <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeBlockLocation === "LANDING"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveBlockLocation("LANDING")}>
              Главная Страница
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeBlockLocation === "KNOWLEDGE"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveBlockLocation("KNOWLEDGE")}>
              Страница Знаний
            </button>
          </div>
        ) : (
          <div /> /* Empty div to keep flex-between alignment */
        )}

        <button
          onClick={() => {
            setEditingItem(null)

            setContentModalType(
              activeContentTab === "wods"
                ? "wod"
                : activeContentTab === "exercises"
                  ? "exercise"
                  : activeContentTab === "blocks"
                    ? "block"
                    : "news",
            )
            if (activeContentTab === "wods")
              setNewWod({
                name: "",
                description: "",
                type: "CLASSIC",
                scheme: "FOR_TIME",
                isGlobal: true,
                muscleGroups: [],
              })
            else if (activeContentTab === "news")
              setNewNews({ title: "", content: "", excerpt: "", imageUrl: "", createdAt: "" })
            else if (activeContentTab === "blocks")
              setNewBlock({
                title: "",
                description: "",
                content: "",
                imageUrl: "",
                location: activeBlockLocation,
                isActive: true,
                order: 0,
                seoTitle: "",
                seoDescription: "",
              })
            else
              setNewExercise({
                name: "",
                description: "",
                videoUrl: "",
                muscleGroups: [],
              })
            setIsContentModalOpen(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition flex items-center">
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Добавить{" "}
          {activeContentTab === "wods"
            ? "WOD"
            : activeContentTab === "exercises"
              ? "Упражнение"
              : activeContentTab === "blocks"
                ? "Слайд / Блок"
                : "Новость"}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {loadingContent ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : activeContentTab === "wods" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wods.map((wod) => (
              <div
                key={wod.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{wod.name}</h3>
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-600">
                    {wod.type}
                  </span>
                </div>
                <p className="text-gray-600 text-sm whitespace-pre-wrap mb-4 h-24 overflow-hidden">
                  {wod.description}
                </p>
                <div className="flex justify-end gap-2 border-t pt-2">
                  <button
                    onClick={() => openEditModal(wod, "wod")}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    Ред.
                  </button>
                  <button
                    onClick={() => handleDeleteContent(wod, "wod")}
                    className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : activeContentTab === "exercises" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalExercises.map((ex) => (
              <div
                key={ex.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{ex.name}</h3>
                </div>
                {ex.description && (
                  <p className="text-gray-600 text-sm mb-2">{ex.description}</p>
                )}
                {ex.videoUrl && (
                  <a
                    href={ex.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 text-sm block mb-2 hover:underline">
                    Видео
                  </a>
                )}
                <div className="flex justify-end gap-2 border-t pt-2">
                  <button
                    onClick={() => openEditModal(ex, "exercise")}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    Ред.
                  </button>
                  <button
                    onClick={() => handleDeleteContent(ex, "exercise")}
                    className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : activeContentTab === "news" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((n) => (
              <div
                key={n.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{n.title}</h3>
                  <span className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {n.excerpt && (
                  <p className="text-gray-600 text-sm mb-2 italic">{n.excerpt}</p>
                )}
                <div className="flex justify-end gap-2 border-t pt-2">
                  <button
                    onClick={() => openEditModal(n, "news")}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    Ред.
                  </button>
                  <button
                    onClick={() => handleDeleteContent(n, "news")}
                    className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.filter(b => b.location === activeBlockLocation).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blocks
                  .filter(b => b.location === activeBlockLocation)
                  .map((b) => (
                  <div
                    key={b.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition bg-white flex flex-col ${!b.isActive ? "opacity-60" : "border-gray-200"}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800">{b.title}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-600">
                        {b.isActive ? "Активен" : "Скрыт"}
                      </span>
                    </div>
                    {b.imageUrl && (
                      <img src={b.imageUrl} alt={b.title} className="w-full h-32 object-cover rounded mb-2" />
                    )}
                    {b.description && (
                      <p className="text-gray-600 text-sm mb-2 h-10 overflow-hidden text-ellipsis">{b.description}</p>
                    )}
                    <div className="flex justify-between items-center border-t pt-2 mt-auto">
                      <span className="text-xs text-gray-500">Порядок: {b.order}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(b, "block")}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                          Ред.
                        </button>
                        <button
                          onClick={() => handleDeleteContent(b, "block")}
                          className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">Нет блоков для этого раздела</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        title={
          editingItem
            ? contentModalType === "wod"
              ? "Редактировать WOD"
              : contentModalType === "exercise"
                ? "Редактировать Упражнение"
                : contentModalType === "news"
                  ? "Редактировать Новость"
                  : "Редактировать Блок/Слайд"
            : contentModalType === "wod"
              ? "Создать WOD"
              : contentModalType === "exercise"
                ? "Создать Упражнение"
                : contentModalType === "news"
                  ? "Создать Новость"
                  : "Создать Блок/Слайд"
        }
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
              onClick={() => setIsContentModalOpen(false)}
              disabled={loadingContent}>
              Отмена
            </button>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50"
              onClick={editingItem ? handleUpdateContent : handleCreateContent}
              disabled={loadingContent}>
              {loadingContent ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        }>
        {contentModalType === "wod" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newWod.name}
                onChange={(e) => setNewWod({ ...newWod, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newWod.type}
                onChange={(e) => setNewWod({ ...newWod, type: e.target.value })}>
                <option value="CLASSIC">CLASSIC (Классический)</option>
                <option value="HERO">HERO (Герои)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Схема
              </label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newWod.scheme}
                onChange={(e) => setNewWod({ ...newWod, scheme: e.target.value })}>
                <option value="FOR_TIME">FOR TIME (На время)</option>
                <option value="AMRAP">AMRAP (Закончить как можно больше раундов)</option>
                <option value="EMOM">EMOM (Каждую минуту в начале минуты)</option>
                <option value="TABATA">TABATA (Табата)</option>
                <option value="NOT_SPECIFIED">Не указано</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 h-32 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newWod.description}
                onChange={(e) => setNewWod({ ...newWod, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Группы мышц
              </label>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => {
                      const groups = newWod.muscleGroups.includes(group.id)
                        ? newWod.muscleGroups.filter((g) => g !== group.id)
                        : [...newWod.muscleGroups, group.id]
                      setNewWod({ ...newWod, muscleGroups: groups })
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      newWod.muscleGroups.includes(group.id)
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}>
                    {group.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {contentModalType === "exercise" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание (опционально)
              </label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 h-24 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newExercise.description}
                onChange={(e) =>
                  setNewExercise({ ...newExercise, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Видео (опционально)
              </label>
              <input
                type="text"
                placeholder="https://youtube.com/..."
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newExercise.videoUrl}
                onChange={(e) =>
                  setNewExercise({ ...newExercise, videoUrl: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Группы мышц
              </label>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => {
                      const groups = newExercise.muscleGroups.includes(group.id)
                        ? newExercise.muscleGroups.filter((g) => g !== group.id)
                        : [...newExercise.muscleGroups, group.id]
                      setNewExercise({ ...newExercise, muscleGroups: groups })
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      newExercise.muscleGroups.includes(group.id)
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}>
                    {group.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {contentModalType === "news" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Заголовок
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newNews.title}
                onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Краткое описание (превью)
              </label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 h-20 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newNews.excerpt}
                onChange={(e) => setNewNews({ ...newNews, excerpt: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Контент
              </label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 h-40 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newNews.content}
                onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Изображения (опционально)
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newNews.imageUrl}
                onChange={(e) => setNewNews({ ...newNews, imageUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата создания (опционально)
              </label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newNews.createdAt}
                onChange={(e) => setNewNews({ ...newNews, createdAt: e.target.value })}
              />
            </div>
          </div>
        )}
        {contentModalType === "block" && (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isActive"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={newBlock.isActive}
                onChange={(e) => setNewBlock({ ...newBlock, isActive: e.target.checked })}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 font-medium">
                Активен (Отображается на сайте)
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Расположение
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={newBlock.location}
                  onChange={(e) => setNewBlock({ ...newBlock, location: e.target.value as "LANDING" | "KNOWLEDGE" })}>
                  <option value="LANDING">Главная страница</option>
                  <option value="KNOWLEDGE">Страница Знаний</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Порядок сортировки
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={newBlock.order}
                  onChange={(e) => setNewBlock({ ...newBlock, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Заголовок слайда
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={newBlock.title}
                onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание / Краткий текст
              </label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 h-20"
                value={newBlock.description}
                onChange={(e) => setNewBlock({ ...newBlock, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Изображение (Загрузить новое)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full border border-gray-300 rounded px-3 py-2"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setImageFile(e.target.files[0])
                  }
                }}
              />
              {newBlock.imageUrl && !imageFile && (
                <div className="mt-2 text-sm text-gray-500">
                  Текущее: <br/> <img src={newBlock.imageUrl} alt="preview" className="h-20 rounded" />
                </div>
              )}
            </div>
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-bold text-gray-700 mb-2">SEO настройки</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">SEO Title (опционально)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                    value={newBlock.seoTitle}
                    onChange={(e) => setNewBlock({ ...newBlock, seoTitle: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">SEO Description (опционально)</label>
                  <textarea
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm h-16"
                    value={newBlock.seoDescription}
                    onChange={(e) => setNewBlock({ ...newBlock, seoDescription: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
