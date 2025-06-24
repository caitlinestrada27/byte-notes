import { FilePen } from "lucide-react";

export function NoActivePage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center h-full">
      <FilePen strokeWidth={1.5} className="h-[10vh] w-[10vh] m-[2vh]" />
      <h1 className="font-bold text-lg mb-[1vh] text-center">
        No Page Selected
      </h1>
      <h2 className="font-bold text-gray-400 text-md max-w-[40vw] text-center">
        Select a page from the sidebar or create a new one to get started.
      </h2>
    </div>
  );
}
