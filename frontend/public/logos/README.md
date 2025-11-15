# Logo 文件说明

这个目录用于存放不同赛事的 logo 图片。

## 文件命名规范

- `scc.png` - Summer Championship (夏季锦标赛)
- `wcc.png` - Winter Championship (冬季锦标赛)
- 其他赛事可以按照类似的命名规范添加

## 使用方法

在 `frontend/src/services/configService.ts` 中配置 `logo_filename` 字段：

```typescript
{
  logo_filename: "scc.png",  // 指定要使用的 logo 文件名
  site_name: "S2CC",         // 网站名称
  site_abbr: "SC"            // 缩写（用于导航栏图标，当没有 logo 图片时显示）
}
```

## 图片要求

- 格式：PNG（推荐）或 JPG
- 尺寸：建议 64x64 或更高分辨率的正方形图片
- 背景：透明背景（PNG）效果最佳
