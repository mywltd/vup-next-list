@echo off
chcp 65001 >nul
echo 🎵 VUP 音乐歌单系统
echo ====================
echo.

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到 Docker，请先安装 Docker
    pause
    exit /b 1
)

REM 检查 Docker Compose 是否安装
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到 Docker Compose，请先安装 Docker Compose
    pause
    exit /b 1
)

echo ✅ Docker 环境检查通过
echo.

REM 创建数据目录
if not exist ".\data" (
    echo 📁 创建数据目录...
    mkdir .\data
    mkdir .\data\uploads
    echo ✅ 数据目录创建完成
)

echo.
echo 🚀 启动服务...
docker-compose up -d

echo.
echo ⏳ 等待服务启动...
timeout /t 3 /nobreak >nul

echo.
echo ✅ 服务启动成功！
echo.
echo 📝 访问信息:
echo    主页: http://localhost:3001
echo    管理后台: http://localhost:3001/admin/login
echo.
echo 💡 提示:
echo    - 首次访问会进入安装向导
echo    - 查看日志: docker-compose logs -f
echo    - 停止服务: docker-compose down
echo.
pause

