// Component that displays the markdown editor card

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import Editor from "./rich-text/editor";

export function MarkdownEditor({
  setValue,
  value,
}: {
  setValue: Dispatch<SetStateAction<string>>;
  value: string;
}) {
  return (
    <div className="w-[50%] h-[80.95%] p-4">
      <Editor
        content={value}
        onChange={(updatedContent) => setValue(updatedContent)}
        placeholder="Write your notes here..."
        // readOnly={false}
      />
    </div>
  );
}
