import { createClient } from "@/lib/supabase/client";
import { create } from "domain";
import { useEffect, useState } from "react";

export const useCurrentUserImage = () => {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserImage = async () => {
      const supabase = createClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession(); 

      if (sessionError || !session?.user?.id) {
        console.error("Failed to get session or user:", sessionError);
        return;
      }

      const userId = session.user.id;

      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("avatar_url")
        .eq("id", userId)
        .single();

      if (profileError || !profile?.avatar_url) {
        console.error("Failed to get profile or avatar:", profileError);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(profile.avatar_url);

      setImage(publicUrlData.publicUrl ?? null);

    };
    fetchUserImage();
  }, []);

  console.log("Image URL:", image);

  return image;
};
