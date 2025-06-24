import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Send, Clipboard, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface SendButtonProps {
  activePageId: string;
}

export default function SendButton({ activePageId }: SendButtonProps) {
  // Handle opening a page from the sidebar

  // Copies link to clipboard and displays toast when user clicks Send button
  function sendLink(method: "copy" | "email" | "sms"): void {
    const link = `${window.location.origin}/${activePageId}`;

    switch (method) {
      case "copy":
        navigator.clipboard.writeText(link);
        toast("Link copied to clipboard!");
        break;
      case "email":
        window.location.href = `mailto:?subject=Check out this page&body=${encodeURIComponent(
          link
        )}`;
        break;
      case "sms":
        window.location.href = `sms:?body=${encodeURIComponent(link)}`;
        break;
      default:
        break;
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex flex-row items-center gap-1">
          <Send className="h-4 w-4" />
          Send
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              sendLink("copy");
            }}
            className="flex flex-row items-center gap-2"
          >
            <Clipboard className="h-4 w-4" />
            Copy Link
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              sendLink("email");
            }}
            className="flex flex-row items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              sendLink("sms");
            }}
            className="flex flex-row items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            SMS
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
