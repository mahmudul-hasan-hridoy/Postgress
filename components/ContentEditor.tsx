import React, { useEffect, useRef } from "react";
import Quill from "quill";
import hljs from "highlight.js";
import "quill/dist/quill.snow.css";
import "highlight.js/styles/atom-one-dark.min.css";

export default function ContentEditor({ content, onChange }) {
  const editorRef = useRef(null);
  const quillEditor = useRef(null);

  useEffect(() => {
    if (editorRef.current && !quillEditor.current) {
      quillEditor.current = new Quill(editorRef.current, {
        modules: {
          syntax: { hljs },
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "blockquote", "code-block"],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ direction: "rtl" }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ["clean"],
            ["image", "video"],
          ],
        },
        theme: "snow",
        placeholder: "Write your content here...",
      });

      quillEditor.current.root.innerHTML = content;

      quillEditor.current.on("text-change", () => {
        onChange(quillEditor.current.root.innerHTML);
      });
    }
  }, [content, onChange]);

  useEffect(() => {
    hljs.highlightAll();
  });

  return (
    <div>
      <label className="block mb-2" htmlFor="content">
        Content
      </label>
      <div className="border p-2 rounded bg-white">
        <div ref={editorRef} style={{ minHeight: "200px" }} />
      </div>
    </div>
  );
}
