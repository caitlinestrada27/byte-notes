"use client";

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
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { Label } from "@radix-ui/react-label";
import { BookMarked, List, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createSupabaseComponentClient } from "@/utils/supabase/component";
import { NotebookTreeType } from "@/utils/supabase/queries";
import { starterCodeFiles, starterMarkdown } from "@/utils/starter-content";

export default function NewButton({
  profileData,
  notebookTree,
  onItemCreated,
}: NewButtonProps) {
  const supabase = createSupabaseComponentClient();

  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const [isNotebookDialogOpen, setIsNotebookDialogOpen] = useState(false);

  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [selectedNotebookId, setSelectedNotebookId] = useState("");

  const [newPageTitle, setNewPageTitle] = useState("");
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState("");

  const handleCreateNotebook = async () => {
    if (!newNotebookTitle.trim() || !profileData?.id) return;

    const { data: existing } = await supabase
      .from("notebook")
      .select("id")
      .eq("title", newNotebookTitle.trim())
      .eq("author_id", profileData.id)
      .maybeSingle();

    if (existing) return toast.error("Notebook already exists");

    const { error } = await supabase.from("notebook").insert({
      title: newNotebookTitle.trim(),
      author_id: profileData.id,
    });

    if (error) return toast.error("Failed to create notebook.");

    toast("Notebook created!");
    setNewNotebookTitle("");
    setIsNotebookDialogOpen(false);
    await onItemCreated();
  };

  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim() || !selectedNotebookId || !profileData?.id)
      return;

    const { data: existing } = await supabase
      .from("chapter")
      .select("id")
      .eq("title", newChapterTitle.trim())
      .eq("notebook_id", selectedNotebookId)
      .maybeSingle();

    if (existing) return toast.error("Chapter already exists");

    const { error } = await supabase.from("chapter").insert({
      title: newChapterTitle.trim(),
      notebook_id: selectedNotebookId,
    });

    if (error) return toast.error("Failed to create chapter.");

    toast("Chapter created!");
    setNewChapterTitle("");
    setSelectedNotebookId("");
    setIsChapterDialogOpen(false);
    await onItemCreated();
  };

  const handleCreatePage = async () => {
    if (!newPageTitle.trim() || !selectedChapterId || !profileData?.id) return;

    const { data: existing } = await supabase
      .from("page")
      .select("id")
      .eq("title", newPageTitle.trim())
      .eq("chapter_id", selectedChapterId)
      .maybeSingle();

    if (existing) return toast.error("Page already exists");

    const { error } = await supabase.from("page").insert({
      title: newPageTitle.trim(),
      chapter_id: selectedChapterId,
      markdown: starterMarkdown,
      // create new stackblitz project on every page with default values
      code_content: starterCodeFiles,
    });

    if (error) return toast.error("Failed to create page.");

    toast("Page created!");
    setNewPageTitle("");
    setSelectedChapterId("");
    setIsPageDialogOpen(false);
    await onItemCreated();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="mb-4 mr-2 ml-2 !bg-blue-400 ">+ New</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuGroup>
          {/* Notebook */}
          <Dialog
            open={isNotebookDialogOpen}
            onOpenChange={setIsNotebookDialogOpen}
          >
            <DialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className=""
              >
                <BookMarked className="h-4 w-4 mr-2" />
                New Notebook
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Notebook</DialogTitle>
                <DialogDescription>Name your new notebook</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label>Notebook</Label>
                <Input
                  value={newNotebookTitle}
                  onChange={(e) => setNewNotebookTitle(e.target.value)}
                  placeholder="Notebook name..."
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button className="bg-blue-400" onClick={handleCreateNotebook}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenuSeparator />

          {/* Chapter */}
          <Dialog
            open={isChapterDialogOpen}
            onOpenChange={setIsChapterDialogOpen}
          >
            <DialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className=""
              >
                <List className="h-4 w-4 mr-2" />
                Chapter
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Chapter</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label>Chapter</Label>
                <Input
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder="Chapter name..."
                />
                <Label>Notebook</Label>
                <Select
                  value={selectedNotebookId}
                  onValueChange={setSelectedNotebookId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select notebook" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {notebookTree?.map((nb) => (
                        <SelectItem key={nb.id} value={nb.id}>
                          {nb.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button className="bg-blue-400" onClick={handleCreateChapter}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenuSeparator />

          {/* Page */}
          <Dialog open={isPageDialogOpen} onOpenChange={setIsPageDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className=""
              >
                <FileText className="h-4 w-4 mr-2" />
                Page
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Page</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label>Page</Label>
                <Input
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  placeholder="Page name..."
                />
                <Label>Chapter</Label>
                <Select
                  value={selectedChapterId}
                  onValueChange={setSelectedChapterId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {notebookTree?.flatMap((nb) =>
                        nb.chapter.map((ch: NotebookTreeType) => (
                          <SelectItem key={ch.id} value={ch.id}>
                            {nb.name} / {ch.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button className="bg-blue-400" onClick={handleCreatePage}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type NewButtonProps = {
  profileData: any;
  notebookTree: any[];
  onItemCreated: () => Promise<void>;
};
