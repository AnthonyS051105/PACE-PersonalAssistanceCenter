"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Editor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Start writing your notes here...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[150px]",
      },
    },
    immediatelyRender: false,
  });

  return (
    <div className="w-full h-full">
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
