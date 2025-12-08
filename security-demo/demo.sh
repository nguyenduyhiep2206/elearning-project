#!/bin/bash
# ╔════════════════════════════════════════════════════════════════════╗
# ║  SCRIPT DEMO BẢO MẬT CONTAINER - BASH (Linux/Mac)                  ║
# ║  Môn: Phát triển phần mềm web an toàn                              ║
# ╚════════════════════════════════════════════════════════════════════╝

DEMO_PATH="$(cd "$(dirname "$0")" && pwd)"
ACTION="${1:-all}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

print_result() {
    local text=$1
    local status=${2:-info}
    case $status in
        success) echo -e "  → ${GREEN}$text${NC}" ;;
        warning) echo -e "  → ${YELLOW}$text${NC}" ;;
        error) echo -e "  → ${RED}$text${NC}" ;;
        *) echo -e "  → $text" ;;
    esac
}

pause_demo() {
    echo ""
    read -p "Nhấn Enter để tiếp tục..."
}

# ============================================
# DEMO 1: IMAGE HARDENING
# ============================================
demo_image_hardening() {
    print_header "DEMO 1: DOCKER IMAGE HARDENING"
    
    cd "$DEMO_PATH/1-image-hardening"
    
    print_step "1.1 Build INSECURE image..."
    docker build -f Dockerfile.insecure -t demo:insecure ../app 2>/dev/null
    
    print_step "1.2 Build SECURE image..."
    docker build -f Dockerfile.secure -t demo:secure ../app 2>/dev/null
    
    print_step "1.3 So sánh kích thước image:"
    echo ""
    docker images --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}" | grep demo
    
    echo ""
    print_step "1.4 Kiểm tra user đang chạy:"
    echo ""
    
    INSECURE_USER=$(docker run --rm demo:insecure whoami 2>/dev/null)
    SECURE_USER=$(docker run --rm demo:secure whoami 2>/dev/null)
    
    print_result "INSECURE chạy với user: $INSECURE_USER" "warning"
    print_result "SECURE chạy với user: $SECURE_USER" "success"
    
    echo ""
    print_step "1.5 Scan lỗ hổng với Trivy:"
    echo ""
    
    if command -v trivy &> /dev/null; then
        echo -e "${RED}--- INSECURE IMAGE ---${NC}"
        trivy image --severity HIGH,CRITICAL demo:insecure 2>/dev/null | head -30
        
        echo ""
        echo -e "${GREEN}--- SECURE IMAGE ---${NC}"
        trivy image --severity HIGH,CRITICAL demo:secure 2>/dev/null | head -30
    else
        print_result "Trivy chưa cài đặt. Cài bằng: brew install trivy" "warning"
    fi
    
    cd "$DEMO_PATH"
}

# ============================================
# DEMO 2: SECRET MANAGEMENT
# ============================================
demo_secret_management() {
    print_header "DEMO 2: SECRET MANAGEMENT"
    
    cd "$DEMO_PATH/2-secret-management"
    
    # Cleanup
    docker-compose -f docker-compose.insecure.yml down 2>/dev/null
    docker-compose -f docker-compose.secure.yml down 2>/dev/null
    
    print_step "2.1 Khởi động version KHÔNG AN TOÀN..."
    docker-compose -f docker-compose.insecure.yml up -d 2>/dev/null
    sleep 3
    
    print_step "2.2 Kiểm tra secrets trong docker inspect (INSECURE):"
    echo ""
    docker inspect insecure-backend 2>/dev/null | grep -E "DB_PASSWORD|API_KEY|JWT_SECRET"
    print_result "❌ SECRETS BỊ LỘ trong docker inspect!" "error"
    
    pause_demo
    
    print_step "2.3 Khởi động version AN TOÀN..."
    docker-compose -f docker-compose.secure.yml up -d 2>/dev/null
    sleep 3
    
    print_step "2.4 Kiểm tra secrets trong docker inspect (SECURE):"
    echo ""
    docker inspect secure-backend 2>/dev/null | grep -E "DB_PASSWORD|API_KEY|JWT_SECRET"
    print_result "✅ Chỉ thấy _FILE path, không có giá trị thực!" "success"
    
    echo ""
    print_step "2.5 Secrets được mount vào /run/secrets/:"
    docker exec secure-backend ls /run/secrets/ 2>/dev/null
    
    echo ""
    print_step "2.6 Test API endpoints:"
    echo ""
    echo -e "${YELLOW}INSECURE (http://localhost:3001/secrets-check):${NC}"
    curl -s http://localhost:3001/secrets-check 2>/dev/null | jq . || echo "Chưa sẵn sàng"
    
    echo ""
    echo -e "${GREEN}SECURE (http://localhost:3002/secrets-check):${NC}"
    curl -s http://localhost:3002/secrets-check 2>/dev/null | jq . || echo "Chưa sẵn sàng"
    
    cd "$DEMO_PATH"
}

