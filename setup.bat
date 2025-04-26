@echo off
echo Setting up HungryHippo environment...

:: Check if Node.js is installed
@REM echo Checking for Node.js installation...
@REM node -v >nul 2>&1
@REM if %ERRORLEVEL% NEQ 0 (
@REM     echo Node.js is not installed. Please install Node.js from https://nodejs.org/ and try again.
@REM     pause
@REM     exit /b 1
@REM )

:: Navigate to the project directory
echo Navigating to the project directory...
cd "%~dp0"

@REM :: Install Node.js dependencies
@REM echo Installing Node.js dependencies...
@REM npm install
@REM if %ERRORLEVEL% NEQ 0 (
@REM     echo Failed to install Node.js dependencies. Please check your npm setup.
@REM     pause
@REM     exit /b 1
@REM )

:: Create required directories if they don't exist
echo Ensuring required directories exist...
if not exist "users" mkdir users
if not exist "uploads" mkdir uploads
if not exist "public/recipes" mkdir public\recipes

:: Check for .env file
if not exist ".env" (
    echo .env file is missing. Please create a .env file with the required environment variables.
    pause
    exit /b 1
)

:: Start the server
echo Starting the HungryHippo server...
echo To access the application, open your web browser and go to http://localhost:3000.
node --no-warnings server.js