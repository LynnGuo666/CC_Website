/**
 * 状态色 / 分类色统一映射层
 *
 * 把散落在各页面、组件里的颜色映射集中到这里，返回统一的
 * `{ label, text, bg, dot, border? }` 结构。值仍是 Tailwind 类字符串，
 * 与现有用法保持兼容，不引入硬编码色之外的样式。
 *
 * - 比赛状态以 `matches/page.tsx` 的「ongoing = 绿色」为准，
 *   修正 `matches/[id]/page.tsx` 之前的「ongoing = 蓝色」矛盾。
 * - 游戏等级合并 `services/leaderboardService.ts` 的 `getLevelStyle`
 *   与 `score-timeline.tsx` 的本地 `getLevelStyle` 两份实现。
 * - 平台色 / 视频类型色合并 `video-card.tsx` 与 `match-video-section.tsx`。
 */

export interface StatusStyle {
  /** 中文文案 */
  label: string
  /** 文字色（Tailwind 类，如 `text-green-500`） */
  text: string
  /** 背景色（Tailwind 类，如 `bg-green-500/10`） */
  bg: string
  /** 圆点 / 强调背景色（实心，如 `bg-green-500`） */
  dot: string
  /** 可选边框色（Tailwind 类，如 `border-green-500/30`） */
  border?: string
}

/* -------------------------------------------------------------------------- */
/*                               比赛状态                                       */
/* -------------------------------------------------------------------------- */

type MatchStatus =
  | 'preparing'
  | 'ongoing'
  | 'finished'
  | 'cancelled'
  | 'unknown'

const MATCH_STATUS_STYLES: Record<MatchStatus, StatusStyle> = {
  preparing: {
    label: '筹办中',
    text: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    dot: 'bg-yellow-500',
    border: 'border-yellow-500/30',
  },
  ongoing: {
    label: '进行中',
    text: 'text-green-500',
    bg: 'bg-green-500/10',
    dot: 'bg-green-500',
    border: 'border-green-500/30',
  },
  finished: {
    label: '已结束',
    text: 'text-gray-500',
    bg: 'bg-gray-500/10',
    dot: 'bg-gray-500',
    border: 'border-gray-500/30',
  },
  cancelled: {
    label: '已取消',
    text: 'text-red-500',
    bg: 'bg-red-500/10',
    dot: 'bg-red-500',
    border: 'border-red-500/30',
  },
  unknown: {
    label: '未知',
    text: 'text-gray-400',
    bg: 'bg-gray-400/10',
    dot: 'bg-gray-400',
    border: 'border-gray-400/30',
  },
}

export function getMatchStatusStyle(status: string): StatusStyle {
  if (status in MATCH_STATUS_STYLES) {
    return MATCH_STATUS_STYLES[status as MatchStatus]
  }
  return MATCH_STATUS_STYLES.unknown
}

/* -------------------------------------------------------------------------- */
/*                               游戏等级                                       */
/* -------------------------------------------------------------------------- */

type GameLevel = 'S' | 'A' | 'B' | 'C' | 'D' | 'unknown'

const GAME_LEVEL_STYLES: Record<GameLevel, StatusStyle> = {
  S: {
    label: 'S',
    text: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    dot: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    border: 'border-yellow-400',
  },
  A: {
    label: 'A',
    text: 'text-green-500',
    bg: 'bg-green-500/10',
    dot: 'bg-gradient-to-r from-green-400 to-green-600',
    border: 'border-green-400',
  },
  B: {
    label: 'B',
    text: 'text-blue-500',
    bg: 'bg-blue-500/10',
    dot: 'bg-gradient-to-r from-blue-400 to-blue-600',
    border: 'border-blue-400',
  },
  C: {
    label: 'C',
    text: 'text-orange-500',
    bg: 'bg-orange-500/10',
    dot: 'bg-gradient-to-r from-orange-400 to-orange-600',
    border: 'border-orange-400',
  },
  D: {
    label: 'D',
    text: 'text-gray-500',
    bg: 'bg-gray-500/10',
    dot: 'bg-gradient-to-r from-gray-400 to-gray-600',
    border: 'border-gray-400',
  },
  unknown: {
    label: '?',
    text: 'text-gray-500',
    bg: 'bg-gray-500/10',
    dot: 'bg-gray-500',
    border: 'border-gray-400',
  },
}

export function getGameLevelStyle(level?: string | null): StatusStyle {
  if (level && level in GAME_LEVEL_STYLES) {
    return GAME_LEVEL_STYLES[level as GameLevel]
  }
  return GAME_LEVEL_STYLES.unknown
}

/* -------------------------------------------------------------------------- */
/*                                视频平台                                      */
/* -------------------------------------------------------------------------- */

type Platform =
  | 'bilibili'
  | 'youtube'
  | 'twitch'
  | 'douyu'
  | 'huya'
  | 'other'

const PLATFORM_STYLES: Record<Platform, StatusStyle> = {
  bilibili: {
    label: 'Bilibili',
    text: 'text-pink-500',
    bg: 'bg-pink-500/20',
    dot: 'bg-pink-500',
    border: 'border-pink-500/50',
  },
  youtube: {
    label: 'YouTube',
    text: 'text-red-500',
    bg: 'bg-red-500/20',
    dot: 'bg-red-500',
    border: 'border-red-500/50',
  },
  twitch: {
    label: 'Twitch',
    text: 'text-purple-500',
    bg: 'bg-purple-500/20',
    dot: 'bg-purple-500',
    border: 'border-purple-500/50',
  },
  douyu: {
    label: 'Douyu',
    text: 'text-orange-500',
    bg: 'bg-orange-500/20',
    dot: 'bg-orange-500',
    border: 'border-orange-500/50',
  },
  huya: {
    label: 'Huya',
    text: 'text-yellow-500',
    bg: 'bg-yellow-500/20',
    dot: 'bg-yellow-500',
    border: 'border-yellow-500/50',
  },
  other: {
    label: 'Link',
    text: 'text-gray-500',
    bg: 'bg-gray-500/20',
    dot: 'bg-gray-500',
    border: 'border-gray-500/50',
  },
}

export function getPlatformStyle(platform: string): StatusStyle {
  const key = platform?.toLowerCase() as Platform
  if (key in PLATFORM_STYLES) {
    return PLATFORM_STYLES[key]
  }
  return PLATFORM_STYLES.other
}

/* -------------------------------------------------------------------------- */
/*                               视频类型                                       */
/* -------------------------------------------------------------------------- */

type VideoType = 'livestream' | 'replay' | 'highlight'

const VIDEO_TYPE_STYLES: Record<VideoType, StatusStyle> = {
  livestream: {
    label: '直播',
    text: 'text-white',
    bg: 'bg-red-500/80',
    dot: 'bg-red-500',
    border: 'border-red-500',
  },
  replay: {
    label: '录播',
    text: 'text-white',
    bg: 'bg-blue-500/80',
    dot: 'bg-blue-500',
    border: 'border-blue-500',
  },
  highlight: {
    label: '集锦',
    text: 'text-white',
    bg: 'bg-amber-500/80',
    dot: 'bg-amber-500',
    border: 'border-amber-500',
  },
}

export function getVideoTypeStyle(type: string): StatusStyle {
  if (type && type in VIDEO_TYPE_STYLES) {
    return VIDEO_TYPE_STYLES[type as VideoType]
  }
  // 默认按录播处理，避免空白徽标
  return VIDEO_TYPE_STYLES.replay
}
