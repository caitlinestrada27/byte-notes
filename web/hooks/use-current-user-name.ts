import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export const useCurrentUserName = () => {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileName = async () => {
      const { data, error } = await createClient().auth.getSession();
      if (error) {
        console.error(error);
      }

      setName(data.session?.user.user_metadata.display_name ?? "?");
    };

    fetchProfileName();
  }, []);

  console.log("Username", name);

  return name || "?";
};
