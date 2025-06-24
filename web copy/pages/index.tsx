import { Button } from "@/components/ui/button";
import { GetServerSidePropsContext } from "next";
import { createSupabaseServerClient } from "@/utils/supabase/server-props";
import { createSupabaseComponentClient } from "@/utils/supabase/component";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotebookTreeByUser,
  getProfileData,
} from "@/utils/supabase/queries";
import { Globe, Mail, MessageSquare, Save, Send } from "lucide-react";
import Layout from "./layout";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SupabaseClient } from "@supabase/supabase-js";
import { MarkdownEditor } from "@/components/content/markdown-editor";
import { NoActivePage } from "@/components/content/no-active-page";
import { getPageHierarchyById } from "@/utils/find-page-hierarchy";
import { ThemeProvider } from "@/components/theme/theme-provider";
import ThemeToggle from "@/components/theme/theme-toggle";
import Profile from "@/components/header/profile";
import { CodeCompiler } from "@/components/content/code-compiler";
import { ProjectFiles, VM } from "@stackblitz/sdk";
import { useTheme } from "next-themes";
import SendButton from "@/components/subheader/send-button";
import { starterCodeFiles } from "@/utils/starter-content";

export default function HomePage() {
  // Create necessary hooks for clients and providers.
  const supabase = createSupabaseComponentClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch user profile data to display in the header
  const { data: profileData } = useQuery({
    queryKey: ["user_profile"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      if (!data) return null;
      return await getProfileData(supabase, data.user!.id);
    },
  });

  // Get user's notebook + chapter + page tree
  const { data: notebookTree } = useQuery({
    queryKey: ["notebook_tree"],
    enabled: !!profileData?.id,
    queryFn: async () => await getNotebookTreeByUser(supabase, profileData!.id),
  });

  // Logs the user out and routes back to the login page
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      window.alert("Failed to sign out: " + error.message);
    }
    router.push("/login");
  };

  // Handle opening a page from the sidebar
  const [activePageId, setActivePageId] = useState("");

  // Update header whenever the active page changes
  const [headerPath, setHeaderPath] = useState("");

  // Clicking this button navigates the user to view-only published note page
  function handlePublish(): void {
    if (activePageId !== "") {
      router.push(`/${activePageId}`, undefined, { shallow: true });
    } else {
      toast("Please select the page you'd like to publish using the sidebar!");
    }
  }

  const [files, setFiles] = useState<ProjectFiles>(starterCodeFiles);
  const vmRef = useRef<any>(null);

  async function handleSave(): Promise<void> {
    const { error: updateError } = await supabase
      .from("page")
      .update({ markdown: markdownEditorValue })
      .eq("id", activePageId);

    if (!updateError) {
      toast("Page saved successfully!");
    } else {
      toast("Failed to save: " + updateError.message);
    }

    if (vmRef.current) {
      const snapshot = await vmRef.current.getFsSnapshot();
      if (snapshot) setFiles(snapshot);

      const { error: codeSaveError } = await supabase
        .from("page")
        .update({ code_content: files })
        .eq("id", activePageId);

      if (!codeSaveError) {
        toast("Code saved successfully!");
      } else {
        toast("Failed to save code content: " + codeSaveError.message);
      }
    }
  }

  useEffect(() => {
    if (activePageId !== "" && notebookTree !== undefined) {
      const pageInfo = getPageHierarchyById({
        notebookTree: notebookTree,
        pageId: activePageId,
      });
      setHeaderPath(
        `${pageInfo?.notebook.name} / ${pageInfo?.chapter.name} / ${pageInfo?.page.name}`
      );
    }
  }, [activePageId]);

  // useState for markdown editor data
  const [markdownEditorValue, setMarkdownEditorValue] = useState("");

  // Log markdown editor value for testing/dev purposes - delete later!
  useEffect(() => {
    console.log(markdownEditorValue);
  }, [markdownEditorValue]);

  // Fetch markdown text
  const fetchMarkdownText = async () => {
    const { data, error } = await supabase
      .from("page")
      .select("markdown")
      .eq("id", activePageId)
      .single();

    if (!error && data?.markdown) {
      setMarkdownEditorValue(data.markdown);
    } else if (!error) {
      setMarkdownEditorValue("");
    }
  };

  // Fetch new markdown text when active page changes
  useEffect(() => {
    if (activePageId !== "") {
      fetchMarkdownText();
    } else {
      setMarkdownEditorValue("");
    }
  }, [activePageId]);

  // Fetch new code when active page changes
  useEffect(() => {
    async function fetchCodeContent() {
      const { data, error } = await supabase
        .from("page")
        .select("code_content")
        .eq("id", activePageId)
        .single();

      if (!error && data?.code_content) {
        setFiles(data.code_content);
      } else {
        setFiles(starterCodeFiles);
      }
    }

    fetchCodeContent();
  }, [activePageId]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <div className="fixed inset-0 overflow-hidden bg-background text-foreground">
        {/* Header */}
        <header className="flex items-center h-[115px] px-6 border-b border-border bg-sidebar justify-between">
          {/* Logo */}
          <div className="flex justify-center mr-2.5 -mt-0.5">
            <Button
              variant="link"
              className="p-0 m-0 hover:bg-transparent focus:outline-none active:bg-transparent"
              onClick={() => setActivePageId("")}
            >
              <img
                src="/ByteNotesLogo.png"
                alt="Byte Notes"
                className="w-[186px] h-[181px] hover:bg-transparent pointer-events-none"
              />
            </Button>
          </div>
          <div className="flex flex-row items-center gap-x-3">
            {/* Theme Toggle */}
            <ThemeToggle theme={theme} setTheme={setTheme} />
            {/* Profile */}
            <Profile
              profileData={profileData}
              supabase={supabase}
              onSignOut={handleSignOut}
            />
          </div>
        </header>

        {/* Subheader */}
        {activePageId !== "" && (
          <div className="relative flex items-center h-[60px] px-6 border-b border-border bg-sidebar">
            {/* Centered text */}
            <p className="text-sm absolute left-1/2 -translate-x-1/2 text-center">
              {headerPath}
            </p>
            {/* Right-aligned buttons */}
            <div className="ml-auto flex gap-2">
              <SendButton activePageId={activePageId} />
              <Button
                variant="ghost"
                className="flex flex-row items-center gap-1"
                onClick={() => handlePublish()}
              >
                <Globe />
                Publish
              </Button>
              <Button
                variant="ghost"
                className="flex flex-row items-center gap-1"
                onClick={() => handleSave()}
              >
                <Save />
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Content Layout */}
        <Layout
          activePageId={activePageId}
          setActivePageId={setActivePageId}
          showSidebar={true}
        >
          {activePageId !== "" ? (
            <>
              {
                <MarkdownEditor
                  value={markdownEditorValue}
                  setValue={setMarkdownEditorValue}
                />
              }
              <CodeCompiler
                key={resolvedTheme}
                pageId={activePageId}
                theme={theme}
                files={files}
                setFiles={setFiles}
                vmRef={vmRef}
              />
            </>
          ) : (
            <NoActivePage />
          )}
        </Layout>
      </div>
    </ThemeProvider>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Create the supabase context that works specifically on the server and pass in the context.
  const supabase = createSupabaseServerClient(context);

  // Attempt to load the user data
  const { data: userData, error: userError } = await supabase.auth.getUser();

  // If the user is not logged in, redirect them to the login page.
  if (userError || !userData) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
