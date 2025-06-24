import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseComponentClient } from "@/utils/supabase/component";
import { SupabaseClient } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { AtSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState } from "react";

export default function SignUpPage() {
  // Create necessary hooks for clients and providers.
  const router = useRouter();
  const supabase = createSupabaseComponentClient();
  const queryClient = useQueryClient();
  // Create states for each field in the form.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmedPassword] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const signUp = async () => {
    // https://supabase.com/docs/guides/auth/server-side/nextjs?queryGroups=router&router=pages
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name, email: email, password: password },
      },
    });

    // authentication error
    if (error) {
      console.log("Sign up error:", error.message);
      alert(error);
      return;
    }

    const user = data.user;
    if (!user) {
      alert("Failed to create user.");
      return;
    }

    // user uploads photo
    try {
      await assignProfilePicture(supabase, user.id, selectedFile);
    } catch (uploadError) {
      console.error("Error uploading profile picture:", uploadError);
      alert("Failed to upload profile picture.");
    }

    // given code to reset the user_profile query to refresh header data
    queryClient.resetQueries({ queryKey: ["user_profile"] });

    // redirect to home page
    router.push("/");
  };

  // functionality borrowed from update profile photo in signup
  const assignProfilePicture = async (
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

    // generate a unique filename for the avatar (to store in supabase)
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    const { data: fileData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const publicUrl = supabase.storage.from("avatars").getPublicUrl(filePath)
      .data.publicUrl;

    const { error: updateError } = await supabase
      .from("profile")
      .update({ avatar_url: filePath })
      .eq("id", userId);

    if (updateError) throw updateError;
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Fixed Logo */}
      <div className="fixed -top-10 left-0 p-4 z-50">
        <img
          src="/ByteNotesLogo.png"
          alt="ByteNotes Logo"
          className="w-[186px] object-contain"
        />
      </div>

      {/* Centered Signup Card */}
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md rounded-lg border border-border bg-card/80 backdrop-blur-md p-6 shadow-lg">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Sign up</h1>
            <p className="text-sm text-muted-foreground">
              Create your account here. Welcome to Byte Notes!
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Profile Photo */}
            <div className="grid gap-2">
              <Label htmlFor="photo">Upload Profile Photo</Label>
              <Input
                id="photo"
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
                className="w-full"
              >
                {selectedFile ? "Photo Selected" : "Upload"}
              </Button>
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ajay Gandecha"
                required
              />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ajay@cs.unc.edu"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Repeat password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmedPassword(e.target.value)}
                placeholder="Repeat your password"
                required
              />
            </div>

            <Button className="w-full bg-blue-400" onClick={signUp}>
              Sign up
            </Button>
          </div>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
  ``;
}
