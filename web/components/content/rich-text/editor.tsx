import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import EditorToolbar from "./toolbar/editor-toolbar";
import { useEffect } from "react";

// Code taken from https://github.com/sravimohan/shandcn-ui-extensions/tree/main/components/rich-text

interface EditorProps {
  content: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

const Editor = ({ content, placeholder, onChange }: EditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editorProps: {
      attributes: {
        class: "min-h-[400px] h-full outline-none p-2 leading-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false, // Tiptap Error: SSR has been detected, please set `immediatelyRender` explicitly to `false` to avoid hydration mismatches
  });

  // This useEffect renders the markdown content into editor box using TipTap's setContent command for <EditorContent>
  useEffect(() => {
    if (!editor) return;

    if (!content) {
      editor.commands.clearContent();
    } else if (editor.getHTML() !== content) {
      editor.commands.setContent(content, false, {
        preserveWhitespace: "full",
      });
    }
  }, [editor, content]);

  if (!editor) return null;

  return (
    <div className="m-0 p-0 prose max-w-none w-full h-full border-[2] bg-background dark:prose-invert flex flex-col rounded-2xl">
      <EditorToolbar editor={editor} />
      <div className="editor flex-1 overflow-y-auto px-2">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
};

export default Editor;
