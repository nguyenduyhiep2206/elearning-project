# E-Learning Platform with Container Security Demo

**Đề tài:** Bảo mật Container Web (Docker) – Demo hardening image và secret management

**Môn học:** Phát triển phần mềm web an toàn

---

## 👥 Danh sách thành viên nhóm

| STT | Họ tên | MSSV | Nhiệm vụ |
|-----|--------|------|----------|
| 1 | Nguyễn Thị Trinh | 22810310410 | Image Hardening |
| 2 | Trịnh Hoài Nam | 22810310433 | Secret Management |
| 3 | Nguyễn Duy Hiệp | 22810310354 | Runtime Security + Tổng hợp |

**Nhóm trưởng:** Nguyễn Duy Hiệp

---

## 📋 Phân chia công việc

### 👤 Thành viên 1: Docker Image Hardening
**Thời gian:**
- Nghiên cứu lý thuyết về hardening image
- Multi-stage builds và tối ưu Dockerfile
- Non-root user implementation
- Minimal base image (Alpine Linux)
- Security scanning với Trivy

### 👤 Thành viên 2: Secret Management
**Thời gian:**
- Nghiên cứu các phương pháp quản lý secret
- Docker Secrets implementation
- Environment variables best practices
- So sánh hardcoded vs secure
- .gitignore và bảo vệ file .env

### 👤 Thành viên 3: Runtime Security & Tổng hợp
**Thời gian:**
- Nghiên cứu runtime security
- Network isolation với Docker networks
- Resource limits và capabilities
- Read-only filesystem
- Tổng hợp báo cáo và chuẩn bị demo

---

## 🚀 Hướng dẫn sử dụng

### Yêu cầu hệ thống
- **Docker Desktop** (Windows/Mac) hoặc Docker Engine (Linux)
- **Docker Compose** v2+
- **Trivy** (tùy chọn, để scan vulnerabilities)
- **Node.js** (tùy chọn, để chạy local development)

### Cài đặt và chạy

#### Option 1: Chạy với Docker

```bash
# 1. Clone repository
git clone https://github.com/nguyenduyhiep2206/elearning-project
cd elearning-project

# 2. Chạy toàn bộ hệ thống
docker-compose up --build

# 3. Truy cập ứng dụng
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000/api/v1
```

#### Option 2: Chạy local development (Khuyến nghị)

```bash
# 1. Cài đặt dependencies
cd elearning-frontend && npm install
cd ../elearning-backend && npm install

# 2. Chạy frontend
cd elearning-frontend && npm run dev

# 3. Chạy backend (terminal khác)
cd elearning-backend && npm run dev
```

### Demo bảo mật container

```bash
# Vào thư mục demo
cd security-demo

# Chạy tất cả demo
.\demo.ps1 all

# Hoặc chạy từng phần
.\demo.ps1 1    # Image Hardening
.\demo.ps1 2    # Secret Management
.\demo.ps1 3    # Runtime Security
```

---

## 📸 Kết quả demo

### 1. Image Hardening Results

**Before vs After Comparison:**
```
Image Size:     1.5GB → 200MB   (giảm 85%)
Vulnerabilities: 188 → 0       (giảm 100%)
User:           root → appuser  (an toàn hơn)
```

<img width="857" height="387" alt="image" src="https://github.com/user-attachments/assets/b344c549-b754-40ea-83bc-af26c8374226" />


**Vulnerability Scan Results:**
![Vulnerability Scan](https://via.placeholder.com/600x300?text=Vulnerability+Scan+Results)

### 2. Secret Management Demo

**Insecure vs Secure:**
- **INSECURE**: `docker inspect` hiển thị password rõ ràng
- **SECURE**: Chỉ hiển thị file path, password được bảo vệ

![Secret Management Demo](https://via.placeholder.com/600x300?text=Secret+Management+Demo)

### 3. Runtime Security Demo

**Network Isolation:**
- Database không expose port ra ngoài
- Chỉ backend mới truy cập được database

**Resource Limits:**
```
Frontend: CPU 0.5, RAM 512MB
Backend:  CPU 1.0, RAM 1GB
Database: CPU 1.0, RAM 1GB
```

![Runtime Security Demo](https://via.placeholder.com/600x300?text=Runtime+Security+Demo)

---

## 🏗️ Cấu trúc project

```
elearning-project/
├── elearning-frontend/          # React frontend
├── elearning-backend/           # Node.js backend
├── security-demo/               # Demo bảo mật container
│   ├── 1-image-hardening/       # Hardening image demo
│   ├── 2-secret-management/     # Secret management demo
│   ├── 3-runtime-security/      # Runtime security demo
│   ├── secrets/                 # Secret files
│   └── demo.ps1                 # Demo script
├── docker-compose.yml           # Docker compose chính
└── README.md                    # File này
```

---

## 🔧 Công nghệ sử dụng

### Frontend
- **React** 18+
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

### Backend
- **Node.js** 20+
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Passport.js** - OAuth integration

### Container Security
- **Docker** - Containerization
- **Trivy** - Vulnerability scanner
- **Docker Secrets** - Secret management
- **CIS Docker Benchmark** - Security standards

---

## 📊 Metrics & Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Image Size | 1.5GB | 200MB | -85% |
| OS Vulnerabilities | 188 | 0 | -100% |
| Security Configurations | Basic | Advanced | ✅ |
| Secret Exposure | High | None | ✅ |
| Runtime Security | None | Full | ✅ |

