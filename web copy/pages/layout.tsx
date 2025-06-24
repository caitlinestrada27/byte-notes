import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Dispatch, SetStateAction } from "react";

export default function Layout({
  children,
  activePageId,
  setActivePageId,
  showSidebar = true,
}: {
  children: React.ReactNode;
  activePageId: string;
  setActivePageId: Dispatch<SetStateAction<string>>;
  showSidebar?: boolean;
}) {
  return (
    <div className="flex h-[calc(100vh-175px)]">
      <SidebarProvider>
        {showSidebar && (
          <AppSidebar
            activePageId={activePageId ?? ""}
            setActivePageId={setActivePageId ?? (() => {})}
          />
        )}
        <main className="flex-1 flex">{children}</main>
        <Toaster />
      </SidebarProvider>
    </div>
  );
}
