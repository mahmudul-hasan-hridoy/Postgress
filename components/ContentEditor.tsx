import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@/dist/ckeditor';  // Adjust the path as needed

export default function ContentEditor({ content = '', onChange }) {
  // Ensure content is always a string
  const safeContent = typeof content === 'string' ? content : '';

  return (
    <div>
      <label className="block mb-2" htmlFor="content">
        Content
      </label>
      <div className="border rounded bg-white">
        <CKEditor
          editor={ClassicEditor}
          data={safeContent}
          onChange={(event, editor) => {
            const data = editor.getData();
            onChange(data);
          }}
          onError={(error, { willEditorRestart }) => {
            // Log the full error object for debugging
            console.error('CKEditor5 error:', error);
            if (willEditorRestart) {
              console.warn('CKEditor5 will restart.');
            }
          }}
        />
      </div>
    </div>
  );
}