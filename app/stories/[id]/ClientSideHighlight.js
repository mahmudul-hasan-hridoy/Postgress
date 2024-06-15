// app/stories/[id]/ClientSideHighlight.js
"use client";

import { useEffect } from "react";
import hljs from "highlight.js";

export default function ClientSideHighlight({ content }) {
  useEffect(() => {
    hljs.highlightAll();
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
