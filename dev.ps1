# dev.ps1 — one-command dev launcher for Aetherium AI Analytics
#
# Starts the Python FastAPI backend (uvicorn) and the Angular frontend (npm start)
# concurrently as PowerShell background jobs, then prints the URLs and how to stop.
#
# Usage (from repo root):
#   ./dev.ps1

$ErrorActionPreference = "Stop"

$backendVenvPython = Join-Path $PSScriptRoot "backend/.venv/Scripts/python.exe"
$frontendDir       = Join-Path $PSScriptRoot "frontend"

# --- Backend ---------------------------------------------------------------
if (-not (Test-Path $backendVenvPython)) {
    Write-Host "Backend venv not found at 'backend/.venv'." -ForegroundColor Yellow
    Write-Host "Create it first with:" -ForegroundColor Yellow
    Write-Host "    py -m venv backend/.venv" -ForegroundColor Yellow
    Write-Host "    backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt" -ForegroundColor Yellow
    Write-Host "Skipping backend startup." -ForegroundColor Yellow
    $backendJob = $null
} else {
    Write-Host "Starting backend (uvicorn) on http://localhost:8000 ..." -ForegroundColor Cyan
    $backendJob = Start-Job -Name "aetherium-backend" -ScriptBlock {
        param($pythonExe, $repoRoot)
        Set-Location (Join-Path $repoRoot "backend")
        & $pythonExe -m uvicorn app.main:app --port 8000
    } -ArgumentList $backendVenvPython, $PSScriptRoot
}

# --- Frontend ----------------------------------------------------------------
Write-Host "Starting frontend (Angular dev server) on http://localhost:4200 ..." -ForegroundColor Cyan
$frontendJob = Start-Job -Name "aetherium-frontend" -ScriptBlock {
    param($dir)
    Set-Location $dir
    npm start
} -ArgumentList $frontendDir

Write-Host ""
Write-Host "Aetherium AI Analytics is starting up:" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8000"
Write-Host "  Frontend: http://localhost:4200"
Write-Host ""
Write-Host "Both processes are running as PowerShell background jobs." -ForegroundColor Green
Write-Host "  View logs:  Receive-Job -Name aetherium-backend -Keep   (or aetherium-frontend)"
Write-Host "  Stop both:  Stop-Job aetherium-backend, aetherium-frontend; Remove-Job aetherium-backend, aetherium-frontend"
Write-Host ""
Write-Host "Press Ctrl+C to detach (jobs keep running until stopped explicitly)." -ForegroundColor DarkGray

# Stream logs from both jobs until the user interrupts.
try {
    while ($true) {
        if ($backendJob) { Receive-Job -Job $backendJob }
        Receive-Job -Job $frontendJob
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "Detached. Jobs are still running in the background." -ForegroundColor DarkGray
}
