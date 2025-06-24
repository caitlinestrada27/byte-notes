"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThemeToggle({
  theme,
  setTheme,
}: {
  theme: string | undefined;
  setTheme: Dispatch<SetStateAction<string>>;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        "relative w-16 h-9 rounded-full transition-colors",
        isDark ? "bg-background" : "bg-gray-300"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-8 w-8 bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-300",
          isDark && "translate-x-7"
        )}
      >
        {isDark ? (
          <Moon className="h-5 w-5 text-blue-400" />
        ) : (
          <Sun className="h-5 w-5 text-yellow-500" />
        )}
      </span>
    </button>
  );
}
