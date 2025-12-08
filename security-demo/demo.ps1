# ============================================================================
#  SCRIPT DEMO BAO MAT CONTAINER - E-LEARNING PROJECT
#  Mon: Phat trien phan mem web an toan
# ============================================================================

param(
    [string]$Action = "all"
)

$ErrorActionPreference = "Continue"
$DemoPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectPath = Split-Path -Parent $DemoPath

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "===========================================================" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Yellow
    Write-Host "===========================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$Text)
    Write-Host "[>] $Text" -ForegroundColor Green
}

function Write-Result {
    param([string]$Text, [string]$Status = "info")
    $color = switch ($Status) {
        "success" { "Green" }
        "warning" { "Yellow" }
        "error" { "Red" }
        default { "White" }
    }
    Write-Host "  -> $Text" -ForegroundColor $color
}

function Pause-Demo {
    Write-Host ""
    Write-Host "Nhan Enter de tiep tuc..." -ForegroundColor DarkGray
    Read-Host
}

# ============================================
# DEMO 1: IMAGE HARDENING
# ============================================
function Demo-ImageHardening {
    Write-Header "DEMO 1: DOCKER IMAGE HARDENING (E-Learning Backend)"
    
    Set-Location "$DemoPath\1-image-hardening"
    
    # Build insecure image
    Write-Step "1.1 Build INSECURE image (node:20 full)..."
    docker build -f Dockerfile.insecure -t elearning:insecure "$ProjectPath\elearning-backend" 2>$null
    
    # Build secure image  
    Write-Step "1.2 Build SECURE image (node:20-alpine + hardening)..."
    docker build -f Dockerfile.secure -t elearning:secure "$ProjectPath\elearning-backend" 2>$null
    
    # So sanh kich thuoc
    Write-Step "1.3 So sanh kich thuoc image:"
    Write-Host ""
    Write-Host "REPOSITORY:TAG              SIZE" -ForegroundColor Cyan
    Write-Host "------------------------------------"
    docker images --format "{{.Repository}}:{{.Tag}}`t{{.Size}}" | Select-String "elearning"
    
    Write-Host ""
    Write-Step "1.4 Kiem tra user dang chay:"
    Write-Host ""
    
    $insecureUser = docker run --rm elearning:insecure whoami 2>$null
    $secureUser = docker run --rm elearning:secure whoami 2>$null
    
    Write-Result "INSECURE chay voi user: $insecureUser" "warning"
    Write-Result "SECURE chay voi user: $secureUser" "success"
    
    Write-Host ""
    Write-Step "1.5 Scan lo hong voi Trivy:"
    Write-Host ""
    
    if (Get-Command trivy -ErrorAction SilentlyContinue) {
        Write-Host "--- INSECURE IMAGE (node:20 debian) ---" -ForegroundColor Red
        trivy image --severity HIGH,CRITICAL --quiet elearning:insecure 2>$null | Select-Object -First 40
        
        Write-Host ""
        Write-Host "--- SECURE IMAGE (node:20-alpine) ---" -ForegroundColor Green
        trivy image --severity HIGH,CRITICAL --quiet elearning:secure 2>$null | Select-Object -First 40
    } else {
        Write-Result "Trivy chua cai dat. Cai bang: choco install trivy" "warning"
        Write-Host ""
        Write-Host "Ban co the cai Trivy va chay lai demo 1 de thay ket qua scan."
    }
    
    Set-Location $DemoPath
}

# ============================================
# DEMO 2: SECRET MANAGEMENT
# ============================================
function Demo-SecretManagement {
    Write-Header "DEMO 2: SECRET MANAGEMENT (E-Learning Backend)"
    
    Set-Location "$DemoPath\2-secret-management"
    
    # Cleanup truoc
    Write-Step "Dang don dep containers cu..."
    docker-compose -f docker-compose.insecure.yml down 2>$null
    docker-compose -f docker-compose.secure.yml down 2>$null
    
    # Start insecure version
    Write-Step "2.1 Khoi dong version KHONG AN TOAN..."
    docker-compose -f docker-compose.insecure.yml up -d --build 2>$null
    Start-Sleep -Seconds 5
    
    Write-Step "2.2 Kiem tra secrets trong docker inspect (INSECURE):"
    Write-Host ""
    Write-Host "Cac environment variables chua secrets:" -ForegroundColor Red
    docker inspect insecure-elearning-backend 2>$null | Select-String "DB_PASSWORD|JWT_SECRET|API_SECRET|HASH_SECRET"
    Write-Host ""
    Write-Result "SECRETS BI LO trong docker inspect!" "error"
    Write-Result "Bat ky ai chay 'docker inspect' deu thay password!" "error"
    
    Pause-Demo
    
    # Start secure version
    Write-Step "2.3 Khoi dong version AN TOAN..."
    docker-compose -f docker-compose.secure.yml up -d --build 2>$null
    Start-Sleep -Seconds 5
    
    Write-Step "2.4 Kiem tra secrets trong docker inspect (SECURE):"
    Write-Host ""
    Write-Host "Cac environment variables:" -ForegroundColor Green
    docker inspect secure-elearning-backend 2>$null | Select-String "DB_PASSWORD|JWT_SECRET|API_SECRET|HASH_SECRET"
    Write-Host ""
    Write-Result "Chi thay _FILE path, KHONG co gia tri thuc!" "success"
    
    Write-Host ""
    Write-Step "2.5 Secrets duoc mount vao /run/secrets/:"
    Write-Host ""
    docker exec secure-elearning-backend ls -la /run/secrets/ 2>$null
    
    Write-Host ""
    Write-Step "2.6 Noi dung secret (chi doc duoc tu trong container):"
    Write-Host ""
    Write-Host "DB Password: " -NoNewline
    docker exec secure-elearning-backend cat /run/secrets/db-password 2>$null
    Write-Host ""
    
    Set-Location $DemoPath
}

