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
            
            # 计算等级
            if percentile <= 10:
                level = 'S'
                progress = ((10 - percentile) / 10) * 100
            elif percentile <= 30:
                level = 'A'
                progress = ((30 - percentile) / 20) * 100
            elif percentile <= 60:
                level = 'B'
                progress = ((60 - percentile) / 30) * 100
            elif percentile <= 90:
                level = 'C'
                progress = ((90 - percentile) / 30) * 100
            else:
                level = 'D'
                progress = ((100 - percentile) / 10) * 100
            
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
