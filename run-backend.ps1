# MediCare360 Java Spring Boot Backend Runner
$env:JAVA_HOME = "C:\dev\java21\jdk-21.0.7+6"
$env:PATH = "$env:JAVA_HOME\bin;C:\dev\maven\apache-maven-3.9.9\bin;$env:PATH"
$env:MEDICARE_DB_PATH = Join-Path $PSScriptRoot 'data\medicare360.db'
$javaBackend = "$PSScriptRoot\java-backend"
Set-Location $javaBackend

# Compile and run from the current source tree. Running through Spring Boot avoids
# replacing the packaged JAR, which can be locked by Windows/OneDrive.
Write-Host "Compiling MediCare360 Java backend..." -ForegroundColor Cyan
& mvn -DskipTests compile -q
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build FAILED. Check errors above." -ForegroundColor Red
    exit 1
}
Write-Host "Build SUCCESS." -ForegroundColor Green

$port = 8000
$listeners = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique)
foreach ($processId in $listeners) {
    if (-not $processId -or $processId -eq 0) {
        Write-Host "Port $port is reported as busy, but Windows did not provide a killable process ID (PID 0). No process was stopped." -ForegroundColor Red
        Write-Host "Check the port reservation or owning service, then run this script again." -ForegroundColor Yellow
        exit 1
    }

    $owner = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
    if ($owner -and $owner.Name -match '^java(w)?\.exe$' -and $owner.CommandLine -like '*medicare360-1.0.0.jar*') {
        Write-Host "Stopping previous MediCare360 backend (PID $processId)..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction Stop
    } else {
        $ownerName = if ($owner) { $owner.Name } else { 'unknown process' }
        Write-Host "Port $port is occupied by PID $processId ($ownerName), not the MediCare360 backend. No process was stopped." -ForegroundColor Red
        Write-Host "Stop that service or configure it to use another port, then run this script again." -ForegroundColor Yellow
        exit 1
    }
}

if ($listeners.Count -gt 0) {
    $deadline = (Get-Date).AddSeconds(10)
    do {
        Start-Sleep -Milliseconds 250
        $stillListening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    } while ($stillListening -and (Get-Date) -lt $deadline)
    if ($stillListening) {
        Write-Host "The previous backend did not release port $port in time." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Starting MediCare360 Spring Boot Backend on http://localhost:$port..." -ForegroundColor Green
Write-Host "Database: $javaBackend\..\data\medicare360.db" -ForegroundColor Gray
Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray
& mvn -DskipTests spring-boot:run "-Dspring-boot.run.arguments=--server.port=$port"
