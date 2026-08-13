import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo } from 'lucide-react';

interface RichEditorProps {
  value: string[];
  onChange: (paragraphs: string[]) => void;
}

export function RichEditor({ value, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: {
      type: 'doc',
      content: value.map((p) => ({
        type: 'paragraph',
        content: p ? [{ type: 'text', text: p }] : [],
      })),
    },
    editorProps: {
      attributes: { class: 'focus:outline-none min-h-[240px] px-4 py-3 text-foreground' },
    },
    onUpdate: ({ editor }) => {
      const paragraphs: string[] = [];
      editor.state.doc.forEach((node) => {
        if (node.type.name === 'paragraph') {
          paragraphs.push(node.textContent);
        } else if (node.type.name === 'heading') {
          paragraphs.push(`#${'#'.repeat(node.attrs.level - 1)} ${node.textContent}`);
        } else if (node.type.name === 'bulletList' || node.type.name === 'orderedList') {
          node.forEach((item) => {
            paragraphs.push(`- ${item.textContent}`);
          });
        } else if (node.type.name === 'blockquote') {
          paragraphs.push(`> ${node.textContent}`);
        }
      });
      onChange(paragraphs);
    },
  });

  // Keep the editor in sync when `value` changes from outside (e.g. restored draft
  // or loading an article for editing), without clobbering in-progress typing.
  useEffect(() => {
    if (!editor) return;
    const next = {
      type: 'doc',
      content: value.map((p) => ({
        type: 'paragraph',
        content: p ? [{ type: 'text', text: p }] : [],
      })),
    };
    const current = editor.getJSON();
    if (JSON.stringify(current) !== JSON.stringify(next)) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  const ToolBtn = ({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-input-background">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30 flex-wrap">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic className="w-4 h-4" />
        </ToolBtn>
        <span className="w-px h-5 bg-border mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
          <Heading1 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          <Heading2 className="w-4 h-4" />
        </ToolBtn>
        <span className="w-px h-5 bg-border mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
          <Quote className="w-4 h-4" />
        </ToolBtn>
        <span className="w-px h-5 bg-border mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="w-4 h-4" />
        </ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
