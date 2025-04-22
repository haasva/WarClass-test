@echo off

rem Check if Python 3 is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python 3 is not installed. Installing Python 3...
    REM You can replace the URL with the latest Python 3 installer URL.
    REM Adjust the installer filename based on the version and architecture you need.
    REM You might want to use a more sophisticated method to detect system architecture.
    REM For simplicity, this example assumes 64-bit Windows.
    curl -o python_installer.exe https://www.python.org/ftp/python/3.10.2/python-3.10.2-amd64.exe
    python_installer.exe /quiet
    if %errorlevel% neq 0 (
        echo Failed to install Python 3. Exiting...
        exit /b 1
    )
    echo Python 3 has been installed successfully.
)

rem Start the Python server
start chrome "http://localhost:8000/index.html"
cd /d %~dp0
python -m http.server --cgi

rem Reload the page after a delay
timeout /t 2 /nobreak >nul
start chrome "http://localhost:8000/index.html"
