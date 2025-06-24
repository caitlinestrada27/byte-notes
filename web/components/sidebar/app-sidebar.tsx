import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { SquareTerminal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { createSupabaseComponentClient } from "@/utils/supabase/component";
import {
  getNotebookTreeByUser,
  getProfileData,
} from "@/utils/supabase/queries";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { BookMarked, List, FileText, Plus } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import NewButton from "./new-button";
import { cn } from "@/lib/utils";

export function AppSidebar({
  activePageId,
  setActivePageId,
}: {
  activePageId: string;
  setActivePageId: Dispatch<SetStateAction<string>>;
}) {
  const supabase = createSupabaseComponentClient();
  const queryClient = useQueryClient();

  // Get current authenticated user
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

  // handles renaming item in database when user right clicks in sidebar
  const [newName, setNewName] = useState("");
  async function handleRenameSidebarItem(
    id: string,
    type: string
  ): Promise<void> {
    const { error } = await supabase
      .from(type)
      .update({ title: newName })
      .eq("id", id);

    setNewName("");
    if (error) {
      toast(`Error renaming ${type}: ${error.message}`);
    } else {
      toast(
        `${
          type.charAt(0).toUpperCase() + type?.slice(1)
        } name updated successfully!`
      );
      await queryClient.invalidateQueries({ queryKey: ["notebook_tree"] });
    }
  }

  // handles deleting item from database when user right clicks in sidebar
  async function handleDeleteSidebarItem(
    id: string,
    type: string
  ): Promise<void> {
    const { error } = await supabase.from(type).delete().eq("id", id);

    if (error) {
      toast.error(`Failed to delete ${type}.`);
      return;
    }

    toast(`${type.charAt(0).toUpperCase() + type?.slice(1)} deleted!`);
    await queryClient.invalidateQueries({ queryKey: ["notebook_tree"] });

    // If the page that was deleted was the active page, reset to "no page selected" view
    if (activePageId === id) {
      setActivePageId("");
    }
  }

  return (
    <Sidebar className="h-[calc(100vh-115px)] mt-[115px] bg-sidebar text-sidebar-foreground">
      <SidebarContent className="mt-1">
        {notebookTree?.map((notebook, notebookIdx) => (
          <SidebarGroup key={notebookIdx}>
            {/* Notebook(s) Title */}
            <SidebarGroupLabel className="text-left">
              <ContextMenu>
                <ContextMenuTrigger>
                  <p className="text-[11px] text-muted-foreground uppercase text-left tracking-wider px-2 pt-3 pb-1">
                    {notebook.name}
                  </p>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48 bg-sidebar text-sidebar-foreground">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <ContextMenuItem onSelect={(e) => e.preventDefault()}>
                        Rename Notebook
                      </ContextMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Rename Notebook</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to rename {notebook.name}? This
                          action cannot be undone.
                          <Input
                            className="mt-2"
                            placeholder={"New name..."}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                          />
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleRenameSidebarItem(notebook.id, "notebook")
                          }
                          className="bg-blue-400"
                        >
                          Save
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <ContextMenuItem onSelect={(e) => e.preventDefault()}>
                        Delete Notebook
                      </ContextMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to delete this notebook?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the notebook (including all associated pages)
                          and remove its data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDeleteSidebarItem(notebook.id, "notebook")
                          }
                          className="bg-destructive"
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </ContextMenuContent>
              </ContextMenu>
            </SidebarGroupLabel>
            {/* Chapter(s) Title */}
            <SidebarGroupContent>
              <SidebarMenu>
                {notebook.chapter.map((chapter, chapterIdx) => (
                  <Collapsible key={chapterIdx} className="pl-2 pr-2 group">
                    <SidebarGroup className="p-0 mb-1">
                      <SidebarGroupLabel asChild className="text-left">
                        <ContextMenu>
                          <ContextMenuTrigger>
                            {chapter.page.length > 0 ? (
                              <CollapsibleTrigger
                                className={`flex items-center justify-between w-full py-1.5 text-[13px] font-medium rounded-md transition pl-2 ${
                                  chapter.page.length > 0
                                    ? "text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                                    : "text-muted-foreground cursor-default"
                                }`}
                              >
                                <SquareTerminal
                                  strokeWidth={1.5}
                                  size={16}
                                  className="mr-2"
                                />
                                <p className="text-left font-medium text-sm">
                                  {chapter.name}
                                </p>
                                <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-0 group-data-[state=closed]:-rotate-90" />
                              </CollapsibleTrigger>
                            ) : (
                              <div className="flex items-center justify-start w-full py-1.5 text-foreground text-[13px] font-medium pl-2 opacity-70">
                                <SquareTerminal
                                  strokeWidth={1.5}
                                  size={16}
                                  className="mr-2"
                                />
                                <p className="text-left font-medium text-sm">
                                  {chapter.name}
                                </p>
                                <ChevronDown className="ml-auto h-4 w-4 rotate-270" />
                              </div>
                            )}
                          </ContextMenuTrigger>
                          <ContextMenuContent className="w-48 bg-sidebar text-sidebar-foreground">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <ContextMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  Rename Chapter
                                </ContextMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Rename Chapter
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to rename{" "}
                                    {chapter.name}? This action cannot be
                                    undone.
                                    <Input
                                      className="mt-2"
                                      placeholder={"New name..."}
                                      value={newName}
                                      onChange={(e) =>
                                        setNewName(e.target.value)
                                      }
                                    />
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleRenameSidebarItem(
                                        chapter.id,
                                        "chapter"
                                      )
                                    }
                                    className="bg-blue-400"
                                  >
                                    Save
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <ContextMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  Delete Chapter
                                </ContextMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure you want to delete this
                                    chapter?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the chapter and remove
                                    its data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteSidebarItem(
                                        chapter.id,
                                        "chapter"
                                      )
                                    }
                                    className="bg-destructive"
                                  >
                                    Continue
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </ContextMenuContent>
                        </ContextMenu>
                      </SidebarGroupLabel>

                      {/* Page(s) Title */}
                      <CollapsibleContent>
                        <SidebarMenuSub className="pl-4 space-y-1">
                          {chapter.page.map((page, pageIdx) => (
                            <SidebarMenuSubItem key={pageIdx} className="pl-1">
                              <ContextMenu>
                                <ContextMenuTrigger
                                  onClick={() => setActivePageId(page.id)}
                                >
                                  <Button
                                    variant="ghost"
                                    className={cn(
                                      "px-3 py-0 m-0 -ml-2.5 text-[13px] rounded text-left hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                                      activePageId === page.id
                                        ? "bg-sidebar-primary text-sidebar-primary-foreground" // color when selected
                                        : "text-muted-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground" // default + hover
                                    )}
                                  >
                                    <p className="-ml-1 truncate">
                                      {page.name}
                                    </p>
                                  </Button>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-48 bg-sidebar text-sidebar-foreground">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <ContextMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        Rename Page
                                      </ContextMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Rename Page
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to rename{" "}
                                          <b>{page.name}</b>? This action cannot
                                          be undone.
                                          <Input
                                            className="mt-2"
                                            placeholder={"New name..."}
                                            value={newName}
                                            onChange={(e) =>
                                              setNewName(e.target.value)
                                            }
                                          />
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleRenameSidebarItem(
                                              page.id,
                                              "page"
                                            )
                                          }
                                          className="bg-blue-400"
                                        >
                                          Save
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <ContextMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        Delete Page
                                      </ContextMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Are you sure you want to delete this
                                          page?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This
                                          will permanently delete the page and
                                          remove its data from our servers.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDeleteSidebarItem(
                                              page.id,
                                              "page"
                                            )
                                          }
                                          className="bg-red-600"
                                        >
                                          Continue
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </ContextMenuContent>
                              </ContextMenu>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarGroup>
                  </Collapsible>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            <Separator className="m-0 mt-5 -mb-2.5 p-0 bg-border opacity-50" />
          </SidebarGroup>
        ))}
      </SidebarContent>
      {/* + New */}
      <NewButton
        profileData={profileData}
        notebookTree={notebookTree ?? []}
        onItemCreated={async () => {
          await queryClient.invalidateQueries({ queryKey: ["notebook_tree"] });
        }}
      />
    </Sidebar>
  );
}
