/**
 * Loads data for a specific profile given its ID
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { NotebookTree, Profile } from "./models";
import { z } from "zod";

// get profile data
export const getProfileData = async (
  supabase: SupabaseClient,
  profileId: string
): Promise<z.infer<typeof Profile>> => {
  const { data, error } = await supabase
    .from("profile")
    .select()
    .eq("id", profileId)
    .single();

  if (error) {
    alert(error.message);
  }

  return Profile.parse(data);
};

// get notebooks, chapters, and pages for authenicated user
export type NotebookTreeType = z.infer<typeof NotebookTree>;
export async function getNotebookTreeByUser(
  supabase: SupabaseClient,
  userId: string
): Promise<NotebookTreeType[]> {
  const { data, error } = await supabase
    .from("notebook")
    .select(
      `
      id,
      title,
      chapter (
        id,
        title,
        page (
          id,
          title
        )
      )
    `
    )
    .eq("author_id", userId);

  if (error) {
    console.error("Failed to fetch notebook tree:", error.message);
    alert(error.message);
    // return early to avoid mapping data this is null
    return [];
  }

  return data.map((notebook) => ({
    name: notebook.title,
    id: notebook.id,
    chapter: notebook.chapter.map((ch) => ({
      name: ch.title,
      id: ch.id,
      page: ch.page.map((pg) => ({
        name: pg.title,
        id: pg.id,
      })),
    })),
  }));
}
