/**
 * 共享状态组件
 *
 * 收敛 7+ 个页面里几乎逐字重复的加载 / 错误 / 空状态 / 返回链接，
 * 统一样式与无障碍语义。保留 liquid-glass 皮肤的视觉语言（glass-card、
 * destructive token、虚线边框空状态），不引入新组件库。
 */

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CircleAlert, ArrowLeft, type LucideIcon } from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*                              LoadingState                                   */
/* -------------------------------------------------------------------------- */

interface LoadingStateProps {
  /** 顶部图标，默认一个骨架方块占位 */
  icon?: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
}

/**
 * 统一的加载骨架：w-16 h-16 rounded-2xl bg-muted animate-pulse
 */
export function LoadingState({
  icon,
  title = '正在加载...',
  subtitle = '请稍候',
  className,
}: LoadingStateProps) {
  return (
    <div className={cn('glass-card text-center p-12', className)}>
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center animate-pulse">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold mb-2 text-foreground">{title}</h3>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               ErrorState                                    */
/* -------------------------------------------------------------------------- */

interface ErrorStateProps {
  message: string
  /** 重试按钮文案；传 undefined 则不显示重试按钮 */
  onRetry?: () => void
  retryLabel?: string
  /** 返回链接地址；传 undefined 则不显示返回链接 */
  backHref?: string
  backLabel?: string
  className?: string
}

/**
 * 统一的错误状态：destructive 圆圈图标 + 文案 + 可选重试 / 返回
 */
export function ErrorState({
  message,
  onRetry,
  retryLabel = '重新加载',
  backHref,
  backLabel = '返回列表',
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('glass-card border border-destructive/40 text-destructive p-6', className)}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
          <CircleAlert className="w-5 h-5 text-destructive" strokeWidth={2} />
        </div>
        <p className="font-medium break-words">{message}</p>
      </div>
      {(onRetry || backHref) && (
        <div className="flex items-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-sm font-medium text-destructive hover:underline"
            >
              {retryLabel}
            </button>
          )}
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              {backLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               EmptyState                                    */
/* -------------------------------------------------------------------------- */

interface EmptyStateProps {
  /** 空状态图标 */
  icon?: React.ReactNode
  title: string
  description?: string
  /** 可选操作区（按钮等） */
  action?: React.ReactNode
  className?: string
}

/**
 * 统一的空状态：虚线边框 + 图标 + 标题 + 描述 + 可选操作
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'text-center py-12 px-6 text-muted-foreground rounded-xl border border-dashed border-border/60 bg-muted/5',
        className,
      )}
    >
      {icon && <div className="mx-auto mb-4 flex justify-center">{icon}</div>}
      <h3 className="text-2xl font-semibold mb-2 text-foreground">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                BackLink                                     */
/* -------------------------------------------------------------------------- */

interface BackLinkProps {
  href: string
  label?: string
  className?: string
  /** 覆盖默认图标 */
  icon?: LucideIcon
}

/**
 * 统一的返回链接：ArrowLeft + 文字，glass 质感胶囊
 */
export function BackLink({
  href,
  label = '返回列表',
  className,
  icon: Icon = ArrowLeft,
}: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center px-6 py-3 rounded-2xl glass card-hover border-primary/20 hover:border-primary/40 transition-all',
        className,
      )}
    >
      <Icon className="w-5 h-5 mr-2" strokeWidth={2} />
      {label}
    </Link>
  )
}
