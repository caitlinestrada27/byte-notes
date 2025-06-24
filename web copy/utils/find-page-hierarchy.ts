import { NotebookTreeType } from "./supabase/queries";

// Loop through a given notebookTree to find a specific page's corresponding chapter & notebook (used to update file path)
// Returns the notebook, chapter, and page, or null if the page does not exist in the given tree

// truly sorry about the name of this function; please do feel free to change if you can think of something better
export function getPageHierarchyById({
  notebookTree,
  pageId,
}: {
  notebookTree: NotebookTreeType[];
  pageId: string;
}) {
  for (const notebook of notebookTree) {
    for (const chapter of notebook.chapter) {
      for (const page of chapter.page) {
        if (page.id === pageId) {
          return { notebook, chapter, page };
        }
      }
    }
  }
  return null;
}
