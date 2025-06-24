// components/header/profile-menu.tsx

"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { SupabaseClient } from "@supabase/supabase-js";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { getProfileData } from "@/utils/supabase/queries";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type ProfileProps = {
  profileData: any;
  supabase: SupabaseClient;
  onSignOut: () => void;
  onProfileUpdate?: () => Promise<void>;
};

export default function Profile({
  supabase,
  onSignOut,
}: ProfileProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");

  const { data: profileData } = useQuery({
    queryKey: ["user_profile"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      if (!data) return null;
      return await getProfileData(supabase, data.user!.id);
    },
  });

  useEffect(() => {
    if (profileData?.display_name) {
      setDisplayName(profileData.display_name);
    }
  }, [profileData]);

   // Updates the database when the user changes their display name or avatar
  const handleUpdateProfile = async () => {
    if (!profileData) return;

    let changed = false;

    // Upload avatar if a new file was selected
    if (selectedFile) {
      try {
        await updateProfilePicture(supabase, profileData.id, selectedFile);
        toast.success("Profile photo updated!");
        setSelectedFile(null);
        changed = true;
      } catch (error: any) {
        toast.error(`Failed to update profile photo: ${error.message}`);
      }
    }

    // Update display name if changed
    if (displayName !== profileData.display_name) {
      const { error: profileError } = await supabase
        .from("profile")
        .update({ display_name: displayName })
        .eq("id", profileData.id);

      if (profileError) {
        toast.error(`Error changing display name: ${profileError.message}`);
        return;
      }

      toast.success("Display name successfully changed!");
      changed = true;
    }

    // Refresh profile if something changed
    if (changed) {
      await queryClient.refetchQueries({ queryKey: ["user_profile"] });
    }
  };

  const updateProfilePicture = async (
    supabase: SupabaseClient,
    userId: string,
    file: File | null
  ): Promise<void> => {
    if (!file) {
      const { error } = await supabase
        .from("profile")
        .update({ avatar_url: null })
        .eq("id", userId);
      if (error) throw error;
      return;
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { error: updateError } = await supabase
      .from("profile")
      .update({ avatar_url: filePath })
      .eq("id", userId);

    if (updateError) throw updateError;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="flex items-center gap-3 rounded-md px-3 py-1.5 h-14 justify-start max-w-full overflow-hidden"
          variant="secondary"
        >
          <div className="flex items-center gap-3 mr-12 max-w-full overflow-hidden">
            <Avatar className="w-9 h-9">
              <AvatarImage
                className="object-cover"
                src={
                  profileData?.avatar_url
                    ? supabase.storage
                        .from("avatars")
                        .getPublicUrl(profileData.avatar_url).data.publicUrl
                    : ""
                }
                alt={`${profileData?.display_name} avatar`}
              />
              <AvatarFallback>
                {profileData?.display_name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-start leading-tight truncate">
              <p className="text-sm font-medium truncate">
                {profileData?.display_name}
              </p>
              <p className="text-xs text-secondary-foreground truncate">
                {profileData?.email}
              </p>
            </div>
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="photo" className="text-left">
              Upload Photo
            </Label>
            {profileData?.id && (
              <>
                <Input
                  className="hidden"
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) =>
                    setSelectedFile(
                      (e.target.files ?? []).length > 0
                        ? e.target.files![0]
                        : null
                    )
                  }
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="col-span-3"
                >
                  {selectedFile ? "Photo Selected" : "Upload"}
                </Button>
              </>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="display-name" className="text-left">
              Display Name
            </Label>
            <Input
              id="display-name"
              className="col-span-3 text-center"
              value={displayName}
              placeholder={profileData?.display_name}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <DialogClose>
            <Button
            type="submit"
            className="bg-blue-400"
            onClick={handleUpdateProfile}>
            Update Profile
          </Button>
          </DialogClose>
        </div>
        <DialogFooter>
          <div className="flex justify-between w-full">
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              className="align-content-start"
              onClick={onSignOut}
            >
              Sign out
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
