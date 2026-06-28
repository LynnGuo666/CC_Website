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

  // 三态互斥：显隐跟随用户选择的 theme，而不是系统明暗，
  // 避免「跟随系统」时 Sun/Moon 与 Monitor 叠图。
  const isLight = theme === "light"
  const isDark = theme === "dark"
  const isSystem = theme === "system"

  // absolute inset-0 m-auto + 固定尺寸 = 在按钮内居中，切换时原位缩放
  const iconClass =
    "absolute inset-0 m-auto h-[1.2rem] w-[1.2rem] transition-all duration-300"

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative h-9 w-9 p-0 hover:bg-white/10 transition-colors duration-200 focus-ring"
    >
      {!mounted ? (
        <Sun className={iconClass} strokeWidth={2} />
      ) : (
        <>
          <Sun
            className={`${iconClass} ${isLight ? "rotate-0 scale-100" : "-rotate-90 scale-0"}`}
            strokeWidth={2}
          />
          <Moon
            className={`${iconClass} ${isDark ? "rotate-0 scale-100" : "rotate-90 scale-0"}`}
            strokeWidth={2}
          />
          <Monitor
            className={`${iconClass} ${isSystem ? "scale-100" : "scale-0"}`}
            strokeWidth={2}
          />
        </>
      )}
      <span className="sr-only">切换主题 (当前: {isLight ? "浅色" : isDark ? "深色" : "跟随系统"})</span>
    </Button>
  )
}