# ============================================
# DEMO 3: RUNTIME SECURITY
# ============================================
function Demo-RuntimeSecurity {
    Write-Header "DEMO 3: RUNTIME SECURITY (E-Learning Full Stack)"
    
    Set-Location "$DemoPath\3-runtime-security"
    
    # Cleanup va start
    Write-Step "Dang don dep containers cu..."
    docker-compose -f docker-compose.full-security.yml down -v 2>$null
    
    Write-Step "3.1 Khoi dong he thong voi full security..."
    Write-Host "    (Frontend + Backend + Database)"
    docker-compose -f docker-compose.full-security.yml up -d --build 2>$null
    
    Write-Host ""
    Write-Host "Dang cho cac services khoi dong..." -ForegroundColor DarkGray
    Start-Sleep -Seconds 10
    
    Write-Step "3.2 Kiem tra NETWORK ISOLATION:"
    Write-Host ""
    
    Write-Host "Frontend ports:" -ForegroundColor Cyan
    docker port secure-elearning-frontend 2>$null
    
    Write-Host ""
    Write-Host "Backend ports:" -ForegroundColor Cyan
    docker port secure-elearning-backend 2>$null
    
    Write-Host ""
    Write-Host "Database ports:" -ForegroundColor Cyan
    $dbPort = docker port secure-elearning-database 2>$null
    if ([string]::IsNullOrEmpty($dbPort)) {
        Write-Result "Khong co port nao exposed - Database duoc bao ve!" "success"
        Write-Result "Database CHI co the truy cap tu Backend, KHONG tu ben ngoai!" "success"
    } else {
        Write-Result "Port bi exposed: $dbPort" "error"
    }
    
    Write-Host ""
    Write-Step "3.3 Kiem tra RESOURCE LIMITS:"
    Write-Host ""
    docker stats --no-stream --format "table {{.Name}}`t{{.CPUPerc}}`t{{.MemUsage}}" 2>$null
    
    Write-Host ""
    Write-Step "3.4 Kiem tra SECURITY OPTIONS:"
    Write-Host ""
    $secOpt = docker inspect secure-elearning-backend --format "{{.HostConfig.SecurityOpt}}" 2>$null
    Write-Result "Backend security options: $secOpt" "success"
    
    Write-Host ""
    Write-Step "3.5 Kiem tra CAPABILITIES:"
    Write-Host ""
    $capDrop = docker inspect secure-elearning-backend --format "{{.HostConfig.CapDrop}}" 2>$null
    $capAdd = docker inspect secure-elearning-backend --format "{{.HostConfig.CapAdd}}" 2>$null
    Write-Result "Capabilities dropped: $capDrop" "success"
    Write-Result "Capabilities added: $capAdd" "info"
    
    Write-Host ""
    Write-Step "3.6 Kiem tra HEALTH STATUS:"
    Write-Host ""
    docker ps --format "table {{.Names}}`t{{.Status}}" 2>$null | Select-String "secure-elearning"
    
    Set-Location $DemoPath
}

# ============================================
# CLEANUP
# ============================================
function Cleanup {
    Write-Header "CLEANUP"
    
    Write-Step "Don dep tat ca containers..."
    
    Set-Location "$DemoPath\2-secret-management"
    docker-compose -f docker-compose.insecure.yml down 2>$null
    docker-compose -f docker-compose.secure.yml down 2>$null
    
    Set-Location "$DemoPath\3-runtime-security"
    docker-compose -f docker-compose.full-security.yml down -v 2>$null
    
    Set-Location $DemoPath
    
    Write-Step "Xoa demo images..."
    docker rmi elearning:insecure elearning:secure 2>$null
    
    Write-Result "Cleanup hoan tat!" "success"
}

# ============================================
# MAIN
# ============================================
Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "     DEMO: BAO MAT CONTAINER WEB                                   " -ForegroundColor Cyan
Write-Host "     Project: E-Learning Platform                                  " -ForegroundColor Cyan
Write-Host "     Mon: Phat trien phan mem web an toan                          " -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

switch ($Action.ToLower()) {
    "1" { Demo-ImageHardening }
    "image" { Demo-ImageHardening }
    
    "2" { Demo-SecretManagement }
    "secret" { Demo-SecretManagement }
    
    "3" { Demo-RuntimeSecurity }
    "runtime" { Demo-RuntimeSecurity }
    
    "cleanup" { Cleanup }
    "clean" { Cleanup }
    
    "all" {
        Demo-ImageHardening
        Pause-Demo
        Demo-SecretManagement
        Pause-Demo
        Demo-RuntimeSecurity
    }
    
    default {
        Write-Host "Cach su dung:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  .\demo.ps1 all      - Chay tat ca demo"
        Write-Host "  .\demo.ps1 1        - Demo Image Hardening"
        Write-Host "  .\demo.ps1 2        - Demo Secret Management"
        Write-Host "  .\demo.ps1 3        - Demo Runtime Security"
        Write-Host "  .\demo.ps1 cleanup  - Don dep containers va images"
        Write-Host ""
        Write-Host "Vi du:" -ForegroundColor Yellow
        Write-Host "  .\demo.ps1 1        # Chi chay demo Image Hardening"
    }
}

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  DEMO HOAN TAT!" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Cyan

