"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { Button } from '@/components/ui/button'
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Undo,
    Redo
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
    editable?: boolean
}

export function RichTextEditor({ content, onChange, placeholder = "Digite aqui...", editable = true }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content,
        editable,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    if (!editor) {
        return null
    }

    return (
        <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-900">
            {editable && (
                <div className="border-b bg-slate-50 dark:bg-slate-800 p-2 flex flex-wrap gap-1">
                    {/* Text Formatting */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={cn(
                            "h-8 w-8 p-0",
                            editor.isActive('bold') && "bg-slate-200 dark:bg-slate-700"
                        )}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={cn(
                            "h-8 w-8 p-0",
                            editor.isActive('italic') && "bg-slate-200 dark:bg-slate-700"
                        )}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-8 bg-slate-300 dark:bg-slate-600 mx-1" />

                    {/* Lists */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={cn(
                            "h-8 w-8 p-0",
                            editor.isActive('bulletList') && "bg-slate-200 dark:bg-slate-700"
                        )}
                    >
                        <List className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={cn(
                            "h-8 w-8 p-0",
                            editor.isActive('orderedList') && "bg-slate-200 dark:bg-slate-700"
                        )}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-8 bg-slate-300 dark:bg-slate-600 mx-1" />

                    {/* Text Alignment */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={cn(
                            "h-8 w-8 p-0",
                            editor.isActive({ textAlign: 'left' }) && "bg-slate-200 dark:bg-slate-700"
                        )}
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={cn(
                            "h-8 w-8 p-0",
                            editor.isActive({ textAlign: 'center' }) && "bg-slate-200 dark:bg-slate-700"
                        )}
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={cn(
                            "h-8 w-8 p-0",
                            editor.isActive({ textAlign: 'right' }) && "bg-slate-200 dark:bg-slate-700"
                        )}
                    >
                        <AlignRight className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-8 bg-slate-300 dark:bg-slate-600 mx-1" />

                    {/* Undo/Redo */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className="h-8 w-8 p-0"
                    >
                        <Undo className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className="h-8 w-8 p-0"
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <EditorContent
                editor={editor}
                className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"
            />
        </div>
    )
}
