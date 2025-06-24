/**
 * Contains all Zod models.
 * Each model directly relates to a Supabase table and
 * contains all relevant fields for data validation.
 */

import { z } from "zod";

// Schema for reaction
export const Reaction = z.object({
  id: z.string(),
  profile_id: z.string(),
  page_id: z.string(),
  reaction_type: z.enum(["heart", "dislike", "star"]),
})

// Schema for profile data
export const Profile = z.object({
  id: z.string(),
  display_name: z.string(),
  email: z.string(),
  avatar_url: z.string().nullable(),
});

// Schema for page data
export const Page = z.object({
  id: z.string(),
  title: z.string(),
  author_id: z.string(),
  markdown: z.string(),
  code: z.string(),
  chapter_id: z.string(),
});

// Schema for chapter data
export const Chapter = z.object({
  id: z.string(),
  title: z.string(),
  notebook_id: z.string(),
});

// Schema for notebook data
export const Notebook = z.object({
  id: z.string(),
  title: z.string(),
});

// Schema for share data
export const Share = z.object({
  id: z.string(),
  page_id: z.string(),
  viewer_id: z.string(),
});

// Schema for Notebook Tree data
export const NotebookTree = z.object({
  id: z.string(),
  name: z.string(),
  chapter: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      page: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      ),
    })
  ),
});
