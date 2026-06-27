'use client';

import { useSeasonTheme } from '@/contexts/season-theme-context';
import { Button } from '@/components/ui/button';
import { Palette, Flower2, Sun, Wheat, Snowflake, type LucideIcon } from 'lucide-react';

const seasonIcons: Record<string, LucideIcon> = {
  default: Palette,
  spring: Flower2,
  summer: Sun,
  autumn: Wheat,
  winter: Snowflake,
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
        {(() => {
          const Icon = seasonIcons[season] ?? seasonIcons.default;
          return <Icon className="w-5 h-5" strokeWidth={2} />;
        })()}
      </span>
    </Button>
  );
}
