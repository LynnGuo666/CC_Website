#!/usr/bin/env python3
"""
更新用户等级的便捷脚本
在每次导入新数据或重新计算标准分后运行此脚本
"""

import sqlite3
import sys
import os

def update_user_levels():
    """更新所有用户的等级和进度"""
    
    # 连接数据库
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    
    try:
        # 获取所有有标准分的用户，按平均标准分降序排列
        cursor.execute('''
        SELECT id, nickname, average_standard_score 
        FROM users 
        WHERE average_standard_score > 0 
        ORDER BY average_standard_score DESC
        ''')
        
        users = cursor.fetchall()
        total_users = len(users)
        
        if total_users == 0:
            print("没有找到有标准分的用户")
            return False
        
        print(f'更新 {total_users} 个用户的等级信息...')
        
        # 统计等级分布
        level_counts = {'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0}
        
        # 更新每个用户的等级
        for i, (user_id, nickname, avg_score) in enumerate(users):
            current_rank = i + 1
            percentile = (current_rank / total_users) * 100
            
            # 计算等级 (基于排名百分比)
            if current_rank <= max(1, total_users * 0.1):  # 前10%
                level = 'S'
                # 在S级内的进度：排名越靠前，进度越高
                s_users = max(1, int(total_users * 0.1))
                progress = ((s_users - (current_rank - 1)) / s_users) * 100
            elif current_rank <= max(1, total_users * 0.3):  # 前11%-30%
                level = 'A'
                # 在A级内的进度
                a_start = max(1, int(total_users * 0.1)) + 1
                a_end = max(1, int(total_users * 0.3))
                a_size = a_end - a_start + 1
                progress = ((a_end - current_rank + 1) / a_size) * 100
            elif current_rank <= max(1, total_users * 0.6):  # 前31%-60%
                level = 'B'
                # 在B级内的进度
                b_start = max(1, int(total_users * 0.3)) + 1
                b_end = max(1, int(total_users * 0.6))
                b_size = b_end - b_start + 1
                progress = ((b_end - current_rank + 1) / b_size) * 100
            elif current_rank <= max(1, total_users * 0.9):  # 前61%-90%
                level = 'C'
                # 在C级内的进度
                c_start = max(1, int(total_users * 0.6)) + 1
                c_end = max(1, int(total_users * 0.9))
                c_size = c_end - c_start + 1
                progress = ((c_end - current_rank + 1) / c_size) * 100
            else:  # 后10%
                level = 'D'
                # 在D级内的进度
                d_start = max(1, int(total_users * 0.9)) + 1
                d_size = total_users - d_start + 1
                progress = ((total_users - current_rank + 1) / d_size) * 100
            
            level_counts[level] += 1
            
            # 更新用户等级
            cursor.execute('''
            UPDATE users 
            SET game_level = ?, level_progress = ?
            WHERE id = ?
            ''', (level, round(progress, 1), user_id))
            
            if i < 10:  # 显示前10名的更新信息
                print(f'  #{current_rank} {nickname}: {level}级 ({progress:.1f}%)')
        
        conn.commit()
        
        # 显示等级分布统计
        print("\\n等级分布:")
        for level in ['S', 'A', 'B', 'C', 'D']:
            count = level_counts[level]
            percentage = (count / total_users) * 100
            print(f"  {level}级: {count} 人 ({percentage:.1f}%)")
        
        print("\\n等级更新完成!")
        return True
        
    except Exception as e:
        print(f"更新等级失败: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    if update_user_levels():
        print("等级更新成功!")
        sys.exit(0)
    else:
        print("等级更新失败!")
        sys.exit(1)
