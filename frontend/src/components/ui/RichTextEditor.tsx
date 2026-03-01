"use client"

import React, { useMemo } from "react"
import dynamic from "next/dynamic"

// динамический импорт важен для Next.js, чтобы избежать ошибок с document при SSR
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any
import "react-quill-new/dist/quill.snow.css"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    [],
  )

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
  ]

  return (
    <div className="bg-white">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-48 mb-12" // mb-12 нужен потому что тулбар абсолютный или занимает место, плюс отступ для текста
      />
    </div>
  )
}
