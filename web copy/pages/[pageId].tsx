import { CodeCompiler } from "@/components/content/code-compiler";
import { MarkdownEditor } from "@/components/content/markdown-editor";
import Viewer from "@/components/content/rich-text/viewer";
import Profile from "@/components/header/profile";
import ThemeToggle from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { getPageHierarchyById } from "@/utils/find-page-hierarchy";
import { createSupabaseComponentClient } from "@/utils/supabase/component";
import {
  getNotebookTreeByUser,
  getProfileData,
} from "@/utils/supabase/queries";
import { ProjectFiles } from "@stackblitz/sdk";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "./layout";
import { ThemeProvider, useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import router from "next/router";
import {
  useState,
  useEffect,
  SetStateAction,
  useRef,
  useCallback,
} from "react";
import { toast } from "sonner";
import { RealtimeAvatarStack } from "@/components/realtime-avatar-stack";
import {
  addReactionToCacheFn,
  removeReactionFromCacheFn,
} from "@/utils/supabase/cache/reaction-cache";
import { z } from "zod";
import { Reaction } from "@/utils/supabase/models";
import { Heart } from "lucide-react";
import { HeartOff } from "lucide-react";
import { Star } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PublishedPage() {
  const pathname = usePathname();
  const pageId = pathname?.slice(1) ?? "";

  const supabase = createSupabaseComponentClient();
  const queryClient = useQueryClient();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [headerPath, setHeaderPath] = useState("");
  const [markdownEditorValue, setMarkdownEditorValue] = useState("");
  const [files, setFiles] = useState<Record<string, string> | null>(null);
  const vmRef = useRef<any>(null);
  const [activePageId, setActivePageId] = useState("");
  const [heartCount, setHeartCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [starCount, setStarCount] = useState(0);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [authorProfileImage, setAuthorProfileImage] = useState<string | null>(
    null
  );

  const { data: profileData } = useQuery({
    queryKey: ["user_profile"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      if (!data) return null;
      return await getProfileData(supabase, data.user!.id);
    },
  });

  const { data: reactions = [] } = useQuery({
    queryKey: ["page_reactions", pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reaction")
        .select("*")
        .eq("page_id", pageId);

      if (error) {
        console.error(error.message);
        return [];
      }
      return data;
    },
  });

  useEffect(() => {
    setHeartCount(reactions.filter((r) => r.reaction_type === "heart").length);
    setDislikeCount(
      reactions.filter((r) => r.reaction_type === "dislike").length
    );
    setStarCount(reactions.filter((r) => r.reaction_type === "star").length);
  }, [reactions]);

  // This function is used for optimistically adding a reaction to a published page - altered from Alias code
  const addReactionToCache = useCallback(
    (reaction: z.infer<typeof Reaction>) =>
      addReactionToCacheFn(queryClient, pageId)(reaction),
    [queryClient, pageId]
  );

  // This function is used for deleting a reaction when the reaction is clicked on again - altered from Alias code
  const removeReactionFromCache = useCallback(
    (reactionId: string) =>
      removeReactionFromCacheFn(queryClient, pageId)(reactionId),
    [queryClient, pageId]
  );

  useEffect(() => {
    if (!profileData) return;
    const dbChangesChannel = supabase
      .channel("reaction-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reaction",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const reaction = Reaction.parse(payload.new);
            if (reaction.profile_id != profileData?.id) {
              addReactionToCache(reaction);
            }
          }
          if (payload.eventType === "DELETE") {
            const reaction = payload.old;
            removeReactionFromCache(reaction.id);
          }
        }
      )
      .subscribe();

    return () => {
      dbChangesChannel.unsubscribe();
    };
  }, [addReactionToCache, removeReactionFromCache, profileData?.id, supabase]);

  const onReactionToggle = async (
    reactionType: "heart" | "dislike" | "star"
  ) => {
    if (!profileData?.id) {
      toast("You must be logged in to react!");
      return;
    }

    const existingReaction = reactions.find(
      (r) => r.profile_id === profileData.id && r.reaction_type === reactionType
    );

    if (existingReaction) {
      removeReactionFromCache(existingReaction.id);

      const { error } = await supabase
        .from("reaction")
        .delete()
        .eq("id", existingReaction.id);
    } else {
      const id = uuidv4();
      const newReaction = {
        id,
        profile_id: profileData.id,
        page_id: pageId,
        reaction_type: reactionType,
      };

      const { error } = await supabase.from("reaction").insert(newReaction);

      addReactionToCache(newReaction);
    }
  };

  function hasReacted(type: "heart" | "dislike" | "star") {
    return reactions.some(
      (r) => r.profile_id === profileData?.id && r.reaction_type === type
    );
  }

  const { data: notebookTree } = useQuery({
    queryKey: ["notebook_tree"],
    enabled: !!profileData?.id,
    queryFn: async () => await getNotebookTreeByUser(supabase, profileData!.id),
  });

  const isAuthor = profileData?.id === authorId;

  useEffect(() => {
    const fetchPageData = async () => {
      if (!pageId) return;

      const { data, error } = await supabase
        .from("page")
        .select(
          `
        markdown,
        code_content,
        chapter:chapter_id (
          notebook:notebook_id (
            author_id
          )
        )
      `
        )
        .eq("id", pageId)
        .single<{
          markdown: string;
          code_content: Record<string, string>;
          chapter: {
            notebook: {
              author_id: string;
            };
          };
        }>();

      if (error) {
        console.error("Error fetching page:", error);
        return;
      }

      if (data?.markdown) setMarkdownEditorValue(data.markdown);
      if (data?.code_content) setFiles(data.code_content);

      const fetchedAuthorId = data?.chapter?.notebook?.author_id;
      console.log("Fetched author ID:", fetchedAuthorId);
      setAuthorId(fetchedAuthorId ?? null);
    };

    fetchPageData();
  }, [pageId]);

  useEffect(() => {
    const fetchAuthorData = async () => {
      if (!authorId || authorId === profileData?.id) return;

      const { data, error } = await supabase
        .from("profile")
        .select("display_name, avatar_url")
        .eq("id", authorId)
        .single();

      if (error) {
        console.error("Failed to fetch author's profile:", error);
        return;
      }

      setAuthorName(data?.display_name ?? null);

      if (data?.avatar_url) {
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(data.avatar_url);

        setAuthorProfileImage(publicUrlData.publicUrl);
      } else {
        setAuthorProfileImage(null);
      }
    };

    fetchAuthorData();
  }, [authorId, profileData]);

  useEffect(() => {
    if (pageId && notebookTree) {
      const pageInfo = getPageHierarchyById({ notebookTree, pageId });
      setHeaderPath(`${pageInfo?.page.name}`);
    }
  }, [pageId, notebookTree]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      window.alert("Failed to sign out: " + error.message);
    }
    router.push("/login");
  };

  if (!pageId || !markdownEditorValue || !files) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <p>Loading published note...</p>
      </div>
    );
  }

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
              onClick={() => router.push("/")}
            >
              <img
                src="/ByteNotesLogo.png"
                alt="Byte Notes"
                className="w-[186px] h-[181px] hover:bg-transparent pointer-events-none"
              />
            </Button>
          </div>
          <div className="flex flex-row items-center gap-x-3">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <Profile
              profileData={profileData}
              supabase={supabase}
              onSignOut={handleSignOut}
              onProfileUpdate={async () =>
                await queryClient.refetchQueries({ queryKey: ["user_profile"] })
              }
            />
          </div>
        </header>

        {/* Subheader */}
        {pageId && markdownEditorValue !== "" && (
          <div className="relative flex items-center h-[60px] px-6 border-b border-border bg-sidebar justify-between">
            <div className="flex items-center gap-4 p-4">
              <Button variant="ghost" onClick={() => onReactionToggle("heart")}>
                <Heart
                  className={
                    hasReacted("heart")
                      ? "text-blue-400 fill-blue-400"
                      : "text-foreground"
                  }
                />
                <p>{heartCount}</p>
              </Button>

              <Button
                variant="ghost"
                onClick={() => onReactionToggle("dislike")}
              >
                <HeartOff
                  className={
                    hasReacted("dislike")
                      ? "text-foreground fill-foreground"
                      : "text-foreground"
                  }
                />
                <p>{dislikeCount}</p>
              </Button>

              <Button variant="ghost" onClick={() => onReactionToggle("star")}>
                <Star
                  className={
                    hasReacted("star")
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-foreground"
                  }
                />
                <p>{starCount}</p>
              </Button>
            </div>

            {/* Center: Page Title */}
            <p className="absolute left-1/2 transform -translate-x-1/2 text-lg text-center">
              {isAuthor
                ? headerPath || "Untitled Page"
                : authorName
                ? `${authorName}'s Page`
                : "Shared Page"}
            </p>

            <div className="flex items-center gap-6 p-4">
              {/* Viewers */}
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold">Viewers</p>
                <RealtimeAvatarStack roomName={`page_${pageId}`} />
              </div>

              {/* Author */}
              {!isAuthor && (
                <div className="flex items-center gap-2 relative group">
                  <p className="text-sm font-bold">Author</p>
                  <Avatar className="w-9 h-9">
                    <AvatarImage
                      className="object-cover"
                      src={authorProfileImage ?? ""}
                      alt={`${authorName ?? "Author"} avatar`}
                    />
                    <AvatarFallback>
                      {authorName?.[0]?.toUpperCase() ?? "A"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <Layout
          activePageId={activePageId}
          setActivePageId={setActivePageId}
          showSidebar={false}
        >
          <Viewer content={markdownEditorValue} style="prose" />
          <CodeCompiler
            key={resolvedTheme}
            pageId={pageId}
            theme={theme}
            files={files}
            setFiles={setFiles}
            vmRef={vmRef}
          />
        </Layout>
      </div>
    </ThemeProvider>
  );
}
