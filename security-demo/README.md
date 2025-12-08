# Demo Bao mat Container Web (Docker)

## Mon hoc: Phat trien phan mem web an toan
## De tai: Bao mat Container Web - Demo Hardening Image va Secret Management
## Project: E-Learning Platform

---

## Gioi thieu

Project nay demo cac ky thuat bao mat container web SU DUNG TRUC TIEP project E-Learning:

| # | Chu de | Mo ta |
|---|--------|-------|
| 1 | **Image Hardening** | Toi uu va bao mat Docker image cho elearning-backend |
| 2 | **Secret Management** | Quan ly DB password, JWT secret, API keys an toan |
| 3 | **Runtime Security** | Bao mat container khi chay (network, resources, capabilities) |

---

## Yeu cau he thong

### Bat buoc
- Docker Desktop (Windows/Mac) hoac Docker Engine (Linux)
- Docker Compose v2+
- Project E-Learning (da co san)

### Khuyen nghi (de scan lo hong)
```bash
# Windows (voi Chocolatey)
choco install trivy

# Mac (voi Homebrew)
brew install trivy
```

---

## Cau truc thu muc

```
elearning-project/
├── elearning-backend/           # Backend thuc cua project
├── elearning-frontend/          # Frontend thuc cua project
├── docker-compose.yml           # Docker compose goc
│
└── security-demo/               # THU MUC DEMO BAO MAT
    ├── 1-image-hardening/
    │   ├── Dockerfile.insecure  # Demo khong an toan
    │   ├── Dockerfile.secure    # Demo da hardening
    │   └── README.md
    │
    ├── 2-secret-management/
    │   ├── docker-compose.insecure.yml
    │   ├── docker-compose.secure.yml
    │   └── README.md
    │
    ├── 3-runtime-security/
    │   ├── docker-compose.full-security.yml
    │   └── README.md
    │
    ├── secrets/                 # Secret files (KHONG commit)
    │   ├── db-password.txt
    │   ├── jwt-secret.txt
    │   ├── cloudinary-secret.txt
    │   └── vnpay-secret.txt
    │
    ├── demo.ps1                 # Script demo (Windows)
    └── README.md                # File nay
```

---

## Huong dan chay demo

### Windows (PowerShell)

```powershell
cd d:\elearning-project\security-demo

# Chay TAT CA demo
.\demo.ps1 all

# Hoac chay tung phan
.\demo.ps1 1        # Demo Image Hardening
.\demo.ps1 2        # Demo Secret Management
.\demo.ps1 3        # Demo Runtime Security

# Don dep sau demo
.\demo.ps1 cleanup
```

---

## Noi dung demo chi tiet

### Demo 1: Image Hardening

**So sanh TRUOC va SAU khi hardening elearning-backend:**

| Metric | Insecure (node:20) | Secure (alpine) | Cai thien |
|--------|-------------------|-----------------|-----------|
| Image Size | ~1.5GB | ~200MB | -85% |
| CVE Count | 50+ | 5-10 | -80% |
| Running as | root | appuser | An toan |
| Multi-stage | No | Yes | Toi uu |
| Health Check | No | Yes | Giam sat |

**Commands demo:**
```bash
# So sanh kich thuoc
docker images | findstr elearning

# So sanh user
docker run --rm elearning:insecure whoami  # root
docker run --rm elearning:secure whoami    # appuser

# Scan lo hong
trivy image --severity HIGH,CRITICAL elearning:insecure
trivy image --severity HIGH,CRITICAL elearning:secure
```

### Demo 2: Secret Management

**So sanh cach quan ly secrets cua E-Learning:**

| Aspect | Insecure | Secure |
|--------|----------|--------|
| DB_PASSWORD | Hardcode trong compose | Docker Secrets |
| JWT_SECRET | Plain text | /run/secrets/jwt-secret |
| docker inspect | Thay password | Chi thay _FILE path |
| Git commit | Lo secrets | An toan (.gitignore) |

**Commands demo:**
```bash
# Kiem tra insecure - thay password
docker inspect insecure-elearning-backend | findstr "PASSWORD"
# Output: DB_PASSWORD=SuperSecretPassword123!

# Kiem tra secure - chi thay path
docker inspect secure-elearning-backend | findstr "PASSWORD"
# Output: DB_PASSWORD_FILE=/run/secrets/db-password
```

### Demo 3: Runtime Security

**Cac ky thuat bao mat runtime cho E-Learning:**

1. **Network Isolation**: 
   - Frontend: public network
   - Backend: public + internal
   - Database: CHI internal (khong expose port)

2. **Resource Limits**: 
   - Backend: max 1 CPU, 1GB RAM
   - Database: max 1 CPU, 1GB RAM

3. **Security Options**:
   - no-new-privileges: true
   - Drop ALL capabilities
   - Chi add NET_BIND_SERVICE

**Commands demo:**
```bash
# Database khong co port exposed
docker port secure-elearning-database
# Output: (empty) - An toan!

# Kiem tra resource limits
docker stats --no-stream

# Kiem tra security options
docker inspect secure-elearning-backend --format "{{.HostConfig.SecurityOpt}}"
```

---

## Tai lieu tham khao

- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [Trivy Container Scanner](https://github.com/aquasecurity/trivy)

---

## Nhom thuc hien

| STT | Ho ten | MSSV | Nhiem vu |
|-----|--------|------|----------|
| 1 | ... | ... | Image Hardening |
| 2 | ... | ... | Secret Management |
| 3 | ... | ... | Runtime Security + Tong hop |

---

**Mon hoc**: Phat trien phan mem web an toan  
**Nam hoc**: 2024-2025
