import React, { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ContentEditor = ({ content, onChange }) => {
  const quillRef = useRef(null);

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (editor && editor.root) {
        editor.root.innerHTML = content;
      }
    }
  }, [content]);

  const handleChange = (newContent, delta, source, editor) => {
    if (editor && editor.root) {
      onChange(editor.root.innerHTML);
    }
  };

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      value={content}
      onChange={handleChange}
    />
  );
};

export default ContentEditor;