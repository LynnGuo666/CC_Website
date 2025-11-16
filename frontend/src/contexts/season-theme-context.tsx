'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type SeasonTheme = 'spring' | 'summer' | 'autumn' | 'winter' | 'default';

interface SeasonThemeContextType {
  season: SeasonTheme;
  setSeason: (season: SeasonTheme) => void;
}

const SeasonThemeContext = createContext<SeasonThemeContextType | undefined>(undefined);

export function SeasonThemeProvider({ children }: { children: React.ReactNode }) {
  const [season, setSeasonState] = useState<SeasonTheme>('default');

  useEffect(() => {
    // 从 localStorage 加载保存的主题
    const saved = localStorage.getItem('season-theme') as SeasonTheme;
    if (saved) {
      setSeasonState(saved);
      applySeasonTheme(saved);
    } else {
      // 根据当前月份自动设置季节
      const month = new Date().getMonth() + 1;
      let autoSeason: SeasonTheme = 'default';

      if (month >= 3 && month <= 5) autoSeason = 'spring';
      else if (month >= 6 && month <= 8) autoSeason = 'summer';
      else if (month >= 9 && month <= 11) autoSeason = 'autumn';
      else if (month === 12 || month <= 2) autoSeason = 'winter';

      setSeasonState(autoSeason);
      applySeasonTheme(autoSeason);
    }
  }, []);

  const setSeason = (newSeason: SeasonTheme) => {
    setSeasonState(newSeason);
    localStorage.setItem('season-theme', newSeason);
    applySeasonTheme(newSeason);
  };

  const applySeasonTheme = (theme: SeasonTheme) => {
    const html = document.documentElement;

    // 移除所有季节类
    html.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');

    // 添加新的季节类到 html 元素
    if (theme !== 'default') {
      html.classList.add(`season-${theme}`);
      console.log(`Applied season theme: season-${theme}`);
    } else {
      console.log('Applied default theme');
    }

    // 强制重新渲染
    html.style.setProperty('--season-transition', 'all 0.5s ease');
  };

  return (
    <SeasonThemeContext.Provider value={{ season, setSeason }}>
      {children}
    </SeasonThemeContext.Provider>
  );
}

export function useSeasonTheme() {
  const context = useContext(SeasonThemeContext);
  if (context === undefined) {
    throw new Error('useSeasonTheme must be used within a SeasonThemeProvider');
  }
  return context;
}
