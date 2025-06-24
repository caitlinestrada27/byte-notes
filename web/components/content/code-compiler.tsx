// Component that displays the code compiler card
import { Dispatch } from "react";
import { Card } from "../ui/card";
import sdk, { ProjectFiles, VM } from "@stackblitz/sdk";
import React, { useEffect } from "react";
import { createSupabaseComponentClient } from "@/utils/supabase/component";
import { starterCodeFiles } from "@/utils/starter-content";

type CodeCompilerProps = {
  pageId: string;
  theme: string | undefined;
  files: ProjectFiles;
  setFiles: Dispatch<ProjectFiles>;
  vmRef: React.RefObject<VM>;
};

export function CodeCompiler({
  pageId,
  theme,
  files,
  setFiles,
  vmRef,
}: CodeCompilerProps) {
  const supabase = createSupabaseComponentClient();

  useEffect(() => {
    const container = document.getElementById("embed");
    if (container) container.innerHTML = "";
  }, [pageId]);

  useEffect(() => {
    if (!files || !theme) return;

    async function init() {
      const vm = await sdk.embedProject(
        "embed",
        {
          title: "ByteNotes Project",
          description: "Auto-created per page",
          template: "typescript",
          files,
        },
        {
          clickToLoad: false,
          openFile: "index.ts",
          theme: `${theme === "dark" ? "dark" : "light"}`,
        }
      );

      vmRef.current = vm;
    }
    init();
  }, [pageId, files, theme]);

  return (
    <div className="w-[50%] m-0 px-6 py-4">
      <Card className="w-full max-w-5xl mx-auto h-[80.5%] border-[2]">
        <div id="embed" className="h-full w-full" />
      </Card>
    </div>
  );
}
