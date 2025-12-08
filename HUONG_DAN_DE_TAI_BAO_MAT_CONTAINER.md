# HƯỚNG DẪN ĐỀ TÀI: Bảo mật Container Web (Docker/Kubernetes)
## Môn: Phát triển phần mềm web an toàn
## Nhóm: 3 người

---

## 📋 MỤC LỤC
1. [Tổng quan đề tài](#1-tổng-quan-đề-tài)
2. [Có cần Web Demo không?](#2-có-cần-web-demo-không)
3. [Phân công công việc](#3-phân-công-công-việc)
4. [Nội dung chi tiết từng phần](#4-nội-dung-chi-tiết-từng-phần)
5. [Cấu trúc thư mục demo](#5-cấu-trúc-thư-mục-demo)
6. [Hướng dẫn demo trước lớp](#6-hướng-dẫn-demo-trước-lớp)
7. [Tài liệu tham khảo](#7-tài-liệu-tham-khảo)

---

## 1. TỔNG QUAN ĐỀ TÀI

### 1.1 Mục tiêu
- Hiểu và áp dụng các kỹ thuật **Hardening Docker Image** (làm cứng image)
- Triển khai **Secret Management** (quản lý bí mật) an toàn
- Demo thực tế trên ứng dụng web containerized

### 1.2 Các chủ đề chính
| STT | Chủ đề | Mô tả |
|-----|--------|-------|
| 1 | Docker Image Hardening | Tối ưu và bảo mật Docker image |
| 2 | Secret Management | Quản lý credentials, API keys, passwords |
| 3 | Runtime Security | Bảo mật container khi chạy |

---

## 2. CÓ CẦN WEB DEMO KHÔNG?

### ✅ CÓ - Nên có 1 web demo đơn giản

**Lý do:**
1. **Trực quan hơn**: Thầy/cô và các bạn dễ hiểu khi thấy ứng dụng thực tế
2. **Chứng minh được vấn đề**: So sánh TRƯỚC và SAU khi hardening
3. **Điểm cao hơn**: Có demo thực tế luôn được đánh giá cao hơn chỉ lý thuyết

### 🎯 Gợi ý Web Demo

**Option 1: Sử dụng project có sẵn (KHUYÊN DÙNG)**
- Dùng luôn project e-learning này làm demo
- Đã có sẵn Docker setup

**Option 2: Tạo web demo đơn giản mới**
```
simple-webapp/
├── frontend/          # React/Vue đơn giản
├── backend/           # Node.js API
├── docker-compose.yml
└── README.md
```

**Option 3: Web demo tối thiểu**
- 1 trang login đơn giản
- 1 API endpoint đọc secret từ database
- Đủ để demo các kỹ thuật bảo mật

---

## 3. PHÂN CÔNG CÔNG VIỆC (3 NGƯỜI)

### 👤 THÀNH VIÊN 1: Docker Image Hardening
**Thời gian: ~3-4 ngày**

| Task | Chi tiết | Output |
|------|----------|--------|
| Nghiên cứu lý thuyết | Các nguyên tắc hardening image | Slide 5-7 trang |
| Multi-stage builds | Tối ưu Dockerfile với multi-stage | Dockerfile.optimized |
| Non-root user | Chạy container với user không phải root | Demo code |
| Minimal base image | So sánh alpine vs full image | Bảng so sánh kích thước |
| Security scanning | Sử dụng Trivy/Snyk scan image | Screenshot kết quả |

### 👤 THÀNH VIÊN 2: Secret Management
**Thời gian: ~3-4 ngày**

| Task | Chi tiết | Output |
|------|----------|--------|
| Nghiên cứu lý thuyết | Các phương pháp quản lý secret | Slide 5-7 trang |
| Docker Secrets | Demo với Docker Swarm secrets | docker-compose + commands |
| Environment variables | So sánh cách dùng env an toàn | Best practices doc |
| HashiCorp Vault | Demo cơ bản với Vault | Setup script + demo |
| .env security | Cách bảo vệ file .env | .gitignore + encryption |

### 👤 THÀNH VIÊN 3: Runtime Security & Tổng hợp
**Thời gian: ~3-4 ngày**

| Task | Chi tiết | Output |
|------|----------|--------|
| Nghiên cứu lý thuyết | Container runtime security | Slide 5-7 trang |
| Network security | Docker network isolation | docker-compose network config |
| Resource limits | CPU/Memory limits | Demo config |
| Read-only filesystem | Immutable containers | Demo |
| Tổng hợp báo cáo | Ghép nội dung 3 người | Báo cáo Word/PDF hoàn chỉnh |
| Chuẩn bị demo | Setup environment để demo | Script demo |

---

## 4. NỘI DUNG CHI TIẾT TỪNG PHẦN

### 4.1 PHẦN 1: Docker Image Hardening

#### A. Dockerfile TRƯỚC KHI Hardening (Không an toàn)
```dockerfile
# ❌ BAD EXAMPLE - Dockerfile.insecure
FROM node:20                    # Full image - quá nặng, nhiều lỗ hổng
WORKDIR /app
COPY . .                        # Copy tất cả, kể cả .env, node_modules
RUN npm install                 # Không dùng --production
EXPOSE 3000
CMD ["npm", "start"]            # Chạy với root user
```

**Vấn đề:**
- Image size lớn (~1GB)
- Chạy với quyền root
- Chứa nhiều package không cần thiết
- Có thể chứa file nhạy cảm

#### B. Dockerfile SAU KHI Hardening (An toàn)
```dockerfile
# ✅ GOOD EXAMPLE - Dockerfile.secure
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:20-alpine AS production

# Tạo non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy chỉ những gì cần thiết từ builder
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --chown=appuser:appgroup ./src ./src
COPY --chown=appuser:appgroup ./package.json ./

# Đặt các security options
ENV NODE_ENV=production
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 3000
CMD ["node", "src/index.js"]
```

#### C. So sánh kết quả
| Metric | Before | After | Cải thiện |
|--------|--------|-------|-----------|
| Image Size | ~1.2GB | ~180MB | -85% |
| CVE Vulnerabilities | 50+ | 5-10 | -80% |
| Running as Root | Yes | No | ✅ |
| Attack Surface | High | Low | ✅ |

#### D. Script quét lỗ hổng với Trivy
```bash
# Cài đặt Trivy
# Windows: choco install trivy
# Linux: sudo apt install trivy

# Quét image
trivy image docker-elearning-backend:latest

# Quét với output JSON
trivy image --format json -o report.json docker-elearning-backend:latest

# Chỉ hiển thị HIGH và CRITICAL
trivy image --severity HIGH,CRITICAL docker-elearning-backend:latest
```

---

### 4.2 PHẦN 2: Secret Management

#### A. Cách SAI (Không an toàn)
```yaml
# ❌ BAD - docker-compose.insecure.yml
version: '3.8'
services:
  backend:
    image: myapp:latest
    environment:
      # ❌ Hardcode password trực tiếp
      - DB_PASSWORD=super_secret_password_123
      - JWT_SECRET=my_jwt_secret
      - API_KEY=sk-1234567890abcdef
```

```javascript
// ❌ BAD - Hardcode trong code
const dbPassword = "super_secret_password_123";
const jwtSecret = "my_jwt_secret";
```

#### B. Cách ĐÚNG - Sử dụng Docker Secrets

**Bước 1: Tạo secret files**
```bash
# Tạo thư mục secrets (không commit lên git)
mkdir secrets
echo "super_secret_password_123" > secrets/db_password.txt
echo "my_jwt_secret_key_very_long" > secrets/jwt_secret.txt
```

**Bước 2: Cấu hình docker-compose với secrets**
```yaml
# ✅ GOOD - docker-compose.secure.yml
version: '3.8'

services:
  backend:
    image: myapp:latest
    secrets:
      - db_password
      - jwt_secret
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password
      - JWT_SECRET_FILE=/run/secrets/jwt_secret

secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

**Bước 3: Đọc secret trong code**
```javascript
// ✅ GOOD - Đọc từ file secret
const fs = require('fs');

function getSecret(secretName) {
  try {
    // Đọc từ Docker secret
    const secretPath = `/run/secrets/${secretName}`;
    if (fs.existsSync(secretPath)) {
      return fs.readFileSync(secretPath, 'utf8').trim();
    }
    // Fallback về environment variable
    return process.env[secretName.toUpperCase()];
  } catch (error) {
    console.error(`Failed to read secret: ${secretName}`);
    return null;
  }
}

const dbPassword = getSecret('db_password');
const jwtSecret = getSecret('jwt_secret');
```

#### C. Demo với HashiCorp Vault (Nâng cao)

**docker-compose-vault.yml**
```yaml
version: '3.8'

services:
  vault:
    image: vault:latest
    container_name: vault
    ports:
      - "8200:8200"
    environment:
      VAULT_DEV_ROOT_TOKEN_ID: myroot
      VAULT_DEV_LISTEN_ADDRESS: 0.0.0.0:8200
    cap_add:
      - IPC_LOCK

  backend:
    build: ./backend
    depends_on:
      - vault
    environment:
      VAULT_ADDR: http://vault:8200
      VAULT_TOKEN: myroot
```

**Script lưu và đọc secret từ Vault**
```bash
# Lưu secret vào Vault
curl -X POST -H "X-Vault-Token: myroot" \
  -d '{"data": {"password": "super_secret"}}' \
  http://localhost:8200/v1/secret/data/database

# Đọc secret từ Vault
curl -H "X-Vault-Token: myroot" \
  http://localhost:8200/v1/secret/data/database
```

#### D. Bảo vệ file .env

**.gitignore**
```gitignore
# ✅ LUÔN ignore các file nhạy cảm
.env
.env.local
.env.production
*.pem
*.key
secrets/
```

**Sử dụng .env.example**
```bash
# .env.example (commit lên git)
DB_HOST=localhost
DB_PORT=5432
DB_USER=
DB_PASSWORD=          # Để trống, developer tự điền
JWT_SECRET=           # Để trống
API_KEY=              # Để trống
```

---

### 4.3 PHẦN 3: Runtime Security

#### A. Network Isolation
```yaml
# docker-compose.network.yml
version: '3.8'

services:
  frontend:
    networks:
      - frontend-net      # Chỉ trong mạng frontend
    
  backend:
    networks:
      - frontend-net      # Có thể giao tiếp với frontend
      - backend-net       # Có thể giao tiếp với database
    
  database:
    networks:
      - backend-net       # CHỈ backend mới truy cập được

networks:
  frontend-net:
    driver: bridge
  backend-net:
    driver: bridge
    internal: true        # Không có internet access
```

#### B. Resource Limits
```yaml
# docker-compose.limits.yml
version: '3.8'

services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'           # Tối đa 50% CPU
          memory: 512M          # Tối đa 512MB RAM
        reservations:
          cpus: '0.25'
          memory: 256M
```

#### C. Read-only Filesystem
```yaml
# docker-compose.readonly.yml
version: '3.8'

services:
  backend:
    read_only: true              # Filesystem read-only
    tmpfs:
      - /tmp                     # Chỉ /tmp được ghi
      - /var/run
    volumes:
      - logs:/app/logs:rw        # Volume riêng cho logs
```

#### D. Security Options
```yaml
# docker-compose.security.yml
version: '3.8'

services:
  backend:
    security_opt:
      - no-new-privileges:true   # Không cho phép leo thang đặc quyền
    cap_drop:
      - ALL                      # Bỏ tất cả capabilities
    cap_add:
      - NET_BIND_SERVICE         # Chỉ thêm những gì cần thiết
```

---

## 5. CẤU TRÚC THƯ MỤC DEMO

```
bao-mat-container-demo/
├── 📁 1-image-hardening/
│   ├── Dockerfile.insecure         # Ví dụ không an toàn
│   ├── Dockerfile.secure           # Ví dụ đã hardening
│   ├── docker-compose.yml
│   ├── scan-results/               # Kết quả Trivy scan
│   │   ├── before-scan.txt
│   │   └── after-scan.txt
│   └── README.md
│
├── 📁 2-secret-management/
│   ├── docker-compose.insecure.yml # Ví dụ không an toàn
│   ├── docker-compose.secure.yml   # Ví dụ với Docker secrets
│   ├── docker-compose.vault.yml    # Ví dụ với Vault
│   ├── secrets/                    # (không commit)
│   │   ├── db_password.txt
│   │   └── jwt_secret.txt
│   ├── src/
│   │   └── secret-reader.js        # Code đọc secret
│   └── README.md
│
├── 📁 3-runtime-security/
│   ├── docker-compose.network.yml
│   ├── docker-compose.limits.yml
│   ├── docker-compose.readonly.yml
│   └── README.md
│
├── 📁 slides/
│   ├── 01-gioi-thieu.pptx
│   ├── 02-image-hardening.pptx
│   ├── 03-secret-management.pptx
│   └── 04-runtime-security.pptx
│
├── 📁 docs/
│   ├── bao-cao-chi-tiet.docx
│   └── bang-so-sanh.xlsx
│
└── 📄 README.md                    # Hướng dẫn tổng quan
```

---

## 6. HƯỚNG DẪN DEMO TRƯỚC LỚP

### 6.1 Chuẩn bị (Trước buổi demo)
```bash
# 1. Cài đặt Docker Desktop
# 2. Cài đặt Trivy để scan
choco install trivy  # Windows
# hoặc
brew install trivy   # Mac

# 3. Pull các images cần thiết
docker pull node:20
docker pull node:20-alpine
docker pull vault:latest

# 4. Build các images demo
docker-compose build
```

### 6.2 Kịch bản Demo (15-20 phút)

#### Phần 1: Image Hardening (5 phút)
```bash
# Demo 1.1: So sánh kích thước image
echo "=== BEFORE HARDENING ==="
docker build -f Dockerfile.insecure -t app:insecure .
docker images app:insecure

echo "=== AFTER HARDENING ==="
docker build -f Dockerfile.secure -t app:secure .
docker images app:secure

# Demo 1.2: Scan lỗ hổng
echo "=== SCAN INSECURE IMAGE ==="
trivy image --severity HIGH,CRITICAL app:insecure

echo "=== SCAN SECURE IMAGE ==="
trivy image --severity HIGH,CRITICAL app:secure

# Demo 1.3: Kiểm tra user chạy container
docker run --rm app:insecure whoami    # root
docker run --rm app:secure whoami      # appuser
```

#### Phần 2: Secret Management (5 phút)
```bash
# Demo 2.1: Cách sai - secret trong docker inspect
docker-compose -f docker-compose.insecure.yml up -d
docker inspect backend | grep -A5 "Env"
# => Thấy password hiển thị rõ ràng!

# Demo 2.2: Cách đúng - Docker secrets
docker-compose -f docker-compose.secure.yml up -d
docker exec backend cat /run/secrets/db_password
# => Secret được mount an toàn

# Demo 2.3: Vault (nếu có thời gian)
docker-compose -f docker-compose.vault.yml up -d
# Truy cập http://localhost:8200 để demo UI
```

#### Phần 3: Runtime Security (5 phút)
```bash
# Demo 3.1: Network isolation
docker network ls
docker network inspect backend-net
# => Thấy database chỉ trong internal network

# Demo 3.2: Resource limits
docker stats
# => Thấy giới hạn CPU/Memory

# Demo 3.3: Read-only filesystem
docker exec backend touch /app/test.txt
# => Permission denied
docker exec backend touch /tmp/test.txt
# => OK (tmpfs được phép)
```

### 6.3 Script Demo Tự Động
```bash
#!/bin/bash
# demo.sh - Script chạy demo tự động

echo "============================================"
echo "  DEMO: Bảo mật Container Web"
echo "============================================"

echo ""
echo "[1/6] Building insecure image..."
docker build -f Dockerfile.insecure -t demo:insecure . -q

echo "[2/6] Building secure image..."
docker build -f Dockerfile.secure -t demo:secure . -q

echo ""
echo "=== SO SÁNH KÍCH THƯỚC IMAGE ==="
docker images | grep demo

echo ""
echo "[3/6] Scanning insecure image..."
trivy image --severity HIGH,CRITICAL demo:insecure 2>/dev/null | head -30

echo ""
echo "[4/6] Scanning secure image..."
trivy image --severity HIGH,CRITICAL demo:secure 2>/dev/null | head -30

echo ""
echo "=== KIỂM TRA USER ==="
echo "Insecure runs as: $(docker run --rm demo:insecure whoami)"
echo "Secure runs as: $(docker run --rm demo:secure whoami)"

echo ""
echo "============================================"
echo "  DEMO HOÀN TẤT"
echo "============================================"
```

---

## 7. TÀI LIỆU THAM KHẢO

### 7.1 Official Documentation
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)
- [HashiCorp Vault](https://www.vaultproject.io/docs)

### 7.2 Tools
- [Trivy - Container Scanner](https://github.com/aquasecurity/trivy)
- [Snyk - Security Platform](https://snyk.io/)
- [Docker Bench Security](https://github.com/docker/docker-bench-security)

### 7.3 Articles
- [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)

---

## 8. CHECKLIST NỘP BÀI

### Báo cáo (Word/PDF)
- [ ] Trang bìa, mục lục
- [ ] Giới thiệu đề tài
- [ ] Lý thuyết về Docker security
- [ ] Phần 1: Image Hardening
- [ ] Phần 2: Secret Management  
- [ ] Phần 3: Runtime Security
- [ ] Kết luận và kiến nghị
- [ ] Tài liệu tham khảo
- [ ] Phụ lục (code, screenshots)

### Source Code
- [ ] Dockerfile trước/sau hardening
- [ ] docker-compose files
- [ ] Script demo
- [ ] README hướng dẫn chạy

### Slides
- [ ] 15-20 slides PowerPoint
- [ ] Có hình ảnh minh họa
- [ ] Có bảng so sánh trước/sau

### Demo
- [ ] Chạy được trên máy
- [ ] Có script tự động
- [ ] Chuẩn bị câu hỏi thường gặp

---

## 📝 GHI CHÚ CUỐI

1. **Thời gian ước tính**: 1-2 tuần cho cả nhóm
2. **Độ khó**: Trung bình
3. **Điểm mạnh của đề tài**: 
   - Rất thực tế, áp dụng được ngay
   - Nhiều công cụ hỗ trợ
   - Dễ demo trực quan
4. **Lưu ý**: 
   - KHÔNG commit secret lên Git
   - Test kỹ demo trước khi trình bày
   - Chuẩn bị plan B nếu demo lỗi

---

**Chúc nhóm hoàn thành tốt đề tài! 🚀**
