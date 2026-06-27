"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Monitor } from "lucide-react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0"
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" strokeWidth={2} />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0 hover:bg-white/10 transition-all duration-200 focus-ring"
    >
      <Sun
        className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        strokeWidth={2}
      />
      <Moon
        className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        strokeWidth={2}
      />
      <Monitor
        className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${theme === "system" ? "scale-100" : "scale-0"}`}
        strokeWidth={2}
      />
      <span className="sr-only">切换主题 (当前: {theme === "light" ? "浅色" : theme === "dark" ? "深色" : "跟随系统"})</span>
    </Button>
  )
}
