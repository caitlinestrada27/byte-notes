import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Card } from "@/components/ui/card";

interface ViewerProps {
  content: string;
  style?: "default" | "prose";
}

const Viewer = ({ content, style }: ViewerProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) return <></>;

  const className: string =
    style === "prose" ? "prose-mt-0 prose max-w-none dark:prose-invert" : "";

  return (
    <div className="w-[50%] h-[80.95%] m-0 ml-2 p-4">
      <div className="m-0 p-0 prose max-w-none w-full h-full border-[2] bg-background dark:prose-invert flex flex-col rounded-2xl overflow-auto">
        <article className={className}>
          <EditorContent editor={editor} readOnly={false} className="p-4" />
        </article>
      </div>
    </div>
  );
};

export default Viewer;
