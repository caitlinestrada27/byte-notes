/**
 * This file contains utility functions for updating the reaction data
 * cached by React Query. Thank you Ajay and Jade!
 */

import { z } from "zod";
import { Reaction } from "../models";
import { InfiniteData, QueryClient } from "@tanstack/react-query";

/** Generates a function that adds a reaction to the cache. */
export const addReactionToCacheFn =
  (queryClient: QueryClient, pageId: string) =>
  (reaction: z.infer<typeof Reaction>) => {
    queryClient.setQueryData(
      ["page_reactions", pageId],
      (oldData: z.infer<typeof Reaction>[] = []) => {
        return [...oldData, reaction];
      }
    );
  };

/** Generates a function that removes a reaction from the cache. */
export const removeReactionFromCacheFn =
  (queryClient: QueryClient, pageId: string) => (reactionId: string) => {
    queryClient.setQueryData(
      ["page_reactions", pageId],
      (oldData: z.infer<typeof Reaction>[] = []) => {
        return oldData.filter((reaction) => reaction.id !== reactionId);
      }
    );
  };
