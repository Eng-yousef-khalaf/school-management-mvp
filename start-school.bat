@echo off
chcp 65001 > nul
title Smart School Management System (Enterprise Standalone)
color 0B

echo ==============================================================================
echo    🏫 منظومة الإدارة المدرسية والأكاديمية الذكية (النسخة المستقلة)
echo    Smart School Management System - Standalone Enterprise Edition
echo ==============================================================================
echo.
echo [*] جاري فحص بيئة التشغيل...
echo [*] Checking runtime environment...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] خطأ: Node.js غير مثبت على هذا الجهاز.
    echo [!] Error: Node.js is not installed. Please install Node.js (v18+) to run the system.
    pause
    exit /b
)

echo [✓] تم التحقق من Node.js بنجاح.
echo [✓] Node.js is ready.
echo.
echo [*] جاري تشغيل خادم المنظومة وقاعدة البيانات المدمجة على المنفذ 4000...
echo [*] Starting backend server and embedded SQLite database on http://localhost:4000...
echo.

cd /d "%~dp0backend"
start "" /b node src/server.js

timeout /t 2 /nobreak > nul

echo [✓] تم تشغيل المنظومة بنجاح!
echo [✓] System is live at: http://localhost:4000
echo.
echo [*] جاري فتح المنصة في المتصفح تلقائياً...
start http://localhost:4000

echo.
echo ==============================================================================
echo المنظومة تعمل الآن في الخلفية. يمكنك استخدامها من المتصفح.
echo لإيقاف الخادم، أغلق هذه النافذة أو اضغط Ctrl + C.
echo ==============================================================================
echo.
pause
