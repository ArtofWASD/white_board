"use client"

import React from "react"
import dynamic from "next/dynamic"

// Динамический импорт редактора вместе с настройками (в том числе кастомным разделителем)
const EditorClient = dynamic(() => import("./RichTextEditorClient"), {
  ssr: false,
}) as any

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor(props: RichTextEditorProps) {
  return <EditorClient {...props} />
}
