import React, { useMemo } from "react"
import ReactQuill, { Quill } from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"

// Register Divider blot
const BlockEmbed = Quill.import("blots/block/embed") as any
class DividerBlot extends BlockEmbed {
  static create(value: any) {
    return super.create(value)
  }
}
DividerBlot.blotName = "divider"
DividerBlot.tagName = "hr"
Quill.register(DividerBlot)

// Add custom SVG icon to Quill icons for the 'divider' button
const icons = Quill.import("ui/icons") as any
icons.divider =
  '<svg viewBox="0 0 18 18" stroke="currentColor" stroke-width="2"><line x1="3" x2="15" y1="9" y2="9"></line></svg>'

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditorClient({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "divider"],
          ["clean"],
        ],
        handlers: {
          divider: function () {
            // @ts-ignore
            const quill = this.quill
            const range = quill.getSelection(true)
            quill.insertEmbed(range.index, "divider", true, Quill.sources.USER)
            quill.setSelection(range.index + 1, Quill.sources.SILENT)
          },
        },
      },
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
    "divider",
  ]

  return (
    <div className="bg-background text-foreground">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-48 mb-12"
      />
    </div>
  )
}
