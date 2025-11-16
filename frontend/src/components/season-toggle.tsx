'use client';

import { useSeasonTheme } from '@/contexts/season-theme-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const seasonIcons = {
  default: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  spring: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  summer: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  autumn: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {/* 小麦图标 */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C10 4 9 6 9 8c0 1 .5 2 1.5 2.5M12 2c2 2 3 4 3 6 0 1-.5 2-1.5 2.5M12 2v20M9 8c-1.5.5-2.5 1.5-2.5 2.5 0 2 1 4 3 6M15 8c1.5.5 2.5 1.5 2.5 2.5 0 2-1 4-3 6" />
      <circle cx="12" cy="20" r="2" fill="currentColor" />
    </svg>
  ),
  winter: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M2 12h20M6 6l12 12M6 18L18 6" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} fill="none" />
    </svg>
  ),
};

const seasonLabels = {
  default: '默认',
  spring: '春日',
  summer: '夏日',
  autumn: '秋日',
  winter: '冬日',
};

export function SeasonToggle() {
  const { season, setSeason } = useSeasonTheme();

  const toggleSeason = () => {
    // 在默认和自动季节之间切换
    if (season === 'default') {
      // 根据月份设置季节
      const month = new Date().getMonth() + 1;
      let autoSeason: 'spring' | 'summer' | 'autumn' | 'winter' = 'spring';

      if (month >= 3 && month <= 5) autoSeason = 'spring';
      else if (month >= 6 && month <= 8) autoSeason = 'summer';
      else if (month >= 9 && month <= 11) autoSeason = 'autumn';
      else autoSeason = 'winter';

      setSeason(autoSeason);
    } else {
      setSeason('default');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSeason}
      className="relative rounded-2xl w-9 h-9 hover:bg-white/10 transition-all"
      title={season === 'default' ? '切换到季节主题' : `当前：${seasonLabels[season]}，点击切换到默认主题`}
    >
      <span className="text-foreground/70">
        {seasonIcons[season]}
      </span>
    </Button>
  );
}