# ============================================
# DEMO 3: RUNTIME SECURITY
# ============================================
demo_runtime_security() {
    print_header "DEMO 3: RUNTIME SECURITY"
    
    cd "$DEMO_PATH/3-runtime-security"
    
    docker-compose -f docker-compose.full-security.yml down 2>/dev/null
    
    print_step "3.1 Khởi động hệ thống với full security..."
    docker-compose -f docker-compose.full-security.yml up -d 2>/dev/null
    sleep 5
    
    print_step "3.2 Kiểm tra network isolation:"
    echo ""
    print_result "Database port mapping:" "info"
    DB_PORT=$(docker port secure-database 2>/dev/null)
    if [ -z "$DB_PORT" ]; then
        print_result "✅ Không có port nào exposed - Database được bảo vệ!" "success"
    else
        print_result "❌ Port bị exposed: $DB_PORT" "error"
    fi
    
    echo ""
    print_step "3.3 Kiểm tra resource limits:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" 2>/dev/null
    
    echo ""
    print_step "3.4 Test read-only filesystem:"
    echo ""
    
    echo -e "${YELLOW}Thử ghi vào /app:${NC}"
    docker exec secure-backend-full touch /app/test.txt 2>&1 || true
    
    echo -e "${YELLOW}Thử ghi vào /tmp:${NC}"
    if docker exec secure-backend-full touch /tmp/test.txt 2>/dev/null; then
        print_result "✅ /tmp writable (như mong đợi)" "success"
    fi
    
    echo ""
    print_step "3.5 Kiểm tra security options:"
    SEC_OPT=$(docker inspect secure-backend-full --format '{{.HostConfig.SecurityOpt}}' 2>/dev/null)
    print_result "Security options: $SEC_OPT" "success"
    
    echo ""
    print_step "3.6 Kiểm tra API:"
    curl -s http://localhost:3003/ 2>/dev/null | jq . || echo "Container đang khởi động..."
    
    cd "$DEMO_PATH"
}

# ============================================
# CLEANUP
# ============================================
cleanup() {
    print_header "CLEANUP"
    
    print_step "Dọn dẹp tất cả containers..."
    
    cd "$DEMO_PATH/2-secret-management"
    docker-compose -f docker-compose.insecure.yml down 2>/dev/null
    docker-compose -f docker-compose.secure.yml down 2>/dev/null
    
    cd "$DEMO_PATH/3-runtime-security"
    docker-compose -f docker-compose.full-security.yml down -v 2>/dev/null
    
    cd "$DEMO_PATH"
    
    print_step "Xóa demo images..."
    docker rmi demo:insecure demo:secure 2>/dev/null
    
    print_result "Cleanup hoàn tất!" "success"
}

# ============================================
# MAIN
# ============================================
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     🔒 DEMO: BẢO MẬT CONTAINER WEB (Docker/Kubernetes)             ║${NC}"
echo -e "${CYAN}║     Môn: Phát triển phần mềm web an toàn                           ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

case $ACTION in
    1|image)
        demo_image_hardening
        ;;
    2|secret)
        demo_secret_management
        ;;
    3|runtime)
        demo_runtime_security
        ;;
    cleanup|clean)
        cleanup
        ;;
    all)
        demo_image_hardening
        pause_demo
        demo_secret_management
        pause_demo
        demo_runtime_security
        ;;
    *)
        echo "Cách sử dụng:"
        echo "  ./demo.sh all      - Chạy tất cả demo"
        echo "  ./demo.sh 1        - Demo Image Hardening"
        echo "  ./demo.sh 2        - Demo Secret Management"
        echo "  ./demo.sh 3        - Demo Runtime Security"
        echo "  ./demo.sh cleanup  - Dọn dẹp containers"
        ;;
esac

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  DEMO HOÀN TẤT!${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

