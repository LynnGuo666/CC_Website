#!/usr/bin/env python3
"""
构建前端并启动 FastAPI 服务器的脚本
现在使用标准的 Next.js 开发模式
"""

import os
import sys
import subprocess
import threading
import time
from pathlib import Path

def run_command(command, cwd=None, description=""):
    """运行命令并处理错误"""
    print(f"🔄 {description}")
    print(f"   执行: {command}")
    
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            check=True,
            capture_output=True,
            text=True
        )
        print(f"✅ {description} - 成功")
        return result
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - 失败")
        print(f"错误输出: {e.stderr}")
        sys.exit(1)

def start_frontend(frontend_dir):
    """启动前端服务器"""
    print("🚀 启动前端服务器...")
    try:
        subprocess.run([
            "npm", "start"
        ], cwd=frontend_dir)
    except KeyboardInterrupt:
        print("\n🛑 前端服务器已停止")

def start_backend(project_root):
    """启动后端服务器"""
    print("🚀 启动后端服务器...")
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ], cwd=project_root)
    except KeyboardInterrupt:
        print("\n🛑 后端服务器已停止")

def main():
    # 获取项目根目录
    project_root = Path(__file__).parent
    frontend_dir = project_root / "frontend"
    
    print("🚀 准备启动前端和后端服务器")
    print(f"项目根目录: {project_root}")
    print(f"前端目录: {frontend_dir}")
    
    # 检查前端目录是否存在
    if not frontend_dir.exists():
        print("❌ 前端目录不存在!")
        sys.exit(1)
    
    # 检查 package.json 是否存在
    package_json = frontend_dir / "package.json"
    if not package_json.exists():
        print("❌ package.json 文件不存在!")
        sys.exit(1)
    
    # 步骤 1: 安装前端依赖 (如果 node_modules 不存在)
    node_modules = frontend_dir / "node_modules"
    if not node_modules.exists():
        run_command(
            "npm install", 
            cwd=frontend_dir, 
            description="安装前端依赖"
        )
    else:
        print("✅ 前端依赖已存在，跳过安装")
    
    # 步骤 2: 构建前端
    run_command(
        "npm run build", 
        cwd=frontend_dir, 
        description="构建前端项目"
    )
    
    # 检查构建输出目录
    build_output = frontend_dir / ".next"
    if not build_output.exists():
        print("❌ 前端构建失败，输出目录不存在!")
        sys.exit(1)
    
    print(f"✅ 前端构建成功，输出目录: {build_output}")
    
    print("\n" + "="*60)
    print("🚀 启动服务器")
    print("前端服务器: http://127.0.0.1:3000")
    print("后端API服务器: http://127.0.0.1:8000")
    print("API文档: http://127.0.0.1:8000/docs")
    print("按 Ctrl+C 停止所有服务器")
    print("="*60 + "\n")
    
    try:
        # 创建线程启动两个服务器
        frontend_thread = threading.Thread(
            target=start_frontend, 
            args=(frontend_dir,)
        )
        backend_thread = threading.Thread(
            target=start_backend, 
            args=(project_root,)
        )
        
        frontend_thread.daemon = True
        backend_thread.daemon = True
        
        # 启动两个服务器
        frontend_thread.start()
        time.sleep(2)  # 给前端一点启动时间
        backend_thread.start()
        
        # 等待键盘中断
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 正在停止所有服务器...")
        print("所有服务器已停止")

if __name__ == "__main__":
    main() 