@echo off
echo Setting up HungryHippo environment...

:: Check if Node.js is installed
echo Checking for Node.js installation...
where node >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b 1
)
echo Node.js is installed.

:: Check if npm is installed
echo Checking for npm installation...
where npm >nul 2>&1
if errorlevel 1 (
    echo npm is not installed. It usually comes bundled with Node.js. Please reinstall Node.js from https://nodejs.org/ and try again.
    pause
    exit /b 1
)
echo npm is installed.

:: Navigate to the project directory
echo Navigating to the project directory...
cd "%~dp0"
echo Changed directory to: "%cd%"

:: Install Node.js dependencies
echo Installing Node.js dependencies...
call npm install axios@^1.7.9 cheerio@^1.0.0 csv-parser@^3.1.0 dotenv@^16.4.7 express@^4.21.2 multer@^1.4.5-lts.2 openai@^4.79.1 --no-audit
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install Node.js dependencies. Please check your setup.
    pause
    exit /b 1
)
echo Node.js dependencies installed successfully.

:: Initialize Conda
echo Initializing Conda...
if not exist "%USERPROFILE%\anaconda3\condabin\conda.bat" (
    echo Conda installation not found at "%USERPROFILE%\anaconda3\condabin\conda.bat".
    echo Please ensure Anaconda is installed correctly.
    pause
    exit /b 1
)
call "%USERPROFILE%\anaconda3\condabin\conda.bat" init
if %ERRORLEVEL% NEQ 0 (
    echo Failed to initialize Conda. Please check your Conda installation.
    pause
    exit /b 1
)
echo Conda initialized successfully.

:: Check if Conda environment already exists
echo Checking if Conda environment "HungryHippoEnv" exists...
call conda env list | findstr "HungryHippoEnv" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Conda environment "HungryHippoEnv" already exists. Skipping environment creation.
) else (
    echo Conda environment "HungryHippoEnv" not found. Creating environment...
    if not exist "environment.yml" (
        echo "environment.yml" file not found in the current directory.
        echo Please ensure the environment configuration file exists.
        pause
        exit /b 1
    )
    call conda env create -f environment.yml
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to create Conda environment. Please check your Conda setup and the "environment.yml" file.
        pause
        exit /b 1
    )
    echo Conda environment "HungryHippoEnv" created successfully.
)

:: Create required directories if they don't exist
echo Ensuring required directories exist...
if not exist "users" mkdir users
if not exist "uploads" mkdir uploads
if not exist "public\recipes" mkdir public\recipes
echo Required directories checked/created.

:: Check for .env file
if not exist ".env" (
    echo .env file is missing. Please create a .env file with the required environment variables.
    pause
    exit /b 1
)
echo ".env" file found.

:: Start the server
echo Starting the HungryHippo server...
echo To access the application, open your web browser and go to http://localhost:3000.
node --no-warnings server.js

:: Keep the command prompt open after the server starts (optional)
pause