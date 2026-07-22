@echo off
echo Pushing Prisma schema changes to database...
cd /d "%~dp0"
call npx prisma db push
echo.
echo Done! Press any key to exit.
pause > nul
 