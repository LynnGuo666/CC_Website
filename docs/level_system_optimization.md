# 用户等级系统优化

## 概述

优化后的等级系统将等级信息预计算并存储在数据库中，避免了每次访问时的重复计算，大大提升了性能。

## 数据库变更

在 `users` 表中添加了两个新字段：
- `game_level`: VARCHAR，存储用户等级 (S/A/B/C/D)
- `level_progress`: FLOAT，存储等级内的进度百分比

## 等级分配规则

基于用户在所有参与者中的排名百分比：
- **S级**: 前10%的用户
- **A级**: 前11%-30%的用户  
- **B级**: 前31%-60%的用户
- **C级**: 前61%-90%的用户
- **D级**: 后10%的用户

## 使用方法

### 1. 数据库迁移（一次性）
```bash
python migrate_add_level_fields.py
```

### 2. 数据导入后更新等级
每次导入新的比赛数据或重新计算标准分后，运行：
```bash
python update_user_levels.py
```

### 3. 自动更新（推荐）
等级会在以下情况自动更新：
- 调用 `calculate_standard_scores_for_match()` 后
- 调用 `calculate_standard_scores_for_match_game()` 后  
- 调用 `StandardScoreCalculator.update_all_users_standard_score_stats()` 后

## 优势

1. **性能优化**: 等级信息预计算存储，API响应速度大幅提升
2. **动态平衡**: 基于排名百分比的等级分配，确保合理的等级分布
3. **自动维护**: 标准分更新后自动重新计算等级
4. **数据一致性**: 所有排行榜和统计功能使用相同的等级数据

## API变更

- `GET /users/leaderboard`: 现在直接从数据库读取等级，响应更快
- `GET /users/leaderboard/level-distribution`: 直接统计数据库中的等级字段
- 用户模型不再包含动态计算的 `game_level` 和 `level_progress` 属性

## 维护

- 每次重大数据更新后运行 `update_user_levels.py`
- 监控等级分布是否符合预期（S:10%, A:20%, B:30%, C:30%, D:10%）
- 如需调整等级分配规则，修改相关函数中的百分比阈值
